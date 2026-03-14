# Segurança — Leaf E-commerce

> Checklist de segurança para o ambiente de produção em `leaf-parfum.cherihub.cloud`.
> Última revisão: Março 2026

---

## Estado atual

| Área | Status | Observação |
|------|--------|------------|
| Autenticação JWT | ✅ Seguro | httpOnly, Secure, SameSite=Lax, 24h expiration |
| CORS | ✅ Seguro | Origem única via env (`App:FrontendUrl`) |
| Rate Limiting | ✅ Seguro | Auth: 10 req/min, Webhook: 100 req/min |
| Validação de Input | ✅ Seguro | FluentValidation em todos os endpoints |
| SQL Injection | ✅ Seguro | Zero raw SQL, EF Core parameterizado |
| Secrets | ✅ Seguro | Todos em .env, nada hardcoded no código |
| Webhook | ✅ Seguro | FixedTimeEquals + dedup Redis 24h |
| HTTPS/TLS | ✅ Seguro | TLS 1.2+, HSTS 2 anos, Let's Encrypt |
| Admin Protection | ✅ Seguro | Backend RequireAuthorization + Frontend guard |
| Docker | ✅ Seguro | Ports 127.0.0.1 only, frontend non-root |
| Data Protection Keys | ⚠️ Atenção | Efêmeras — reset tokens perdem validade ao reiniciar |

---

## 1. O que já está protegido

### Autenticação
- JWT armazenado em cookie `httpOnly` (não acessível via JavaScript)
- `Secure: true` em produção (só enviado via HTTPS)
- `SameSite: Lax` (proteção contra CSRF)
- Senha exige 8+ caracteres, dígito, maiúscula e minúscula
- Rate limiting de 10 req/min em login, register e forgot-password

### API
- CORS restrito à URL do frontend (`FRONTEND_URL` no .env)
- Validação FluentValidation em **todos** os endpoints públicos
- Admin endpoints protegidos por `RequireAuthorization("Admin")`
- Hangfire dashboard com filtro de autorização customizado

### Webhook AbacatePay
- Validação com `CryptographicOperations.FixedTimeEquals` (imune a timing attacks)
- Deduplicação via Redis (24h) — mesmo evento processado apenas uma vez
- `devMode: true` ignorado em produção

### Infraestrutura
- Portas dos containers vinculadas a `127.0.0.1` (não expostas à internet)
- Nginx como reverse proxy com SSL termination
- Security headers: HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy
- TLS 1.2+ com ciphers fortes, sem SSLv3/TLS 1.0/1.1

---

## 2. O que precisa de atenção

### 2.1 Data Protection Keys (PRIORIDADE ALTA)

**Problema:** As chaves do ASP.NET Data Protection são efêmeras (em memória). Quando o container reinicia, tokens de reset de senha e confirmação de email gerados anteriormente deixam de funcionar.

**Impacto:** Usuário pede "esqueci minha senha", container reinicia antes dele usar o link → link inválido.

**Solução:** Persistir as chaves em um volume Docker.

Adicionar ao `docker-compose.yml`:
```yaml
backend:
  volumes:
    - dataprotection:/root/.aspnet/DataProtection-Keys

volumes:
  dataprotection:
```

Ou, para usar Redis (mais resiliente):
```csharp
// Program.cs
builder.Services.AddDataProtection()
    .PersistKeysToStackExchangeRedis(
        ConnectionMultiplexer.Connect(builder.Configuration.GetConnectionString("Redis")!),
        "DataProtection-Keys")
    .SetApplicationName("leaf-ecommerce");
```

### 2.2 Backend rodando como root no container

**Problema:** O Dockerfile do backend não define um usuário non-root. Se houver uma vulnerabilidade de escape de container, o atacante teria acesso root.

**Risco:** Baixo (container isolado atrás de reverse proxy), mas boa prática corrigir.

**Solução:** Adicionar ao `backend/Dockerfile`:
```dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:10.0
RUN addgroup --system --gid 1001 appgroup && \
    adduser --system --uid 1001 --ingroup appgroup appuser
WORKDIR /app
COPY --from=build /app .
USER appuser
```

### 2.3 Renovação do certificado SSL

**Verificar:** O Certbot está com auto-renovação ativa?

```bash
# Na VPS, verificar renovação automática
sudo certbot renew --dry-run

# Se falhar, adicionar ao crontab
echo "0 3 * * * certbot renew --quiet --post-hook 'systemctl reload nginx'" | sudo crontab -
```

### 2.4 Backups do banco de dados

**Problema:** Se o volume `pgdata` for perdido, todos os dados são perdidos.

**Solução:** Configurar backup automático:

