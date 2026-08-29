@echo off
title SSR One AI Ecosystem Launcher
cls
echo ====================================================
echo   Starting SSR One AI Backend and Frontend Apps
echo ====================================================
echo.

cd /d "%~dp0"

if exist "%~dp0.venv\Scripts\python.exe" (
    set "PY_CMD=%~dp0.venv\Scripts\python.exe"
) else (
    set "PY_CMD=python"
)

echo [1/7] Starting Backend API (http://localhost:8000)...
start "Backend API (8000)" cmd /k "cd /d "%~dp0services\backend" && %PY_CMD% -m uvicorn src.main:app --reload --host 0.0.0.0 --port 8000"

echo [2/7] Starting Admin ERP Web Portal (http://localhost:5173)...
start "Admin Web ERP (5173)" cmd /k "cd /d "%~dp0" && npx pnpm --filter @ssrone/admin-web dev"

echo [3/7] Starting Customer Food Web (http://localhost:3000)...
start "Customer Food Web (3000)" cmd /k "cd /d "%~dp0" && npx pnpm --filter @ssrone/customer-food-web dev"

echo [4/7] Starting Customer Stay Web (http://localhost:3001)...
start "Customer Stay Web (3001)" cmd /k "cd /d "%~dp0" && npx pnpm --filter @ssrone/customer-stay-web dev"

echo [5/7] Starting Kitchen Display KDS (http://localhost:8083)...
start "KDS Web (8083)" cmd /k "cd /d "%~dp0" && npx pnpm --filter @ssrone/kds-web dev"

echo [6/7] Starting Staff Web Portal (http://localhost:8084)...
start "Staff Web (8084)" cmd /k "cd /d "%~dp0" && npx pnpm --filter @ssrone/staff-web dev"

echo [7/7] Starting Platform Superadmin Console (http://localhost:5174)...
start "Platform Superadmin (5174)" cmd /k "cd /d "%~dp0" && npx pnpm --filter @ssrone/platform-admin dev"

echo.
echo ====================================================
echo All 7 Backend and Frontend Applications Launched!
echo ====================================================

