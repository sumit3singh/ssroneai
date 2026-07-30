# Backend Service

This directory contains the SSR One AI backend service.

## Structure

- `src/` — Python application source code
- `tests/` — service unit and integration tests
- `migrations/` — database migrations
- `scripts/` — backend utilities and seeds
- `Dockerfile` — container image build definition
- `pyproject.toml` — Python project metadata and dependencies

## Running Locally

```bash
cd services/backend
pip install -r requirements.txt
python -m uvicorn src.app.server:app --host 0.0.0.0 --port 8000
```

## Docker

Use `docker-compose.yml` or `infrastructure/docker/docker-compose.dev.yml` to run the service in a local development environment.
