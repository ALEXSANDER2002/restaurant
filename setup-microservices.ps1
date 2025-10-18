# Script para configurar estrutura de microservicos
# Copia arquivos das branches SirusBot e SirusPay para pastas separadas

Write-Host "================================" -ForegroundColor Cyan
Write-Host "  Setup Microservicos SIRUS" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Salvar branch atual
$currentBranch = git rev-parse --abbrev-ref HEAD
Write-Host "Branch atual: $currentBranch" -ForegroundColor Yellow
Write-Host ""

# Copiar SirusBot
Write-Host "1. Copiando arquivos do SirusBot..." -ForegroundColor Green
git checkout SirusBot

if (-not (Test-Path "SirusBot")) {
    New-Item -ItemType Directory -Path "SirusBot" | Out-Null
}

Write-Host "   Copiando arquivos..." -ForegroundColor Gray
robocopy . .\SirusBot /E /XD node_modules .git .next SirusBot SirusPay /XF setup-microservices.ps1 /NFL /NDL /NJH /NJS /NC /NS /NP

Write-Host "   OK SirusBot copiado!" -ForegroundColor Green
Write-Host ""

# Copiar SirusPay
Write-Host "2. Copiando arquivos do SirusPay..." -ForegroundColor Green
git checkout SirusPay

if (-not (Test-Path "SirusPay")) {
    New-Item -ItemType Directory -Path "SirusPay" | Out-Null
}

Write-Host "   Copiando arquivos..." -ForegroundColor Gray
robocopy . .\SirusPay /E /XD node_modules .git .next SirusBot SirusPay /XF setup-microservices.ps1 /NFL /NDL /NJH /NJS /NC /NS /NP

Write-Host "   OK SirusPay copiado!" -ForegroundColor Green
Write-Host ""

# Voltar para branch original
Write-Host "3. Voltando para branch $currentBranch..." -ForegroundColor Green
git checkout $currentBranch

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "  Setup Concluido!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Estrutura criada:" -ForegroundColor Yellow
Write-Host "  - SirusBot/  (Port 3001)" -ForegroundColor White
Write-Host "  - SirusPay/  (Port 3000)" -ForegroundColor White
Write-Host ""
Write-Host "Proximos passos:" -ForegroundColor Yellow
Write-Host "  1. Configure os arquivos .env em cada pasta" -ForegroundColor White
Write-Host "  2. Execute: docker-compose up -d" -ForegroundColor White
Write-Host ""
