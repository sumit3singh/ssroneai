# Lesson 03: Multi-Stage Docker Builds, Dev/Prod Compose & Linux Dependencies
> **Target Audience**: Main Lead Engineer & Software Architect  
> **Repository Context**: `SSR One AI` (`e:/2026/ssr_one_ai`)  
> **Prerequisites**: [Lesson 01: Monorepo Architecture](file:///e:/2026/ssr_one_ai/docs/learning/01-monorepo-pnpm-turbo.md), [Lesson 02: TypeScript Foundations](file:///e:/2026/ssr_one_ai/docs/learning/02-typescript-foundations.md)

---

## 1. What It Is (Simple Explanation & Real-Life Analogy)

**Docker** is a containerization platform that packages an application along with everything it needs to run—the exact operating system kernel libraries, Python runtime, system packages, fonts, and dependencies—into an isolated, standardized unit called a **container**.

### Real-Life Analogy
Imagine you run a franchise restaurant chain.
* **Without Docker**: You send your chef recipes to a new branch in another city. But that branch has a different gas burner pressure, their water boiling point is different, and their local butter has more moisture. The recipe tastes completely different, or burns completely. The chef complains: *"Well, it worked perfectly in my kitchen!"*
* **With Docker**: Instead of just sending a paper recipe, you ship a complete, standardized, air-conditioned shipping container pod. Inside this pod is the exact same commercial oven, the exact same water filter, the exact same temperature gauges, and the exact same ingredients. When it arrives, you simply plug in the electricity cable, and the food cooks with 100% identical perfection anywhere on earth.

In SSR One AI, Docker ensures that our FastAPI backend—with all its complex C-libraries for PDF receipt rendering (`libpango`) and invoice OCR (`tesseract-ocr`)—runs identically on your local Windows laptop, on Linux CI servers, on Railway, on Render, or on bare-metal servers.

---

## 2. Why This Project Uses It (The Problem It Solves & Alternatives)

### The Problem It Solves in SSR One AI
Our Python FastAPI backend is not just simple math. It relies heavily on **compiled C/C++ Linux system binaries**:
1. **WeasyPrint (HTML to PDF Bill Printing)**: Requires `libpango-1.0-0`, `libpangocairo-1.0-0`, and `libcairo2`. Without these Linux packages installed on the host OS, generating a PDF thermal receipt crashes with: `OSError: cannot load library 'libpango-1.0-0'`.
2. **Pytesseract (Supplier Invoice OCR Scanning)**: Requires the compiled Linux `tesseract-ocr` binary to extract text and taxes from scanned supplier invoices.
3. **Database Driver (PostgreSQL)**: `asyncpg` and `psycopg2` require `libpq-dev` to compile high-speed C extensions.

If every developer had to manually install C-compilers, Pango DLLs, and Tesseract binaries onto their Windows or Mac machines, onboarding a new developer would take 3 days and break constantly. With Docker, anyone runs `docker compose up` and the complete stack (Postgres + Redis + Backend) boots up in 60 seconds.

### Alternatives Considered & Why Rejected
* **Running directly on Host Windows (`python -m venv`)**: Fails on WeasyPrint and Tesseract unless third-party Windows installers and custom PATH environment variables are manually configured.
* **Full Virtual Machines (VMware / VirtualBox)**: Takes 20GB of disk space, boots in 3 minutes, and consumes 4GB of RAM just for the OS.
* **Docker Containers (Chosen)**: Extremely lightweight (shares host OS kernel), boots in 2 seconds, and uses minimal RAM.

---

## 3. Core Concepts (From Zero to Architect)

### Concept A: Image vs Container
* **Docker Image**: The immutable blueprint or snapshot (like a `.iso` file or a class in OOP). It contains the file system, Python runtime, code, and default command.
* **Docker Container**: A running, live instance of an image (like an object instance in OOP). You can stop, start, restart, or destroy containers without altering the underlying image.

### Concept B: Dockerfile vs Docker Compose
* **Dockerfile** ([services/backend/Dockerfile](file:///e:/2026/ssr_one_ai/services/backend/Dockerfile)): Instructions to build **one single image** (our FastAPI backend).
* **Docker Compose** ([infrastructure/docker/docker-compose.dev.yml](file:///e:/2026/ssr_one_ai/infrastructure/docker/docker-compose.dev.yml)): A multi-container conductor. It spins up multiple containers at once (`postgres` + `redis` + `backend` + `nginx`), connects them to an internal virtual network, and manages persistent storage volumes.

### Concept C: Build Layer Caching
Docker builds images layer by layer. If a step hasn't changed, Docker reuses the cached layer from the previous build:
* **Slow Layer (Rarely Changes)**: Installing Linux packages (`apt-get install tesseract-ocr`).
* **Medium Layer (Occasionally Changes)**: Installing Python packages (`pip install -r requirements.txt`).
* **Fast Layer (Changes Every Minute)**: Copying application source code (`COPY . .`).

By ordering our Dockerfile properly, rebuilding the container after editing a Python file takes **less than 2 seconds** because Docker reuses the cached `apt-get` and `pip install` layers!

### Concept D: Docker Volumes (Data Persistence)
Containers are **ephemeral** (temporary). If you delete a container, everything inside its file system is wiped out!
To prevent our database from disappearing when a container restarts, we use **Volumes**:
```yaml
volumes:
  - postgres_data:/var/lib/postgresql/data
```
This tells Docker to store PostgreSQL's physical table data on the host machine's drive, surviving any container rebuilds.

---

## 4. Syntax & Configuration Breakdown

### 1. The Production Backend Dockerfile: [services/backend/Dockerfile](file:///e:/2026/ssr_one_ai/services/backend/Dockerfile)

Let's read our real Dockerfile line by line:

```dockerfile
# Line 6: Base Image
FROM python:3.12-slim AS base

# Lines 8-12: Environment Flags
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

# Lines 16-24: System C-Dependencies (WeasyPrint, Psycopg2, Tesseract)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    tesseract-ocr \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Lines 26-27: Dependency Layer Caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Line 29-31: Application Source & Uploads Folder
COPY . .
RUN mkdir -p /app/uploads

EXPOSE 8000

# Lines 35-36: Health Check Instruction
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:${PORT:-8000}/health || exit 1

# Line 38: Runtime Command
CMD ["sh", "-c", "uvicorn src.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
```

#### Syntax Secrets Explained:
* `python:3.12-slim`: A Debian Linux image stripped down to ~150MB (instead of the 1GB full Python image).
* `PYTHONUNBUFFERED=1`: Forces Python to print logs directly to the terminal stdout/stderr immediately, rather than buffering them in memory. Without this, your Docker logs might appear 5 minutes late!
* `--no-install-recommends`: Prevents `apt-get` from downloading unnecessary documentation and helper utilities, saving ~200MB of image size.
* `rm -rf /var/lib/apt/lists/*`: Deletes the temporary package index lists after installation so they don't bloat the final Docker image.
* `${PORT:-8000}`: Uses the `PORT` environment variable provided by cloud hosts like Render or Railway, but defaults to `8000` if running locally.

---

## 5. How It Is Used in OUR Project (Dev vs Prod Compose)

SSR One AI provides two distinct Docker Compose topologies inside [infrastructure/docker/](file:///e:/2026/ssr_one_ai/infrastructure/docker):

```mermaid
graph LR
    subgraph "Local Development (docker-compose.dev.yml)"
        PG_DEV["PostgreSQL:16 (Port 5432)"]
        REDIS_DEV["Redis:7 (Port 6379)"]
        BACKEND_DEV["FastAPI Backend (Hot Reload --reload)"]
        PG_DEV <--> BACKEND_DEV
        REDIS_DEV <--> BACKEND_DEV
    end

    subgraph "Production Self-Hosted (docker-compose.prod.yml)"
        NGINX["Nginx Gateway (Port 80/443)"]
        PG_PROD["PostgreSQL:16 (Internal)"]
        REDIS_PROD["Redis:7 (Internal)"]
        BACKEND_PROD["FastAPI Backend (Port 8000)"]
        DIST["All 8 Frontend Dist Folders"]
        NGINX --> BACKEND_PROD
        NGINX --> DIST
        PG_PROD <--> BACKEND_PROD
        REDIS_PROD <--> BACKEND_PROD
    end
```

### 1. Development Compose: [infrastructure/docker/docker-compose.dev.yml](file:///e:/2026/ssr_one_ai/infrastructure/docker/docker-compose.dev.yml)
Notice the startup command in development:
```yaml
command: >
  sh -c "
    alembic upgrade head &&
    python scripts/seed.py &&
    uvicorn src.app.server:app --host 0.0.0.0 --port 8000 --reload
  "
```
It automatically:
1. Runs Alembic database migrations.
2. Seeds initial restaurant branches and admin accounts.
3. Starts Uvicorn with `--reload` so any Python code change is reflected instantly.

### 2. Production Compose: [infrastructure/docker/docker-compose.prod.yml](file:///e:/2026/ssr_one_ai/infrastructure/docker/docker-compose.prod.yml)
In production:
* Ports `5432` (Postgres) and `6379` (Redis) are **not exposed** to the public internet. They only exist inside the private Docker network for security.
* **Nginx** sits in front as the reverse proxy on ports `80` and `443`.
* Nginx serves the compiled frontend static assets for all 8 apps (`apps/admin-web/dist`, `apps/customer-food-web/dist`, etc.) directly from disk with extreme speed, and proxies `/api/*` to the FastAPI backend.

---

## 6. Common Mistakes & Gotchas (What Breaks & How to Debug)

### Mistake 1: Binding to `localhost` (127.0.0.1) instead of `0.0.0.0`
* **What happens**: The container starts, but when you visit `http://localhost:8000` in your browser, it says `Connection Refused`.
* **Why**: Inside a container, `127.0.0.1` refers only to the container itself. To accept incoming network packets forwarded from the host, Uvicorn **must** bind to `0.0.0.0`:
  ```bash
  uvicorn src.main:app --host 0.0.0.0 --port 8000
  ```

### Mistake 2: Connecting to `localhost:5432` inside Docker
* **What happens**: Backend crashes on startup with `connection to 127.0.0.1:5432 failed`.
* **Why**: When running inside Docker Compose, each container has its own internal IP. To connect to PostgreSQL, you do **not** use `localhost`; you use the service name declared in Compose:
  ```env
  DB_HOST=postgres
  REDIS_HOST=redis
  ```

### Mistake 3: Permission Denied on `/app/uploads`
* **What happens**: Receipt upload or menu image upload fails with `PermissionError: [Errno 13] Permission denied: '/app/uploads'`.
* **Fix**: Notice line 31 in our Dockerfile:
  ```dockerfile
  RUN mkdir -p /app/uploads
  ```
  Ensure the container user has write permissions to mounted upload directories.

### Debugging Docker in SSR One AI:
```bash
# View live streaming logs of backend container
docker logs -f ssr_one_ai_backend

# Open an interactive bash shell inside the running container
docker exec -it ssr_one_ai_backend bash

# Check health check status of containers
docker compose -f infrastructure/docker/docker-compose.dev.yml ps
```

---

## 7. Best Practices & Performance Tips for POS Systems

1. **Leverage Docker Layer Caching**: Always `COPY requirements.txt .` and `RUN pip install` **before** running `COPY . .`. Otherwise, every time you edit a comment in a Python file, Docker will re-download and re-install all 90 Python packages!
2. **Never Store State Inside the Container**: Store uploaded images in an S3-compatible bucket (or a mounted Docker volume), and database tables in a volume. The container should be 100% replaceable.
3. **Keep Docker Health Checks Lightweight**: Our healthcheck queries `http://localhost:8000/health`, which performs a fast 1-millisecond Redis/DB ping. Never run heavy queries inside a Docker healthcheck.

---

## 8. Hands-On Practice Exercises

### Exercise 1 (Easy):
Inspect [services/backend/Dockerfile](file:///e:/2026/ssr_one_ai/services/backend/Dockerfile#L17). Identify the 3 Linux system packages installed specifically for WeasyPrint PDF thermal receipt generation.

### Exercise 2 (Medium):
Write a `docker run` CLI command to run our backend Docker image locally, passing your Neon PostgreSQL database URL as an environment variable and exposing port 8000.

### Exercise 3 (Hard):
Inspect [infrastructure/docker/docker-compose.prod.yml](file:///e:/2026/ssr_one_ai/infrastructure/docker/docker-compose.prod.yml#L58-L77). Explain line by line how Nginx serves the compiled production build of `customer-food-web` to QR-code scanning guests.

<details>
<summary><strong>Click to View Solutions</strong></summary>

#### Solution 1:
The packages are:
1. `build-essential` (C compiler tools)
2. `libpango-1.0-0` (Pango text layout engine)
3. `libpangocairo-1.0-0` (Cairo 2D graphics rendering engine)

#### Solution 2:
```bash
docker run -d \
  --name ssrone_backend \
  -p 8000:8000 \
  -e DATABASE_URL="postgresql://neondb_owner:password@ep-host.aws.neon.tech/neondb?sslmode=require" \
  -e JWT_SECRET_KEY="test-key" \
  ssrone-backend-image
```

#### Solution 3:
1. In `docker-compose.prod.yml` line 72, the volume mount:
   ```yaml
   - ../../apps/customer-food-web/dist:/var/www/customer-food-web/dist:ro
   ```
   mounts the compiled HTML/JS/CSS output of `customer-food-web` as a read-only (`:ro`) directory inside the Nginx container.
2. In `nginx.prod.conf`, an incoming request for `food.ssrone.ai` or `/menu` maps its `root` directive to `/var/www/customer-food-web/dist`.
3. Nginx serves `index.html` and static assets directly from disk with Gzip compression without ever waking up the Python backend, achieving sub-10ms response times.
</details>

---

## 9. Self-Test & Feynman Active Recall

### 5 Recall Questions:
1. Why must `uvicorn` bind to `--host 0.0.0.0` instead of `127.0.0.1` inside a container?
2. What happens to database data when a PostgreSQL container is stopped if NO volume was mounted?
3. Why do we put `COPY requirements.txt .` before `COPY . .` in our Dockerfile?
4. What Linux libraries does WeasyPrint require to generate thermal receipts?
5. How does Docker Compose resolve hostnames like `postgres` or `redis` when containers talk to each other?

### 2 Feynman Prompts:
* *Prompt 1*: Explain to a junior developer why running a Python virtual environment on Windows often fails to generate PDF receipts, but running the exact same code inside our Docker container succeeds every time.
* *Prompt 2*: Explain what an "ephemeral container" means, and why saving guest invoices or restaurant logos directly to `/tmp` inside a container is a catastrophic mistake.

---

## 10. Architect's Cheat Sheet (One-Screen Summary)

```bash
# ─── DOCKER BUILD & RUN ──────────────────────────────────────
docker build -t ssrone-backend ./services/backend     # Build backend image
docker run -p 8000:8000 --env-file .env ssrone-backend # Run backend container

# ─── DOCKER COMPOSE COMMANDS ─────────────────────────────────
# Start full local development stack (Postgres + Redis + Backend)
docker compose -f infrastructure/docker/docker-compose.dev.yml up -d

# Stop and remove containers (data preserved in volumes)
docker compose -f infrastructure/docker/docker-compose.dev.yml down

# Wipe everything including database volumes (CAUTION: Resets DB!)
docker compose -f infrastructure/docker/docker-compose.dev.yml down -v

# Rebuild backend image after changing Dockerfile or requirements.txt
docker compose -f infrastructure/docker/docker-compose.dev.yml build --no-cache backend

# ─── CONTAINER INSPECTION ────────────────────────────────────
docker ps                         # List running containers
docker logs -f <container-name>   # Stream live container logs
docker exec -it <container> sh    # Open shell inside container
```

---
*Next Lesson: **[Lesson 04: FastAPI ASGI Lifecycle, Routers, Middlewares & Uvicorn](file:///e:/2026/ssr_one_ai/docs/learning/04-fastapi-and-asgi.md)***
