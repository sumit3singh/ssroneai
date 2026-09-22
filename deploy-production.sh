#!/usr/bin/env bash
# ================================================================
# SSR One AI – Linux Cloud Production Deployment Automation
# ================================================================

set -euo pipefail

echo "================================================================"
echo "       SSR One AI – Production Deployment Automation"
echo "================================================================"

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

echo "[1/4] Checking Environment Configuration..."
if [ ! -f "services/backend/.env" ]; then
    echo "[!] services/backend/.env not found. Copying template..."
    cp services/backend/.env.production.example services/backend/.env
fi
echo "[OK] Environment verified."

echo "[2/4] Building all 8 Production Frontend Web Applications..."
pnpm --filter @ssrone/marketing-web build
pnpm --filter @ssrone/admin-web build
pnpm --filter @ssrone/platform-admin build
pnpm --filter @ssrone/kds-web build
pnpm --filter @ssrone/token-order-web build
pnpm --filter @ssrone/customer-food-web build
pnpm --filter @ssrone/customer-stay-web build
pnpm --filter @ssrone/staff-web build
echo "[OK] All 8 frontend distribution artifacts compiled into /dist."

echo "[3/4] Launching Production Docker Container Topology..."
docker compose -f infrastructure/docker/docker-compose.prod.yml up -d --build
echo "[OK] Containers started."

echo "[4/4] Verifying Cluster Health..."
sleep 5
curl -f http://localhost:8000/health || {
    echo "[!] Healthcheck probe failed. Checking container logs..."
    docker compose -f infrastructure/docker/docker-compose.prod.yml logs --tail=30
    exit 1
}

echo ""
echo "================================================================"
echo "  [SUCCESS] SSR One AI Platform is Live in Production!"
echo "  API Gateway:     http://localhost:8000"
echo "  Web Apps:        Routed via Nginx on port 80/443"
echo "================================================================"
