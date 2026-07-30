# Deployment Architecture – BAITHAK ERP Charter #22

## Infrastructure & Production Environment
- **Web Frontend**: Nginx reverse proxy serving built Vite SPA bundles.
- **Backend API Gateway**: FastAPI running under Gunicorn / Uvicorn workers.
- **Database**: PostgreSQL 15+ cluster with hot standby replication.
- **Caching**: Redis cluster for session cache & rate limiting.
- **Containerization**: Docker & Docker Compose monorepo services.
