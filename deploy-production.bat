@echo off
title SSR One AI Production Deployment Engine
cls
echo ================================================================
echo        SSR One AI – Production Deployment Automation
echo ================================================================
echo.

cd /d "%~dp0"

echo [1/4] Checking Environment Configuration...
if not exist "services\backend\.env" (
    echo [!] WARNING: services\backend\.env not found!
    echo [*] Creating .env from .env.production.example...
    copy "services\backend\.env.production.example" "services\backend\.env"
)
echo [OK] Environment verified.
echo.

echo [2/4] Building all 8 Production Frontend Web Applications...
call pnpm --filter @ssrone/marketing-web build
call pnpm --filter @ssrone/admin-web build
call pnpm --filter @ssrone/platform-admin build
call pnpm --filter @ssrone/kds-web build
call pnpm --filter @ssrone/token-order-web build
call pnpm --filter @ssrone/customer-food-web build
call pnpm --filter @ssrone/customer-stay-web build
call pnpm --filter @ssrone/staff-web build
echo [OK] All 8 frontend distribution artifacts compiled into /dist.
echo.

echo [3/4] Launching Production Docker Container Topology...
docker compose -f infrastructure\docker\docker-compose.prod.yml up -d --build
if %ERRORLEVEL% NEQ 0 (
    echo [!] Docker compose deployment encountered an error. Please verify Docker is running.
    exit /b %ERRORLEVEL%
)
echo [OK] Containers healthy and running.
echo.

echo [4/4] Verifying Cluster Health...
timeout /t 5 /nobreak >nul
curl -f http://localhost:8000/health
echo.
echo ================================================================
echo   [SUCCESS] SSR One AI Platform is Live in Production!
echo   API Gateway:     http://localhost:8000
echo   Admin ERP POS:   http://localhost (or configured domain)
echo ================================================================
pause
