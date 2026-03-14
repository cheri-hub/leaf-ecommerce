#!/bin/bash
# ================================================
# Leaf E-commerce — Deploy Script for VPS
# ================================================
# Usage:
#   1. Copy this script to your VPS
#   2. chmod +x deploy.sh
#   3. ./deploy.sh setup    (first time: install deps + SSL)
#   4. ./deploy.sh deploy   (deploy/update the app)
#   5. ./deploy.sh logs     (view logs)
#   6. ./deploy.sh status   (check service status)
# ================================================

set -euo pipefail

REPO_URL="https://github.com/cheri-hub/leaf-ecommerce.git"
APP_DIR="/opt/leaf-ecommerce"
BRANCH="main"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log()   { echo -e "${GREEN}[DEPLOY]${NC} $1"; }
warn()  { echo -e "${YELLOW}[AVISO]${NC} $1"; }
error() { echo -e "${RED}[ERRO]${NC} $1"; exit 1; }

# ---------------------------------------------------
# SETUP: Install Docker, clone repo, configure SSL
# ---------------------------------------------------
cmd_setup() {
    log "Instalando dependências do sistema..."

    # Update system
    apt-get update -y && apt-get upgrade -y

    # Install Docker if not present
    if ! command -v docker &> /dev/null; then
        log "Instalando Docker..."
        curl -fsSL https://get.docker.com | sh
        systemctl enable docker
        systemctl start docker
    else
        log "Docker já instalado."
    fi

    # Install Docker Compose plugin if not present
    if ! docker compose version &> /dev/null; then
        log "Instalando Docker Compose plugin..."
        apt-get install -y docker-compose-plugin
    else
        log "Docker Compose já instalado."
    fi

    # Install git
    apt-get install -y git

    # Clone repository
    if [ ! -d "$APP_DIR" ]; then
        log "Clonando repositório..."
        git clone "$REPO_URL" "$APP_DIR"
    else
        log "Repositório já existe em $APP_DIR"
    fi

    cd "$APP_DIR"

    # Check for .env file
    if [ ! -f ".env" ]; then
        warn "Arquivo .env não encontrado!"
        warn "Copie .env.example para .env e preencha os valores:"
        warn "  cp .env.example .env"
        warn "  nano .env"
        warn ""
        warn "Depois execute: ./deploy.sh ssl"
        exit 1
    fi

    log "Setup concluído! Próximos passos:"
    log "  1. Configure o .env: nano $APP_DIR/.env"
    log "  2. Login no GHCR: docker login ghcr.io -u YOUR_GITHUB_USER"
    log "  3. Obtenha SSL: ./deploy.sh ssl"
    log "  4. Deploy: ./deploy.sh deploy"
}

# ---------------------------------------------------
# SSL: Obtain Let's Encrypt certificate
# ---------------------------------------------------
cmd_ssl() {
    cd "$APP_DIR"

    if [ ! -f ".env" ]; then
        error "Arquivo .env não encontrado. Execute ./deploy.sh setup primeiro."
    fi

    source .env

    if [ -z "${DOMAIN:-}" ]; then
        error "Variável DOMAIN não definida no .env"
    fi

    log "Obtendo certificado SSL para $DOMAIN..."

    # Create temporary nginx config for ACME challenge
    mkdir -p nginx certbot/conf certbot/www

    cat > nginx/nginx-temp.conf <<'NGINX'
worker_processes 1;
events { worker_connections 128; }
http {
    server {
        listen 80;
        server_name _;
        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }
        location / {
            return 200 'OK';
            add_header Content-Type text/plain;
        }
    }
}
NGINX

    # Start temporary nginx
    docker run -d --name leaf-nginx-temp \
        -p 80:80 \
        -v "$APP_DIR/nginx/nginx-temp.conf:/etc/nginx/nginx.conf:ro" \
        -v "$APP_DIR/certbot/www:/var/www/certbot" \
        nginx:alpine

    # Request certificate
    docker run --rm \
        -v "$APP_DIR/certbot/conf:/etc/letsencrypt" \
        -v "$APP_DIR/certbot/www:/var/www/certbot" \
        certbot/certbot certonly \
        --webroot -w /var/www/certbot \
        -d "$DOMAIN" \
        --email "admin@$DOMAIN" \
        --agree-tos \
        --no-eff-email

    # Cleanup temp nginx
    docker stop leaf-nginx-temp && docker rm leaf-nginx-temp
    rm -f nginx/nginx-temp.conf

    # Update nginx.conf with actual domain
    sed -i "s/\${DOMAIN}/$DOMAIN/g" nginx/nginx.conf

    log "Certificado SSL obtido com sucesso para $DOMAIN!"
    log "Execute: ./deploy.sh deploy"
}

