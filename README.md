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

## Deploy na VPS

O projeto usa imagens Docker pré-construídas pelo GitHub Actions e publicadas no **GitHub Container Registry (GHCR)**. O deploy na VPS é feito com o script `deploy.sh` incluso no repositório.

### Pré-requisitos

| Requisito | Mínimo |
|-----------|--------|
| VPS Linux | Ubuntu 22.04+ / Debian 12+ |
| RAM | 2 GB |
| Disco | 20 GB |
| Domínio | Apontando para o IP da VPS (registro A) |
| Conta GitHub | Com acesso ao repositório (para pull das imagens GHCR) |

### Arquitetura de produção

```
Internet ──► Nginx (:80/:443) ──┬── Frontend (ghcr.io/.../frontend:latest)
                                 └── Backend  (ghcr.io/.../backend:latest)
                                      ├── PostgreSQL 16
                                      └── Redis 7
Certbot ── renovação automática de SSL a cada 12h
```

Todas as imagens são construídas automaticamente pelo GitHub Actions a cada push na `main` e publicadas em:
- `ghcr.io/cheri-hub/leaf-ecommerce/frontend:latest`
- `ghcr.io/cheri-hub/leaf-ecommerce/backend:latest`

---

### Passo 1 — Setup inicial

Acesse a VPS via SSH e execute:

```bash
# Baixar o script de deploy
curl -fsSL https://raw.githubusercontent.com/cheri-hub/leaf-ecommerce/main/deploy.sh -o deploy.sh
chmod +x deploy.sh

# Executar setup (instala Docker, clona o repo)
sudo ./deploy.sh setup
```

O setup instala Docker, Docker Compose, git e clona o repositório em `/opt/leaf-ecommerce`.

---

### Passo 2 — Configurar variáveis de ambiente

```bash
cd /opt/leaf-ecommerce
cp .env.example .env
nano .env
```

Preencha todas as variáveis:

```env
# Domínio (sem https://)
DOMAIN=leaf-parfum.cherihub.cloud

# PostgreSQL
DB_PASSWORD=senha_segura_gerada          # use: openssl rand -base64 32
POSTGRES_DB=ecommerce
POSTGRES_USER=app

# Connection strings (substitua a senha)
CONNECTION_STRING=Host=postgres;Database=ecommerce;Username=app;Password=senha_segura_gerada
REDIS_CONNECTION=redis:6379

# JWT (mín. 32 caracteres)
JWT_SECRET=chave_jwt_segura_gerada       # use: openssl rand -base64 48
JWT_ISSUER=leaf-ecommerce
JWT_AUDIENCE=leaf-ecommerce

# AbacatePay (obtenha no painel da AbacatePay)
ABACATEPAY_API_KEY=sk_live_sua_chave
ABACATEPAY_WEBHOOK_SECRET=whsec_seu_secret

# URLs
FRONTEND_URL=https://leaf-parfum.cherihub.cloud
NEXT_PUBLIC_API_URL=https://leaf-parfum.cherihub.cloud

# ASP.NET
ASPNETCORE_ENVIRONMENT=Production
ASPNETCORE_URLS=http://+:5000
```

---

### Passo 3 — Login no GitHub Container Registry

As imagens Docker são privadas no GHCR. Autentique-se com um Personal Access Token (PAT) do GitHub com permissão `read:packages`:

```bash
# Gere um PAT em: GitHub → Settings → Developer settings → Personal access tokens
docker login ghcr.io -u SEU_USUARIO_GITHUB
# Cole o PAT quando solicitado
```

---

### Passo 4 — Certificado SSL

```bash
sudo ./deploy.sh ssl
```

Isso obtém automaticamente um certificado Let's Encrypt para o domínio configurado no `.env`. O Certbot renova automaticamente a cada 12 horas.

> **Importante:** O domínio já deve estar apontando para o IP da VPS antes deste passo.

---

### Passo 5 — Deploy

```bash
sudo ./deploy.sh deploy
```

Isso puxa as imagens mais recentes do GHCR e sobe todos os containers (frontend, backend, PostgreSQL, Redis, Nginx, Certbot).

---

### Comandos do deploy.sh

| Comando | Descrição |
|---------|-----------|
| `./deploy.sh setup` | Instalação inicial (Docker, git, clone do repo) |
| `./deploy.sh ssl` | Obter certificado SSL via Let's Encrypt |
| `./deploy.sh deploy` | Deploy completo (pull imagens + up containers) |
| `./deploy.sh update` | Atualização rápida (pull + restart) |
| `./deploy.sh logs` | Ver logs de todos os containers |
| `./deploy.sh logs backend` | Ver logs de um container específico |
| `./deploy.sh status` | Verificar status dos serviços + health check |
| `./deploy.sh backup` | Backup do banco PostgreSQL em `/opt/leaf-ecommerce/backups/` |
| `./deploy.sh restart` | Reiniciar todos os containers |

---

### Fluxo de atualização

Após um push para `main`:

1. O GitHub Actions builda e publica novas imagens no GHCR automaticamente
2. Na VPS, execute:

```bash
cd /opt/leaf-ecommerce
sudo ./deploy.sh update
```

Isso puxa as imagens atualizadas e reinicia os containers sem downtime nos serviços de dados (PostgreSQL e Redis mantêm os volumes).

---

### docker-compose.yml (produção)

O `docker-compose.yml` do repositório já está configurado para puxar imagens do GHCR:

```yaml
services:
  frontend:
    image: ghcr.io/cheri-hub/leaf-ecommerce/frontend:latest

  backend:
    image: ghcr.io/cheri-hub/leaf-ecommerce/backend:latest

  postgres:
    image: postgres:16-alpine

  redis:
    image: redis:7-alpine

  nginx:
    image: nginx:alpine
    # Monta nginx.conf e certificados SSL

  certbot:
    image: certbot/certbot
    # Renovação automática de SSL
```

Nenhum build local é necessário — todas as imagens são pré-construídas pelo CI/CD.

---

### CI/CD — GitHub Actions

O workflow `.github/workflows/build-and-push.yml` é executado automaticamente:

- **Em PRs para `main`:** roda testes do backend (57 testes)
- **Em push para `main`:** builda e publica imagens Docker no GHCR

As imagens recebem duas tags:
- `latest` — sempre a versão mais recente
- SHA do commit — para rollback se necessário

---

### Troubleshooting

```bash
# Ver logs em tempo real
sudo ./deploy.sh logs

# Verificar se os containers estão rodando
sudo ./deploy.sh status

# Reiniciar tudo
sudo ./deploy.sh restart

# Verificar saúde do backend
curl -f http://localhost:5000/health

# Ver logs de um serviço específico
docker compose logs -f backend

# Acessar o banco diretamente
docker compose exec postgres psql -U app ecommerce

# Restaurar um backup
cat backups/backup_20260314_120000.sql | docker compose exec -T postgres psql -U app ecommerce
```

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
| `App__FrontendUrl` | URL do frontend (para CORS) | `https://leaf-parfum.cherihub.cloud` |
| `ASPNETCORE_ENVIRONMENT` | Ambiente do ASP.NET | `Production` |
| `ASPNETCORE_URLS` | URLs de escuta | `http://+:5000` |

### Frontend (produção)

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `NEXT_PUBLIC_API_URL` | URL pública do backend | `https://leaf-parfum.cherihub.cloud` |
