@echo off
title SSR One AI Ecosystem Launcher
color 0A
echo ===================================================
echo   SSR ONE AI — ENTERPRISE OPERATING SYSTEM
echo   Launching All 6 Portals & Backend Service...
echo ===================================================
echo.

:: 1. Launch FastAPI Backend API Server (Port 8000)
echo [1/7] Starting FastAPI Backend API Server (Port 8000)...
start "SSR One AI — FastAPI Backend API" cmd /k "cd services\backend && ..\..\.venv\Scripts\python.exe -m uvicorn src.api.app.server:app --reload --host 127.0.0.1 --port 8000"

:: 2. Launch Admin ERP Dashboard (Port 5173)
echo [2/7] Starting Admin ERP Dashboard (Port 5173)...
start "SSR One AI — Admin ERP Dashboard" cmd /k "npm run dev --prefix apps/admin-web"

:: 3. Launch Customer Food Ordering Portal (Port 3000)
echo [3/7] Starting Customer Food Ordering Portal (Port 3000)...
start "SSR One AI — Customer Food Portal" cmd /k "npm run dev --prefix apps/customer-food-web"

:: 4. Launch Customer Stay Accommodation Portal (Port 3001)
echo [4/7] Starting Customer Stay Accommodation Portal (Port 3001)...
start "SSR One AI — Customer Stay Portal" cmd /k "npm run dev --prefix apps/customer-stay-web"

:: 5. Launch Kitchen Display Screen (KDS) (Port 8083)
echo [5/7] Starting Kitchen Display Screen (Port 8083)...
start "SSR One AI — Kitchen Display (KDS)" cmd /k "npm run dev --prefix apps/kds-web"

:: 6. Launch Waiter Staff Companion (Port 8084)
echo [6/7] Starting Waiter Staff Companion (Port 8084)...
start "SSR One AI — Waiter Companion" cmd /k "npm run dev --prefix apps/staff-web"

:: 7. Launch Mobile Loyalty App (Port 8085)
echo [7/7] Starting Mobile Loyalty App (Port 8085)...
start "SSR One AI — Guest Loyalty Mobile App" cmd /k "npm run dev --prefix apps/mobile-app"

echo.
echo ===================================================
echo   ALL 7 SSR ONE AI ECOSYSTEM SERVICES ARE RUNNING!
echo ===================================================
echo - FastAPI Backend API & Docs:  http://localhost:8000/docs
echo - Admin ERP Dashboard:       http://localhost:5173
echo - Customer Food Portal:      http://localhost:3000
echo - Customer Stay Portal:      http://localhost:3001
echo - Kitchen Display (KDS):     http://localhost:8083
echo - Waiter Staff Companion:    http://localhost:8084
echo - Guest Loyalty Mobile App:  http://localhost:8085
echo ===================================================
echo.
pause
