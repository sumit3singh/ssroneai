# Lesson 15: Real-Time WebSockets & Kitchen Display System (KDS) Synchronization
> **Target Audience**: Main Lead Engineer & Software Architect  
> **Repository Context**: `SSR One AI` (`e:/2026/ssr_one_ai`)  
> **Prerequisites**: [Lesson 04: FastAPI & ASGI](file:///e:/2026/ssr_one_ai/docs/learning/04-fastapi-and-asgi.md), [Lesson 11: React 19 & Vite](file:///e:/2026/ssr_one_ai/docs/learning/11-react-19-and-vite.md)

---

## 1. What It Is (Simple Explanation & Real-Life Analogy)

**WebSockets** (`ws://` and `wss://`) is an advanced web technology providing an open, bidirectional, persistent, full-duplex communication channel over a single TCP connection between a client (like our Kitchen Display screen) and our FastAPI backend. Unlike traditional HTTP requests (where the browser must ask for data and wait for a response), a WebSocket connection stays open continuously, allowing the server to **push** new incoming food orders to the kitchen instantly the millisecond a cashier or customer places them.

### Real-Life Analogy
Imagine the communication between a restaurant cashier and the head chef:
* **The Traditional HTTP Polling Way**: Every 3 seconds, the chef runs to the cashier counter, taps them on the shoulder, and asks: *"Any new orders? Any new orders? Any new orders?"* 95% of the time, the cashier says: *"No, go back to cooking"*. The chef is exhausted, the kitchen gets crowded, and orders sit on the counter for 3 seconds before being noticed.
* **The WebSocket Way**: The cashier and chef install a private, direct two-way intercom wire connecting the billing counter to the kitchen wall. The chef stays at the stove. The instant a waiter punches a Butter Chicken, the intercom chimes and the order ticket prints on the chef's digital screen with **< 50ms latency**.

In SSR One AI, our **KDS (Kitchen Display System)** web app (`apps/kds-web`) connects via WebSockets to our backend. When a customer scans a table QR code and submits an order, the kitchen screen rings with a chime, flashes yellow, and displays the cooking timer without requiring a single page reload.

---

## 2. Why This Project Uses It (The Problem It Solves & Alternatives)

### The Problem It Solves in SSR One AI
1. **Sub-Second Kitchen SLA**: Per [ZERO_WAIT_POS_BLUEPRINT.md](file:///e:/2026/ssr_one_ai/.agents/02-architecture/ZERO_WAIT_POS_BLUEPRINT.md#L73), our SLA requires that orders reach the kitchen in **under 1 second**. HTTP polling introduces a 3- to 5-second delay, which slows down commercial kitchen throughput.
2. **Elimination of Server Load**: If 50 restaurants each run 3 kitchen screens (Pizza station, Grill station, Beverage station) polling every 2 seconds, that generates **4,500 HTTP requests per minute** of pure wasted bandwidth. WebSockets eliminate 99% of that overhead; the connection sits idle consuming zero CPU until a real order arrives.
3. **Bidirectional Kitchen Status Updates**: Cooks tap "Mark Ready" or "Start Cooking" on their touchscreens. The WebSocket sends this status back to the server, which immediately updates the cashier's POS screen and the customer's phone in real time!
4. **Branch-Isolated Broadcasts**: The kitchen in our Mahendragarh branch must **only** receive orders for Mahendragarh; it must never see Gurugram orders. Our [KDSConnectionManager](file:///e:/2026/ssr_one_ai/services/backend/src/modules/restaurant/router.py#L54) partitions connections strictly by `branch_id`.

---

## 3. Core Concepts (From Zero to Architect)

### Concept A: The HTTP Upgrade Handshake
A WebSocket connection begins as a standard HTTP request. The client asks the server to "upgrade" the protocol:
```http
GET /api/v1/restaurant/kds/1 HTTP/1.1
Host: api.ssrone.ai
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
Sec-WebSocket-Version: 13
```
If the server agrees, it returns `HTTP/1.1 101 Switching Protocols`. From that exact moment, HTTP is discarded, and the TCP socket remains open for raw, bidirectional framed message streaming!

### Concept B: Connection Managers & Memory State
FastAPI does not manage WebSocket client lists automatically. We build a **Connection Manager** class in Python:
* Maintains a dictionary mapping `branch_id -> list[WebSocket]`.
* When a screen opens: calls `await websocket.accept()` and appends socket to list.
* When a screen closes or loses Wi-Fi: removes socket from list (`disconnect()`).
* When an order arrives: loops through that branch's sockets and broadcasts the JSON payload.

### Concept C: Heartbeats (Ping/Pong)
Cloud proxies, load balancers, and Nginx servers automatically terminate TCP sockets that are silent for 60 seconds.
To keep the socket alive, the client periodically sends `"ping"`, and the server responds `"pong"`. This prevents cloud firewalls from severing kitchen connections during quiet afternoon hours.

---

## 4. Syntax & Feature Breakdown

### 1. Defining a FastAPI WebSocket Endpoint
```python
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter()

@router.websocket("/ws/{branch_id}")
async def websocket_endpoint(websocket: WebSocket, branch_id: str):
    await websocket.accept() # 1. Accept the HTTP Upgrade handshake
    try:
        while True:
            data = await websocket.receive_text() # 2. Listen for messages
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect: # 3. Handle graceful or sudden disconnections
        print(f"Client disconnected from branch {branch_id}")
```

### 2. Client-Side Browser WebSocket API
```typescript
const socket = new WebSocket("wss://api.ssrone.ai/api/v1/restaurant/kds/1");

socket.onopen = () => {
  console.log("Connected to Kitchen Server!");
};

socket.onmessage = (event) => {
  const order = JSON.parse(event.data);
  playKitchenChime(); // Sound notification
  displayNewOrderCard(order);
};

socket.onclose = () => {
  console.warn("Socket closed. Retrying in 3 seconds...");
  setTimeout(reconnectWebSocket, 3000);
};
```

---

## 5. How It Is Used in OUR Project (Real Code & Flow)

### 1. The Backend Connection Manager: [services/backend/src/modules/restaurant/router.py](file:///e:/2026/ssr_one_ai/services/backend/src/modules/restaurant/router.py)

```python
# Lines 54-86 in services/backend/src/modules/restaurant/router.py
class KDSConnectionManager:
    """Manages WebSocket connections for all KDS screens."""

    def __init__(self):
        # branch_id -> list of active WebSocket connections
        self.connections: dict[str, list[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, branch_id: str):
        await websocket.accept()
        self.connections.setdefault(branch_id, []).append(websocket)
        logger.info("KDS connected", branch_id=branch_id, total=len(self.connections[branch_id]))

    def disconnect(self, websocket: WebSocket, branch_id: str):
        if branch_id in self.connections:
            self.connections[branch_id] = [
                ws for ws in self.connections[branch_id] if ws != websocket
            ]

    async def broadcast_to_branch(self, branch_id: str, message: dict):
        """Send a message to all KDS screens in a branch (< 1 second per blueprint SLA)."""
        import json
        connections = self.connections.get(branch_id, [])
        disconnected = []
        for ws in connections:
            try:
                await ws.send_text(json.dumps(message))
            except Exception:
                disconnected.append(ws)
        # Clean up any dead sockets that failed to receive
        for ws in disconnected:
            self.disconnect(ws, branch_id)

kds_manager = KDSConnectionManager()
```

#### Why Dead Socket Cleanup is Critical:
Notice lines 76–84: If a kitchen tablet is suddenly powered off or loses Wi-Fi, sending a message throws an exception. Instead of crashing our server, our `broadcast_to_branch` detects the broken socket, adds it to `disconnected`, and unregisters it cleanly!

---

### 2. The WebSocket Route Handler: [services/backend/src/modules/restaurant/router.py](file:///e:/2026/ssr_one_ai/services/backend/src/modules/restaurant/router.py#L758-L782)

```python
@router.websocket("/kds/{branch_id}")
async def kds_websocket(websocket: WebSocket, branch_id: str):
    """
    WebSocket endpoint for Kitchen Display System screens.
    Receives real-time order events dispatched via Event Bus.
    Target: < 1 second dispatch (per blueprint SLA).
    """
    await kds_manager.connect(websocket, branch_id)
    try:
        # 1. Send immediate connection confirmation
        await websocket.send_json({
            "type": "connected",
            "branch_id": branch_id,
            "message": "KDS connected — awaiting orders",
            "timestamp": datetime.now(timezone.utc).isoformat(),
        })
        
        # 2. Keepalive heartbeat loop
        while True:
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        kds_manager.disconnect(websocket, branch_id)
        logger.info("KDS disconnected", branch_id=branch_id)
```

---

### 3. How Order Dispatch Triggers the Broadcast:
When an order is created at the POS or via customer QR scan:
```python
# Inside OrderService.create_order():
await db.commit() # 1. Persist to PostgreSQL

# 2. Push real-time KOT event to all kitchen screens in this branch
await kds_manager.broadcast_to_branch(
    branch_id=str(order.branch_id),
    message={
        "event": "NEW_ORDER",
        "order_number": order.order_number,
        "table_number": order.table.table_number,
        "items": [
            {"name": item.product_name, "quantity": item.quantity, "modifiers": item.modifiers}
            for item in order.items
        ],
        "created_at": order.created_at.isoformat(),
    }
)
```

---

## 6. Common Mistakes & Gotchas (What Breaks & How to Debug)

### Mistake 1: Silent Timeout by Cloud Proxies (Nginx / Render / Cloudflare)
* **What happens**: The kitchen screen connects fine in the morning. After 60 seconds with no orders, the cloud proxy silently kills the TCP connection without telling the browser. When an order arrives at 1:00 PM, the screen never receives it!
* **The Fix**:
  1. In Nginx: Increase `proxy_read_timeout 3600s;`.
  2. In the React frontend: Send a `"ping"` message every 25 seconds (`setInterval(() => ws.send("ping"), 25000)`).

### Mistake 2: Multi-Container Scalability (In-Memory Sockets)
* **What happens**: You run 2 backend containers on cloud hosting. Cashier connects to Container A; Kitchen connects to Container B. Cashier punches order on Container A, but Container B has the kitchen WebSocket. The kitchen screen doesn't receive the order!
* **The Architectural Solution**: In multi-container setups, we use **Redis Pub/Sub** (covered in Lesson 16). Container A publishes to Redis, and Redis notifies Container B to broadcast over its WebSockets!

### Mistake 3: Infinite Reconnection Storms
* **What happens**: If the backend restarts for an update, 50 tablets immediately spam the server with reconnect attempts every 10ms, causing a Denial of Service (DoS).
* **Fix**: Use **Exponential Backoff with Jitter** (wait 1s, then 2s, then 4s, plus random milliseconds).

---

## 7. Best Practices & Performance Tips for POS Systems

1. **Audio Notifications on New Tickets**:
   Commercial kitchens are loud. In `apps/kds-web`, use HTML5 Audio API (`new Audio("/sounds/order-chime.mp3").play()`) whenever an incoming `"NEW_ORDER"` event arrives.
2. **Color-Coded Aging Timers**:
   On the kitchen screen, tickets should calculate elapsed minutes:
   - `< 10 mins`: Green card.
   - `10 - 20 mins`: Amber warning card.
   - `> 20 mins`: Flashing red urgent card!
3. **Reconciliation Polling Fallback**:
   Always maintain a background query every 60 seconds as a safety net. If a chef walked their tablet into a metal walk-in freezer where Wi-Fi dropped, the reconciliation poll will catch any orders missed during the brief disconnection.

---

## 8. Hands-On Practice Exercises

### Exercise 1 (Easy):
Write a JavaScript function for `apps/kds-web` that sends a `"ping"` string over an active WebSocket instance every 25 seconds to keep the connection alive.

### Exercise 2 (Medium):
In `KDSConnectionManager`, add a new method `get_active_screen_count(branch_id: str) -> int` that returns the exact number of active kitchen display screens currently connected in a specific branch.

### Exercise 3 (Hard):
Write a React custom hook called `useKDSWebSocket(branchId: string)` that:
1. Opens a WebSocket connection to `/api/v1/restaurant/kds/{branchId}`.
2. Automatically parses incoming JSON messages and appends new orders to local state.
3. Automatically attempts to reconnect with a 3-second delay if the socket disconnects.
4. Cleans up and closes the socket when the component unmounts.

<details>
<summary><strong>Click to View Solutions</strong></summary>

#### Solution 1:
```typescript
function startHeartbeat(socket: WebSocket) {
  const interval = setInterval(() => {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send("ping");
    }
  }, 25000);

  return () => clearInterval(interval);
}
```

#### Solution 2:
```python
def get_active_screen_count(self, branch_id: str) -> int:
    return len(self.connections.get(branch_id, []))
```

#### Solution 3:
```typescript
import { useState, useEffect, useRef } from "react";

export function useKDSWebSocket(branchId: string) {
  const [orders, setOrders] = useState<any[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    let timeoutId: any;

    function connect() {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const host = window.location.host;
      const ws = new WebSocket(`${protocol}//${host}/api/v1/restaurant/kds/${branchId}`);
      wsRef.current = ws;

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.event === "NEW_ORDER") {
            setOrders((prev) => [message, ...prev]);
          }
        } catch {}
      };

      ws.onclose = () => {
        timeoutId = setTimeout(connect, 3000); // Auto reconnect in 3s
      };
    }

    connect();

    return () => {
      clearTimeout(timeoutId);
      if (wsRef.current) wsRef.current.close();
    };
  }, [branchId]);

  return orders;
}
```
</details>

---

## 9. Self-Test & Feynman Active Recall

### 5 Recall Questions:
1. What HTTP status code does a server return when successfully accepting a WebSocket upgrade?
2. Why is traditional HTTP polling inefficient for kitchen display screens compared to WebSockets?
3. What is the role of `KDSConnectionManager` in our backend?
4. Why do we send `"ping"` messages every 25 seconds across the WebSocket connection?
5. How does `kds_manager.broadcast_to_branch()` prevent Gurugram kitchen screens from seeing Mahendragarh branch orders?

### 2 Feynman Prompts:
* *Prompt 1*: Explain to a restaurant head chef how WebSockets enable instant order printing on their screen the microsecond a guest taps "Confirm Order" on their smartphone.
* *Prompt 2*: Explain what happens to open WebSocket connections when a cloud server redeploys, and how automatic client reconnection logic prevents kitchen operations from stopping.

---

## 10. Architect's Cheat Sheet (One-Screen Summary)

```python
# ─── FASTAPI WEBSOCKET CHEAT SHEET ────────────────────────────
from fastapi import WebSocket, WebSocketDisconnect

@router.websocket("/ws/{room_id}")
async def ws_handler(websocket: WebSocket, room_id: str):
    await websocket.accept()
    try:
        while True:
            msg = await websocket.receive_text()
            if msg == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        print(f"Disconnected from {room_id}")

# ─── FRONTEND CLIENT USAGE ────────────────────────────────────
const ws = new WebSocket("wss://api.ssrone.ai/ws/kitchen_1");
ws.onopen = () => console.log("Connected");
ws.onmessage = (e) => console.log("Incoming order:", JSON.parse(e.data));
ws.send("ping");
ws.close();
```

---
*Next Lesson: **[Lesson 16: Redis In-Memory Cache, Rate Limiting & Celery Background Workers](file:///e:/2026/ssr_one_ai/docs/learning/16-redis-and-celery.md)***
