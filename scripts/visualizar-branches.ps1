# Script para visualizar a estrutura de branches - Sistema SIRUS

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "          Sistema SIRUS - Estrutura de Branches                 " -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "                            main" -ForegroundColor Green
Write-Host "                   (Codigo Completo)" -ForegroundColor Green
Write-Host "                              |"
Write-Host "                    +---------+---------+"
Write-Host "                    |                   |"
Write-Host "              SirusBot           SirusPag" -ForegroundColor Yellow
Write-Host "           (Chatbot IA)      (Pagamentos)" -ForegroundColor Yellow
Write-Host ""
Write-Host "+------------------------------+------------------------------+"
Write-Host "|       SirusBot (Chatbot)     |      SirusPag (Pagamentos)   |"
Write-Host "+------------------------------+------------------------------+"
Write-Host "| * Gemma Chat Service         | * Mercado Pago Client        |"
Write-Host "| * MCP Orchestrator           | * Ticket Sync Service        |"
Write-Host "| * Chat Analytics             | * Face Recognition           |"
Write-Host "| * Dialog Manager             | * Checkout Transparente      |"
Write-Host "| * Entity Extraction          | * QR Code Validation         |"
Write-Host "| * Intent Recognition         | * Gestao de Cardapio         |"
Write-Host "| * Chat Components            | * Dashboard de Vendas        |"
Write-Host "| * API /chat                  | * API /mercado-pago          |"
Write-Host "| * Demo Chatbot Page          | * Admin Panel                |"
Write-Host "| * Ollama Setup Scripts       | * Payment Mock               |"
Write-Host "+------------------------------+------------------------------+"
Write-Host ""
Write-Host "Branch Atual:" -ForegroundColor Cyan
$currentBranch = git rev-parse --abbrev-ref HEAD
Write-Host "  $currentBranch" -ForegroundColor Green
Write-Host ""
Write-Host "Todas as Branches:" -ForegroundColor Cyan
git branch -a | Select-String -Pattern "(SirusBot|SirusPag|main)" | ForEach-Object { Write-Host "  $_" }
Write-Host ""
Write-Host "Ultimo Commit em cada Branch:" -ForegroundColor Cyan
$branches = @("main", "SirusBot", "SirusPag")
foreach ($branch in $branches) {
    $null = git rev-parse --verify $branch 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "$branch :" -ForegroundColor Yellow
        $lastCommit = git log $branch -1 --oneline
        Write-Host "  $lastCommit"
    }
}