```bash
# Criar script /opt/leaf-ecommerce/backup.sh
#!/bin/bash
BACKUP_DIR="/opt/backups/leaf-ecommerce"
mkdir -p "$BACKUP_DIR"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

docker compose exec -T postgres pg_dump -U app ecommerce | gzip > "$BACKUP_DIR/ecommerce_$TIMESTAMP.sql.gz"

# Manter apenas os últimos 30 backups
ls -t "$BACKUP_DIR"/ecommerce_*.sql.gz | tail -n +31 | xargs -r rm

echo "Backup criado: ecommerce_$TIMESTAMP.sql.gz"
```

```bash
chmod +x /opt/leaf-ecommerce/backup.sh

# Agendar backup diário às 4h
echo "0 4 * * * /opt/leaf-ecommerce/backup.sh" | crontab -
```

---

## 3. Monitoramento contínuo

### 3.1 Logs a observar

```bash
# Tentativas de login falhadas (possível brute force)
docker compose logs backend | grep "401" | grep "/api/auth/login"

# Webhooks rejeitados (possível ataque)
docker compose logs backend | grep "Unauthorized" | grep "/api/webhooks"

# Erros do banco (possível indisponibilidade)
docker compose logs backend | grep "Npgsql"
```

### 3.2 Checklist periódico (mensal)

- [ ] Verificar se certificados SSL estão válidos: `echo | openssl s_client -connect leaf-parfum.cherihub.cloud:443 2>/dev/null | openssl x509 -noout -dates`
- [ ] Verificar se containers estão atualizados: `docker compose pull`
- [ ] Verificar espaço em disco: `df -h`
- [ ] Verificar se backups estão sendo gerados
- [ ] Revisar logs de 401/403 para padrões suspeitos
- [ ] Atualizar imagens base se houver CVEs: `docker scout cves ghcr.io/cheri-hub/leaf-ecommerce/backend:latest`

### 3.3 Uptime monitoring

Configurar monitoramento externo (opções gratuitas):
- [UptimeRobot](https://uptimerobot.com) — monitora `https://leaf-parfum.cherihub.cloud/health` a cada 5 min
- [Better Uptime](https://betteruptime.com) — alternativa com alertas por email/Telegram

---

## 4. Hardening adicional (opcional)

### 4.1 Content Security Policy (CSP)

Adicionar ao bloco LEAF ECOMMERCE no nginx:

```nginx
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://leaf-parfum.cherihub.cloud;" always;
```

> Nota: `unsafe-inline` e `unsafe-eval` são necessários para Next.js. Testar antes de aplicar.

### 4.2 Fail2Ban para SSH

```bash
sudo apt install fail2ban
sudo systemctl enable fail2ban
```

Configurar `/etc/fail2ban/jail.local`:
```ini
[sshd]
enabled = true
port = ssh
maxretry = 5
bantime = 3600
```

### 4.3 Firewall (UFW)

```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 4.4 Limitar acesso SSH

Editar `/etc/ssh/sshd_config`:
```
PermitRootLogin prohibit-password  # Apenas SSH key, sem senha
PasswordAuthentication no           # Desabilitar login por senha
```

---

## 5. Em caso de incidente

1. **Comprometimento de API key AbacatePay:** Revogar imediatamente no painel AbacatePay, gerar nova chave, atualizar `.env`, reiniciar backend
2. **Comprometimento de JWT secret:** Alterar `JWT_SECRET` no `.env`, reiniciar backend (invalida TODOS os tokens ativos — todos os usuários farão login novamente)
3. **Acesso não autorizado ao admin:** Verificar logs, alterar senha do admin via SQL direto, revisar `AspNetUserRoles`
4. **Vazamento de dados do banco:** Alterar `DB_PASSWORD`, revogar credenciais comprometidas, notificar usuários afetados conforme LGPD

### Comando útil: resetar senha do admin via terminal

```bash
docker compose exec postgres psql -U app -d ecommerce -c "
UPDATE \"AspNetUsers\" 
SET \"SecurityStamp\" = gen_random_uuid()::text 
WHERE \"Email\" = 'admin@leaf.com';"

# Depois reiniciar backend para forçar re-seed do admin com senha padrão
docker compose restart backend
```

---

## 6. LGPD (Lei Geral de Proteção de Dados)

Como e-commerce brasileiro, a Leaf está sujeita à LGPD. Pontos a implementar futuramente:

- [ ] Política de privacidade no site
- [ ] Termos de uso no checkout
- [ ] Botão "excluir minha conta" no perfil do usuário
- [ ] Exportação de dados pessoais (direito de portabilidade)
- [ ] Consentimento explícito para newsletter
- [ ] Registro de processamento de dados
