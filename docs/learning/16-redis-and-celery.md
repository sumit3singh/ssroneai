# Lesson 16: Redis In-Memory Cache, Rate Limiting & Celery Background Workers
> **Target Audience**: Main Lead Engineer & Software Architect  
> **Repository Context**: `SSR One AI` (`e:/2026/ssr_one_ai`)  
> **Prerequisites**: [Lesson 04: FastAPI & ASGI](file:///e:/2026/ssr_one_ai/docs/learning/04-fastapi-and-asgi.md), [Lesson 07: PostgreSQL & Neon](file:///e:/2026/ssr_one_ai/docs/learning/07-postgresql-and-neon.md)

---

## 1. What It Is (Simple Explanation & Real-Life Analogy)

**Redis** is an ultra-fast, in-memory key-value data structure store used as a database, cache, message broker, and streaming engine. Because it holds all data directly in RAM rather than spinning disks, operations execute in less than 1 millisecond. **Celery** is an asynchronous distributed task queue system for Python that lets you offload heavy, slow operations (like sending 500 emails, generating complex PDF financial audit reports, or scanning supplier purchase invoices with OCR) into background worker processes so your web API stays lightning fast.

### Real-Life Analogy
Imagine the service structure of an upscale fine-dining restaurant:
* **Without Redis & Celery (Synchronous Blocking)**: When a guest asks for the bill, the waiter personally walks down into the basement, sorts through paper receipts for 10 minutes, calculates taxes by hand, licks a postage stamp, walks to the post office down the street to mail a copy to the tax department, and only then brings the guest the bill. The guest has waited 25 minutes, and no other tables can order food.
* **With Redis & Celery**: 
  - **Redis Cache**: The waiter keeps the day's special menu printed on a cheat-sheet in their breast pocket (RAM). When a guest asks for prices, they answer in **0.1 seconds** without walking to the office.
  - **Celery Worker**: When the bill is paid, the waiter hands a slip to a dedicated back-office administrative runner (Celery Worker). The runner handles the heavy PDF generation, tax emailing, and inventory logging in the back room, while the waiter immediately turns around to serve the next dining guest.

In SSR One AI, Redis and Celery ensure that our cashier POS terminal responds in under 5ms, while heavy background workers handle invoice emails, PDF rendering, and daily financial ledgers in the background.

---

## 2. Why This Project Uses It (The Problem It Solves & Alternatives)

### The Problem It Solves in SSR One AI
1. **API Rate Limiting & DDoS Defense**: Malicious bots or angry customers might spam our login endpoint or table QR scanning endpoint. Redis uses atomic counters (`INCR` + `EXPIRE`) to limit requests (e.g. max 10 attempts per minute per IP), rejecting abusive traffic before it hits PostgreSQL.
2. **Sub-Millisecond Menu Caching**: A restaurant's menu rarely changes during active service hours. Caching the active branch catalog in Redis allows 1,000 guests scanning QR codes at 8:00 PM to view menus in **< 2ms**, reducing database load by 99%.
3. **Decoupled Heavy Jobs (Celery)**: Rendering a 50-page monthly sales tax PDF using WeasyPrint takes 4 to 8 seconds of heavy CPU time. If run inside a FastAPI route, it would block the Python process and timeout the client's browser. Celery executes the job in an isolated background container.
4. **Resilient Local Memory Fallback**: Notice [services/backend/src/shared/redis_client.py](file:///e:/2026/ssr_one_ai/services/backend/src/shared/redis_client.py#L61-L108): If the Redis server ever crashes or runs out of RAM, our `CacheService` automatically falls back to an in-memory Python dictionary (`InMemoryCache`) with zero runtime crashes!

### Alternatives Considered & Why Rejected
* **In-Memory Python Dictionaries Only**: Not shared across multiple backend containers. If Container A caches a dish price, Container B doesn't know about it.
* **Memcached**: Simple key-value only; lacks Redis's rich data structures (hashes, lists, sets, sorted sets) and Pub/Sub messaging capabilities.
* **RabbitMQ**: Powerful message broker, but requires running an entirely separate Erlang server. Redis acts as both our cache AND our Celery message broker in one lightweight service.

---

## 3. Core Concepts (From Zero to Architect)

### Concept A: In-Memory Key-Value Storage
Unlike PostgreSQL (which writes every row to disk for ACID durability), Redis holds data entirely in **RAM**:
* Read/Write latency: **0.1 to 1.0 millisecond**.
* Volatile with optional persistence: Redis can snapshot to disk (RDB) or log writes (AOF), but is primarily optimized for temporary, high-speed data.

### Concept B: Key Expiration (TTL - Time To Live)
Every key in Redis can have an automatic self-destruct timer:
```bash
SETEX ssrone:menu:branch_1 3600 "{...json...}"
```
After 3,600 seconds (1 hour), Redis automatically evicts the key from RAM.

### Concept C: Celery Architecture (Producer ➡️ Broker ➡️ Consumer)
* **Producer (FastAPI)**: Dispatches a task: `generate_pdf.delay(order_id=101)`. Returns immediately with a task ID (`Task-abc-123`).
* **Broker (Redis)**: Holds the task payload in a FIFO queue (`redis://localhost:6379/1`).
* **Consumer / Worker (Celery Process)**: A background worker running `celery -A src.workers.celery_app worker` picks up the task, executes the code, and writes the result to the result backend (`redis://localhost:6379/2`).

```mermaid
graph LR
    API["FastAPI Web Server"] -->|1. task.delay()| Broker["Redis Broker (DB 1)"]
    Broker -->|2. Pull Task| Worker["Celery Worker Container"]
    Worker -->|3. Generate PDF| PDF[("Storage / Disk")]
    Worker -->|4. Save Status| Result["Redis Backend (DB 2)"]
```

---

## 4. Syntax & Feature Breakdown

### 1. Redis Operations (`redis.asyncio`)
```python
import redis.asyncio as aioredis

# Connect
r = aioredis.from_url("redis://localhost:6379/0", decode_responses=True)

# 1. String Get / Set with Expiry (TTL)
await r.setex("user:session:101", 3600, "active")
val = await r.get("user:session:101") # Returns "active"

# 2. Atomic Increment (Rate Limiting)
current_attempts = await r.incr("rate:login:ip_192_168_1_5")
if current_attempts == 1:
    await r.expire("rate:login:ip_192_168_1_5", 60) # 1-minute window
if current_attempts > 10:
    raise HTTPException(status_code=429, detail="Rate limit exceeded")

# 3. Pattern-Based Cache Invalidation
keys = await r.keys("ssrone:menu:branch_1:*")
if keys:
    await r.delete(*keys)
```

### 2. Celery Task Definition & Invocation
```python
from celery import shared_task

@shared_task(bind=True, max_retries=3)
def send_order_email(self, customer_email: str, order_data: dict):
    try:
        # Heavy SMTP email network call
        send_smtp_receipt(customer_email, order_data)
    except Exception as exc:
        # Exponential backoff retry
        raise self.retry(exc=exc, countdown=2 ** self.request.retries)
```

In your FastAPI route:
```python
@router.post("/orders/checkout")
async def checkout(order: OrderCreate):
    order_id = await save_order_to_db(order)
    # Fire and forget into background worker!
    send_order_email.delay(order.customer_email, order.dict())
    return {"status": "success", "order_id": order_id}
```

---

## 5. How It Is Used in OUR Project (Real Code & Worker Queues)

### 1. Resilient Cache Service: [services/backend/src/shared/redis_client.py](file:///e:/2026/ssr_one_ai/services/backend/src/shared/redis_client.py)

```python
# Lines 21-37 in services/backend/src/shared/redis_client.py
async def get_redis() -> Redis:
    """Get or create the Redis client singleton."""
    global _redis_client, _redis_available
    if not _redis_available:
        raise ConnectionError("Redis is marked as unavailable")
    if _redis_client is None:
        _redis_client = aioredis.from_url(
            settings.redis.url,
            encoding="utf-8",
            decode_responses=True,
            max_connections=50,             # Connection pool size
            socket_connect_timeout=2.0,     # Fails fast in 2s if server down
            socket_timeout=2.0,
            retry_on_timeout=True,
        )
    return _redis_client
```

#### The Transparent Memory Fallback:
Look at lines 120–164 in `redis_client.py`:
When an operation like `cache.get("branch_menu")` runs:
1. It tries Redis first.
2. If Redis is down (e.g. during a cloud restart), it intercepts the exception, sets `_redis_available = False`, logs a warning, and executes the operation on `_local_cache` (Python dictionary).
3. **The result**: Your restaurant billing terminal **never crashes with a 500 Internal Server Error** just because Redis rebooted!

---

### 2. Multi-Queue Celery Configuration: [services/backend/src/workers/celery_app.py](file:///e:/2026/ssr_one_ai/services/backend/src/workers/celery_app.py)

```python
# Lines 11-34 in services/backend/src/workers/celery_app.py
celery_app = Celery(
    "ssrone",
    broker=settings.celery_broker_url,       # redis://localhost:6379/1
    backend=settings.celery_result_backend,  # redis://localhost:6379/2
    include=["src.shared.tasks"],
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="Asia/Kolkata",
    enable_utc=True,
    task_track_started=True,
    task_acks_late=True,                     # Guarantees no lost tasks on crash!
    worker_prefetch_multiplier=1,            # Prevents worker task hoarding
    task_routes={
        "src.shared.tasks.send_email": {"queue": "notifications"},
        "src.shared.tasks.generate_pdf": {"queue": "exports"},
        "src.shared.tasks.run_ai_job": {"queue": "ai"},
    },
)
```

#### Why `task_acks_late=True` and `worker_prefetch_multiplier=1` Matter:
* `task_acks_late=True`: The worker only acknowledges ("ACK") the task *after* it successfully finishes. If the worker server is rebooted mid-execution while printing a month-end tax report, Redis automatically re-queues the task for another worker to finish!
* `task_routes`: Separates tasks into 3 priority queues (`notifications`, `exports`, `ai`). A slow 30-second AI job in the `ai` queue will **never delay or block** a 0.2-second customer receipt email in the `notifications` queue!

---

## 6. Common Mistakes & Gotchas (What Breaks & How to Debug)

### Mistake 1: Passing Database ORM Objects into Celery Tasks
* **What happens**: Writing:
  ```python
  @shared_task
  def process_order(order: Order): # ❌ CRASH: Object of type Order is not JSON serializable!
      ...
  ```
* **Why**: Celery sends tasks to Redis as JSON text. Complex SQLAlchemy database objects cannot be converted to JSON, and will hold stale database connections.
* **The Rule**: Always pass primitive IDs into Celery tasks:
  ```python
  process_order.delay(order_id=order.id)
  ```
  Inside the task, the worker opens a fresh database session and queries the row by ID.

### Mistake 2: Missing Celery Worker Container in Production
* **What happens**: You call `task.delay()`. The API returns success. But the email is never sent and the report is never generated!
* **Why**: `task.delay()` only pushes a message into Redis. If no worker process (`celery -A ... worker`) is actively running in the background, the task sits in Redis forever.
* **Fix**: Ensure your Docker Compose or cloud platform runs a dedicated worker service.

### Mistake 3: Cache Stampede (Dog-Piling)
* **What happens**: A popular menu cache expires at exactly 8:00 PM during dinner rush. 200 guests scan QR codes simultaneously. All 200 requests see a cache miss and run the exact same heavy SQL query on PostgreSQL, causing a database CPU spike to 100%!
* **Fix**: Add random jitter to your cache TTL: `ttl = 3600 + random.randint(0, 300)` so keys don't all expire at the exact same second.

---

## 7. Best Practices & Performance Tips for POS Systems

1. **Use Redis Key Namespaces**:
   Always prefix keys with standard namespaces: `ssrone:<tenant_id>:<module>:<identifier>`.
   Example: `ssrone:12:menu:branch_1`. This allows instant single-tenant cache flushes: `cache.delete_pattern("ssrone:12:*")`.
2. **Monitor Workers with Flower**:
   Our project includes **Flower** (`flower==2.0.1` in `requirements.txt`). Launch it in development:
   ```bash
   celery -A src.workers.celery_app flower --port=5555
   ```
   Open `http://localhost:5555` to view live queue lengths, worker CPU consumption, and task failure graphs.
3. **Set Memory Limits on Redis**:
   In production `redis.conf`, always set `maxmemory 512mb` and `maxmemory-policy allkeys-lru` (Least Recently Used). If RAM fills up, Redis automatically evicts the oldest cached menus rather than crashing.

---

## 8. Hands-On Practice Exercises

### Exercise 1 (Easy):
Write an async Python function using our `cache` service that caches an active dining table layout for branch `"2"` with a 15-minute TTL (`900 seconds`).

### Exercise 2 (Medium):
Write a rate-limiting helper function in FastAPI:
`check_rate_limit(client_ip: str, max_requests: int = 5, window_seconds: int = 60)`
Raises an `HTTPException(429)` if the IP exceeds `max_requests` within the time window.

### Exercise 3 (Hard):
Inspect `celery_app.py`. Write a new Celery background task called `export_daily_sales_excel(branch_id: int, date_str: str)` that:
1. Belongs to the `"exports"` task queue.
2. Simulates generating an Excel file with a 3-second sleep.
3. Sends an event notification when completed.

<details>
<summary><strong>Click to View Solutions</strong></summary>

#### Solution 1:
```python
from src.shared.redis_client import cache

async def cache_table_layout(branch_id: str, tables_data: list[dict]):
    await cache.set(f"tables:branch_{branch_id}", tables_data, ttl=900)
```

#### Solution 2:
```python
from fastapi import HTTPException, status
from src.shared.redis_client import cache

async def check_rate_limit(client_ip: str, max_requests: int = 5, window_seconds: int = 60):
    key = f"ratelimit:{client_ip}"
    current = await cache.increment(key, amount=1)
    if current == 1:
        await cache.expire(key, ttl=window_seconds)
    if current > max_requests:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many attempts. Please try again later."
        )
```

#### Solution 3:
```python
import time
from celery import shared_task

@shared_task(name="src.shared.tasks.generate_pdf", queue="exports", bind=True)
def export_daily_sales_excel(self, branch_id: int, date_str: str):
    time.sleep(3) # Simulates heavy openpyxl Excel calculation
    file_path = f"/app/uploads/exports/sales_branch_{branch_id}_{date_str}.xlsx"
    return {"status": "completed", "file_path": file_path}
```
</details>

---

## 9. Self-Test & Feynman Active Recall

### 5 Recall Questions:
1. Why does Redis read and write data in under 1 millisecond compared to PostgreSQL?
2. What is the difference between a Celery Broker and a Celery Result Backend?
3. What happens if our backend tries to access Redis and the Redis container is down?
4. Why should you never pass a live SQLAlchemy ORM instance directly into a Celery task?
5. What does `task_acks_late=True` do when a worker crashes mid-task?

### 2 Feynman Prompts:
* *Prompt 1*: Explain to a restaurant manager why offloading PDF receipt generation to a Celery worker prevents their billing screen from freezing for 5 seconds when printing an invoice.
* *Prompt 2*: Explain what "API Rate Limiting" is using the analogy of a nightclub bouncer allowing only 5 people through the door per minute.

---

## 10. Architect's Cheat Sheet (One-Screen Summary)

```python
# ─── REDIS CACHE CHEAT SHEET ──────────────────────────────────
from src.shared.redis_client import cache

# Get / Set with Expiry
await cache.set("my_key", {"data": 123}, ttl=3600)
val = await cache.get("my_key")
await cache.delete("my_key")
await cache.delete_pattern("ssrone:menu:*")

# Atomic Counter
count = await cache.increment("counter_key", amount=1)

# ─── CELERY WORKER CLI COMMANDS ───────────────────────────────
# Start Celery Worker process
celery -A src.workers.celery_app worker --loglevel=info --concurrency=4

# Start Celery Beat (Scheduled recurring crons)
celery -A src.workers.celery_app beat --loglevel=info

# Launch Flower Web Monitoring UI
celery -A src.workers.celery_app flower --port=5555
```

---
*Next Lesson: **[Lesson 17: WeasyPrint Thermal KOTs, Invoices & OpenPyXL Excel Reports](file:///e:/2026/ssr_one_ai/docs/learning/17-document-engines-weasyprint.md)***
