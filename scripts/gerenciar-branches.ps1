# Script para Gerenciamento de Branches - Sistema SIRUS
# PowerShell Script

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet('chatbot', 'pagamentos', 'main', 'sync', 'status')]
    [string]$Acao
)

function Show-Banner {
    Write-Host "================================" -ForegroundColor Cyan
    Write-Host "  Sistema SIRUS - Branch Manager" -ForegroundColor Cyan
    Write-Host "================================" -ForegroundColor Cyan
    Write-Host ""
}

function Show-Status {
    Write-Host "📊 Status atual das branches:" -ForegroundColor Yellow
    Write-Host ""
    
    $currentBranch = git rev-parse --abbrev-ref HEAD
    Write-Host "Branch atual: $currentBranch" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "Todas as branches:" -ForegroundColor Yellow
    git branch -a
    Write-Host ""
    
    Write-Host "Arquivos modificados:" -ForegroundColor Yellow
    git status --short
}

function Switch-ToChatbot {
    Write-Host "🤖 Mudando para branch SirusBot (Chatbot)..." -ForegroundColor Green
    git checkout SirusBot
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Agora você está na branch SirusBot" -ForegroundColor Green
        Write-Host ""
        Write-Host "📝 Arquivos principais do chatbot:" -ForegroundColor Yellow
        Write-Host "  - services/gemma-chat-service.ts"
        Write-Host "  - services/chat-analytics-service.ts"
        Write-Host "  - services/mcp/"
        Write-Host "  - components/chat-bot.tsx"
        Write-Host "  - app/api/chat/route.ts"
    } else {
        Write-Host "❌ Erro ao mudar para branch SirusBot" -ForegroundColor Red
    }
}

function Switch-ToPagamentos {
    Write-Host "💳 Mudando para branch SirusPag (Pagamentos)..." -ForegroundColor Green
    git checkout SirusPag
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Agora você está na branch SirusPag" -ForegroundColor Green
        Write-Host ""
        Write-Host "📝 Arquivos principais de pagamentos:" -ForegroundColor Yellow
        Write-Host "  - services/mercado-pago-client.ts"
        Write-Host "  - services/ticket-sync-service.ts"
        Write-Host "  - components/comprar-ticket-melhorado.tsx"
        Write-Host "  - components/checkout-transparente.tsx"
        Write-Host "  - app/api/mercado-pago/"
    } else {
        Write-Host "❌ Erro ao mudar para branch SirusPag" -ForegroundColor Red
    }
}

function Switch-ToMain {
    Write-Host "🏠 Mudando para branch main..." -ForegroundColor Green
    git checkout main
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Agora você está na branch main (código completo)" -ForegroundColor Green
    } else {
        Write-Host "❌ Erro ao mudar para branch main" -ForegroundColor Red
    }
}

function Sync-Branches {
    Write-Host "🔄 Sincronizando branches com main..." -ForegroundColor Yellow
    Write-Host ""
    
    # Salvar branch atual
    $currentBranch = git rev-parse --abbrev-ref HEAD
    
    # Atualizar main
    Write-Host "1️⃣ Atualizando main..." -ForegroundColor Cyan
    git checkout main
    git pull origin main
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Erro ao atualizar main" -ForegroundColor Red
        return
    }
    
    # Atualizar SirusBot
    Write-Host ""
    Write-Host "2️⃣ Atualizando SirusBot..." -ForegroundColor Cyan
    git checkout SirusBot
    git merge main
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ SirusBot atualizado com sucesso" -ForegroundColor Green
        git push origin SirusBot
    } else {
        Write-Host "⚠️ Conflitos encontrados em SirusBot - resolva manualmente" -ForegroundColor Yellow
    }
    
    # Atualizar SirusPag
    Write-Host ""
    Write-Host "3️⃣ Atualizando SirusPag..." -ForegroundColor Cyan
    git checkout SirusPag
    git merge main
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ SirusPag atualizado com sucesso" -ForegroundColor Green
        git push origin SirusPag
    } else {
        Write-Host "⚠️ Conflitos encontrados em SirusPag - resolva manualmente" -ForegroundColor Yellow
    }
    
    # Voltar para branch original
    Write-Host ""
    Write-Host "4️⃣ Voltando para branch $currentBranch..." -ForegroundColor Cyan
    git checkout $currentBranch
    
    Write-Host ""
    Write-Host "✅ Sincronização concluída!" -ForegroundColor Green
}

# Main
Show-Banner

switch ($Acao) {
    'chatbot' { Switch-ToChatbot }
    'pagamentos' { Switch-ToPagamentos }
    'main' { Switch-ToMain }
    'sync' { Sync-Branches }
    'status' { Show-Status }
}

Write-Host ""
Write-Host "📖 Para mais informações, consulte BRANCHING_STRATEGY.md" -ForegroundColor Gray

