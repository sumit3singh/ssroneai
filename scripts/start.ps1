# PowerShell Start Script for SSR One AI Ecosystem
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "Starting SSR One AI Ecosystem (PowerShell)..." -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Cyan

# 1. Verify pnpm installation
if (Get-Command pnpm -ErrorAction SilentlyContinue) {
    Write-Host "[OK] pnpm detected." -ForegroundColor Green
} else {
    Write-Host "[WARNING] pnpm not found. Please install pnpm." -ForegroundColor Yellow
}

# 2. Launch Backend API
Write-Host "Starting FastAPI Backend on http://localhost:8000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location services/backend; ..\..\.venv\Scripts\uvicorn src.api.app.server:app --reload --port 8000"

# 3. Launch Frontend Web Applications via pnpm
Write-Host "Starting Admin ERP Web Portal (5173)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "pnpm --filter admin-web dev"

Write-Host "Starting Customer Food Web Portal (3000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "pnpm --filter customer-food-web dev"

Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "SSR One AI Ecosystem Services Launched!" -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Cyan