# ---------------------------------------------------
# DEPLOY: Build and start all services
# ---------------------------------------------------
cmd_deploy() {
    cd "$APP_DIR"

    if [ ! -f ".env" ]; then
        error "Arquivo .env não encontrado. Execute ./deploy.sh setup primeiro."
    fi

    log "Atualizando código..."
    git fetch origin "$BRANCH"
    git reset --hard "origin/$BRANCH"

    log "Baixando imagens do GitHub Container Registry..."
    docker compose pull
    docker compose up -d

    log "Aguardando serviços ficarem prontos..."
    sleep 10

    # Health check
    if curl -sf http://localhost:5000/health > /dev/null 2>&1; then
        log "Backend: OK"
    else
        warn "Backend ainda iniciando... verifique com: ./deploy.sh logs backend"
    fi

    log "Deploy concluído!"
    log "Acesse: https://$(grep DOMAIN .env | cut -d= -f2)"
}

# ---------------------------------------------------
# UPDATE: Quick update without full rebuild
# ---------------------------------------------------
cmd_update() {
    cd "$APP_DIR"

    log "Atualizando código..."
    git fetch origin "$BRANCH"
    git reset --hard "origin/$BRANCH"

    log "Baixando imagens atualizadas..."
    docker compose pull
    docker compose up -d

    log "Atualização concluída!"
}

# ---------------------------------------------------
# LOGS: View container logs
# ---------------------------------------------------
cmd_logs() {
    cd "$APP_DIR"
    local service="${1:-}"

    if [ -n "$service" ]; then
        docker compose logs -f --tail=100 "$service"
    else
        docker compose logs -f --tail=100
    fi
}

# ---------------------------------------------------
# STATUS: Check service health
# ---------------------------------------------------
cmd_status() {
    cd "$APP_DIR"
    echo ""
    log "Status dos containers:"
    docker compose ps
    echo ""

    if curl -sf http://localhost:5000/health > /dev/null 2>&1; then
        log "Health check backend: ${GREEN}OK${NC}"
    else
        warn "Health check backend: FALHOU"
    fi
}

# ---------------------------------------------------
# BACKUP: Dump PostgreSQL database
# ---------------------------------------------------
cmd_backup() {
    cd "$APP_DIR"
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_dir="$APP_DIR/backups"
    mkdir -p "$backup_dir"

    log "Criando backup do banco de dados..."
    docker compose exec -T postgres pg_dump -U app ecommerce > "$backup_dir/backup_$timestamp.sql"
    log "Backup salvo em: $backup_dir/backup_$timestamp.sql"
}

# ---------------------------------------------------
# RESTART: Restart all services
# ---------------------------------------------------
cmd_restart() {
    cd "$APP_DIR"
    log "Reiniciando todos os serviços..."
    docker compose restart
    log "Serviços reiniciados!"
}

# ---------------------------------------------------
# MAIN
# ---------------------------------------------------
case "${1:-help}" in
    setup)   cmd_setup ;;
    ssl)     cmd_ssl ;;
    deploy)  cmd_deploy ;;
    update)  cmd_update ;;
    logs)    cmd_logs "${2:-}" ;;
    status)  cmd_status ;;
    backup)  cmd_backup ;;
    restart) cmd_restart ;;
    help|*)
        echo ""
        echo "Leaf E-commerce — Deploy Script"
        echo ""
        echo "Uso: $0 <comando>"
        echo ""
        echo "Comandos:"
        echo "  setup     Instala Docker, clona repo, configuração inicial"
        echo "  ssl       Obtém certificado Let's Encrypt"
        echo "  deploy    Build completo e deploy de todos os serviços"
        echo "  update    Atualização rápida (rebuild apenas o necessário)"
        echo "  logs      Ver logs dos containers (use: logs <service>)"
        echo "  status    Verificar status dos serviços"
        echo "  backup    Backup do banco de dados PostgreSQL"
        echo "  restart   Reiniciar todos os serviços"
        echo ""
        ;;
esac
