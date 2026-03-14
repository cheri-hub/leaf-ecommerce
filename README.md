# 🌿 Leaf E-commerce

E-commerce B2C completo com frontend Next.js e backend ASP.NET Core, integrado com AbacatePay para pagamentos.

---

## Pré-requisitos

| Ferramenta | Versão mínima | Verificar |
|------------|--------------|-----------|
| **Node.js** | 22+ | `node -v` |
| **.NET SDK** | 10.0 | `dotnet --version` |
| **PostgreSQL** | 16+ | `psql --version` |
| **Redis** | 7+ | `redis-cli ping` |
| **Docker** *(opcional, para deploy)* | 24+ | `docker --version` |

---

## Rodando pela primeira vez

### 1. Clonar o repositório

```bash
git clone https://github.com/seu-usuario/leaf-ecommerce.git
cd leaf-ecommerce
```

### 2. Configurar o banco de dados

Crie o banco PostgreSQL e o usuário:

```sql
CREATE USER app WITH PASSWORD 'dev_password';
CREATE DATABASE ecommerce OWNER app;
```

Certifique-se de que o Redis está rodando na porta padrão (6379).

### 3. Backend

```bash
cd backend

# Restaurar dependências
dotnet restore

# Aplicar migrations (cria as tabelas no banco)
dotnet ef database update --project src/EcommerceApi

# Rodar o backend (porta 5000)
dotnet run --project src/EcommerceApi
```

O backend estará disponível em `http://localhost:5000`.

**Endpoints úteis em dev:**
- `http://localhost:5000/health` — Health check
- `http://localhost:5000/scalar` — Documentação interativa da API (Scalar)
- `http://localhost:5000/hangfire` — Dashboard de jobs em background

#### Configuração do backend

O arquivo `backend/src/EcommerceApi/appsettings.Development.json` já vem com valores padrão para desenvolvimento:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=ecommerce;Username=app;Password=dev_password",
    "Redis": "localhost:6379"
  },
  "Jwt": {
    "Secret": "CHANGE-THIS-TO-A-SECURE-KEY-AT-LEAST-32-CHARS-LONG!!",
    "Issuer": "leaf-ecommerce",
    "Audience": "leaf-ecommerce"
  },
  "AbacatePay": {
    "ApiKey": "sk_dev_REPLACE_ME",
    "WebhookSecret": "whsec_REPLACE_ME"
  },
  "App": {
    "FrontendUrl": "http://localhost:3003"
  }
}
```

> **Importante:** Substitua `AbacatePay:ApiKey` e `AbacatePay:WebhookSecret` pelas suas chaves reais do [AbacatePay](https://abacatepay.com) para testar pagamentos.

### 4. Frontend

```bash
cd frontend

# Instalar dependências
npm install

# Rodar o frontend em modo dev (porta 3000 por padrão)
npm run dev
```

O frontend estará disponível em `http://localhost:3000`.

#### Variáveis de ambiente do frontend

Crie o arquivo `frontend/.env.local` se precisar apontar para outra URL de backend:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 5. Verificar que tudo funciona

1. Acesse `http://localhost:3000` — deve carregar a home do e-commerce
2. Acesse `http://localhost:5000/health` — deve retornar `Healthy`
3. Cadastre uma conta em `/register` e faça login em `/login`

---

## Testes

### Backend

```bash
cd backend

# Rodar todos os testes (unit + integration)
dotnet test

# Rodar apenas testes unitários
dotnet test --filter "FullyQualifiedName~Unit"

# Rodar apenas testes de integração
dotnet test --filter "FullyQualifiedName~Integration"

# Com verbosidade detalhada
dotnet test --verbosity detailed
```

Os testes ficam em `backend/tests/EcommerceApi.Tests/`:
- `Unit/` — Testes de Services e Validators
- `Integration/` — Testes de Endpoints com `WebApplicationFactory`

### Frontend

```bash
cd frontend

# Lint (ESLint)
npm run lint

# Build de verificação (valida que compila sem erros)
npm run build
```

> **Nota:** Testes unitários com Vitest + Testing Library ainda não foram configurados no frontend.

---

## Deploy

### Opção 1: Docker Compose (recomendado)

Crie o arquivo `docker-compose.yml` na raiz do projeto:

```yaml
services:
  frontend:
    build: ./frontend
    ports:
      - "3003:3003"
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:5000
    depends_on:
      - backend
    restart: unless-stopped

  backend:
    build: ./backend
    ports:
      - "5000:5000"
    depends_on:
      - postgres
      - redis
    environment:
      - ASPNETCORE_ENVIRONMENT=Production
      - ASPNETCORE_URLS=http://+:5000
      - ConnectionStrings__DefaultConnection=Host=postgres;Database=ecommerce;Username=app;Password=${DB_PASSWORD}
      - ConnectionStrings__Redis=redis:6379
      - Jwt__Secret=${JWT_SECRET}
      - Jwt__Issuer=leaf-ecommerce
      - Jwt__Audience=leaf-ecommerce
      - AbacatePay__ApiKey=${ABACATEPAY_API_KEY}
      - AbacatePay__WebhookSecret=${ABACATEPAY_WEBHOOK_SECRET}
      - App__FrontendUrl=${FRONTEND_URL}
    restart: unless-stopped

  postgres:
    image: postgres:16-alpine
    volumes:
      - pgdata:/var/lib/postgresql/data
    environment:
      POSTGRES_DB: ecommerce
      POSTGRES_USER: app
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    volumes:
      - redisdata:/data
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./certbot:/etc/letsencrypt
    depends_on:
      - frontend
      - backend
    restart: unless-stopped

volumes:
  pgdata:
  redisdata:
```

Crie o arquivo `.env` na raiz (nunca commite este arquivo):

