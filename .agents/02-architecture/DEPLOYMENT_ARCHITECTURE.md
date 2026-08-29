# Deployment Architecture

> **Last Reviewed**: August 2026

This document specifies deployment configurations and infrastructure containerization for **The ssrone**.

---

## 1. Container Topology (`docker-compose.yml`)

The platform is fully containerized using Docker and Docker Compose:

- **`backend`**: FastAPI ASGI server running Uvicorn workers on port 8000.
- **`postgres`**: PostgreSQL 16 container with persistent volumes and RLS enabled.
- **`redis`**: Redis 7 container for WebSocket event pub/sub and caching.
- **`admin-web`**: Nginx web server serving Vite production bundle for Admin ERP on port 5173.
- **`customer-food-web`**, **`customer-stay-web`**, **`kds-web`**, **`staff-web`**, **`mobile-app`**: Containerized frontend Nginx instances.

---

## 2. Environment Configuration

All microservices configure runtime behavior via `.env` variables validated by Pydantic `BaseSettings`:
- `DATABASE_URL`: PostgreSQL async connection string (`postgresql+asyncpg://...`).
- `REDIS_URL`: Redis connection string (`redis://...`).
- `JWT_SECRET_KEY`: RSA/HMAC secret key for auth tokens.
