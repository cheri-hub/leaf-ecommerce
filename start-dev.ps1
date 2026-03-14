# Leaf E-commerce — Dev Startup Script
# Sobe PostgreSQL + Redis via Docker e abre dois terminais: backend e frontend

$root = Split-Path -Parent $MyInvocation.MyCommand.Path

# 1. Subir PostgreSQL e Redis
Write-Host "Subindo PostgreSQL e Redis..." -ForegroundColor Yellow
docker compose -f "$root\docker-compose.dev.yml" up -d

if ($LASTEXITCODE -ne 0) {
    Write-Host "Erro ao subir containers. Verifique se o Docker esta rodando." -ForegroundColor Red
    exit 1
}

# Aguardar PostgreSQL aceitar conexões
Write-Host "Aguardando PostgreSQL ficar pronto..." -ForegroundColor Yellow
$attempts = 0
do {
    Start-Sleep -Seconds 1
    $attempts++
    $ready = docker compose -f "$root\docker-compose.dev.yml" exec -T postgres pg_isready -U app -d ecommerce 2>$null
} while ($LASTEXITCODE -ne 0 -and $attempts -lt 30)

if ($attempts -ge 30) {
    Write-Host "PostgreSQL nao ficou pronto a tempo." -ForegroundColor Red
    exit 1
}
Write-Host "PostgreSQL e Redis prontos!" -ForegroundColor Green

# 2. Aplicar migrations
Write-Host "Aplicando migrations..." -ForegroundColor Yellow
Push-Location "$root\backend"
dotnet ef database update --project src/EcommerceApi 2>&1 | Out-Null
Pop-Location
Write-Host "Migrations aplicadas!" -ForegroundColor Green

# 3. Backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$root\backend'; Write-Host '=== BACKEND ===' -ForegroundColor Green; dotnet run --project src/EcommerceApi"

# 4. Frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$root\frontend'; Write-Host '=== FRONTEND ===' -ForegroundColor Cyan; npm run dev"

Write-Host "Backend e Frontend iniciados em janelas separadas." -ForegroundColor Yellow
Write-Host "Para parar os containers: docker compose -f docker-compose.dev.yml down" -ForegroundColor DarkGray