```env
DB_PASSWORD=sua_senha_segura_aqui
JWT_SECRET=uma-chave-secreta-com-pelo-menos-32-caracteres
ABACATEPAY_API_KEY=sk_live_sua_chave
ABACATEPAY_WEBHOOK_SECRET=whsec_seu_secret
FRONTEND_URL=https://seudominio.com.br
```

Crie o arquivo `nginx/nginx.conf`:

```nginx
events {
    worker_connections 1024;
}

http {
    upstream frontend {
        server frontend:3003;
    }

    upstream backend {
        server backend:5000;
    }

    server {
        listen 80;
        server_name seudominio.com.br;

        # Redirecionar HTTP para HTTPS
        return 301 https://$host$request_uri;
    }

    server {
        listen 443 ssl;
        server_name seudominio.com.br;

        ssl_certificate /etc/letsencrypt/live/seudominio.com.br/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/seudominio.com.br/privkey.pem;

        # API backend
        location /api/ {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Health check
        location /health {
            proxy_pass http://backend;
        }

        # Hangfire dashboard
        location /hangfire {
            proxy_pass http://backend;
        }

        # Frontend (tudo que não é API)
        location / {
            proxy_pass http://frontend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

#### Subir tudo

```bash
# Build e start de todos os containers
docker compose up -d --build

# Aplicar migrations no banco dentro do container
docker compose exec backend dotnet ef database update

# Ver logs
docker compose logs -f

# Parar tudo
docker compose down
```

### Opção 2: Deploy manual na VPS

```bash
# 1. No servidor, instalar Docker e Docker Compose

# 2. Clonar o repositório
git clone https://github.com/seu-usuario/leaf-ecommerce.git
cd leaf-ecommerce

# 3. Criar arquivo .env com as variáveis de produção (ver acima)

# 4. Configurar HTTPS com Certbot
sudo apt install certbot
sudo certbot certonly --standalone -d seudominio.com.br
# Os certificados ficam em /etc/letsencrypt/live/seudominio.com.br/

# 5. Criar o nginx.conf apontando para o domínio correto

# 6. Subir
docker compose up -d --build
```

### CI/CD com GitHub Actions

Crie `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup .NET
        uses: actions/setup-dotnet@v4
        with:
          dotnet-version: '10.0.x'

      - name: Backend tests
        run: dotnet test
        working-directory: backend

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'

      - name: Frontend build
        run: |
          npm ci
          npm run build
        working-directory: frontend

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy via SSH
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            cd /opt/leaf-ecommerce
            git pull origin main
            docker compose up -d --build
```

Configure os secrets no GitHub: `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`.

---

## Arquitetura

```
Usuário ──► Nginx (:80/:443) ──┬── Next.js (:3003) ← Frontend
                                └── ASP.NET (:5000) ← Backend API
AbacatePay ──► POST /api/webhooks/abacatepay ──► Backend
Backend ──► PostgreSQL (:5432) + Redis (:6379)
```

| Camada | Tecnologia | Porta |
|--------|-----------|-------|
| Frontend | Next.js 16 (App Router, React 19, Tailwind 4) | 3003 |
| Backend | ASP.NET Core 10 (Minimal APIs, EF Core) | 5000 |
| Banco | PostgreSQL 16 | 5432 |
| Cache | Redis 7 | 6379 |
| Proxy | Nginx | 80/443 |
| Jobs | Hangfire (PostgreSQL storage) | — |
| Pagamentos | AbacatePay | — |

---

## Estrutura do projeto

```
leaf-ecommerce/
├── backend/
│   ├── src/EcommerceApi/        ← Código da API
│   │   ├── Endpoints/           ← Minimal API endpoints
│   │   ├── Services/            ← Lógica de negócio
│   │   ├── Models/              ← Domain, DTOs, AbacatePay
│   │   ├── Data/                ← DbContext, Configurations, Migrations
│   │   ├── Jobs/                ← Hangfire background jobs
│   │   └── Validators/          ← FluentValidation
│   ├── tests/EcommerceApi.Tests/
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── app/                 ← App Router (rotas e layouts)
│   │   ├── components/          ← Componentes React por feature
│   │   ├── lib/                 ← API client, utils, schemas
│   │   ├── stores/              ← Zustand (cart, auth, wishlist)
│   │   ├── hooks/               ← Custom hooks
│   │   └── types/               ← TypeScript types
│   └── Dockerfile
└── _abacate-pay-documentation/  ← Referência da API AbacatePay
```

---

## Variáveis de ambiente — referência completa

### Backend (produção)

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `ConnectionStrings__DefaultConnection` | PostgreSQL connection string | `Host=postgres;Database=ecommerce;Username=app;Password=...` |
| `ConnectionStrings__Redis` | Redis connection string | `redis:6379` |
| `Jwt__Secret` | Chave secreta para assinar tokens JWT (mín. 32 chars) | `minha-chave-super-secreta-32chars` |
| `Jwt__Issuer` | Emissor do JWT | `leaf-ecommerce` |
| `Jwt__Audience` | Audiência do JWT | `leaf-ecommerce` |
| `AbacatePay__ApiKey` | API key da AbacatePay | `sk_live_...` |
| `AbacatePay__WebhookSecret` | Secret para validar webhooks | `whsec_...` |
| `App__FrontendUrl` | URL do frontend (para CORS) | `https://seudominio.com.br` |
| `ASPNETCORE_ENVIRONMENT` | Ambiente do ASP.NET | `Production` |
| `ASPNETCORE_URLS` | URLs de escuta | `http://+:5000` |

### Frontend (produção)

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `NEXT_PUBLIC_API_URL` | URL pública do backend | `https://seudominio.com.br` |
