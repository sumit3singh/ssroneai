#!/usr/bin/env bash
# Bash Start Script for SSR One AI Ecosystem (Linux / macOS / WSL)
echo "==================================================="
echo "Starting SSR One AI Ecosystem..."
echo "==================================================="

# 1. Start Backend API
echo "Starting FastAPI Backend..."
cd services/backend && source ../../.venv/bin/activate && uvicorn src.api.app.server:app --reload --port 8000 &
BACKEND_PID=$!

# 2. Start Monorepo Services
echo "Starting Monorepo Dev Server via pnpm..."
pnpm dev

kill $BACKEND_PID
