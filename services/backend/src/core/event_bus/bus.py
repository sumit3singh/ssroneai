"""
The Baithak – Event Bus Engine
Redis Pub/Sub event broadcasting for decoupled domain communication.
Emits structured events like OrderCreated, RoomCheckedIn, RentPastDue.
"""
import json
from collections.abc import Callable, Coroutine
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any

from src.shared.logger import get_logger
from src.shared.redis_client import get_redis

logger = get_logger(__name__)

# Type alias for async event handlers
EventHandler = Callable[[dict[str, Any]], Coroutine[Any, Any, None]]


@dataclass
class DomainEvent:
    """
    Structured domain event — the currency of the event bus.
    Every business action emits one of these.
    """
    event_type: str                      # e.g. "OrderCreated", "RoomCheckedIn"
    tenant_id: str
    payload: dict[str, Any]
    event_id: str = field(default_factory=lambda: f"evt-{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S%f')}")
    occurred_at: str = field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat()
    )
    version: str = "1.0"
    source_module: str = "platform"
    correlation_id: str | None = None    # For tracing related events

    def to_dict(self) -> dict[str, Any]:
        return {
            "event_id": self.event_id,
            "event_type": self.event_type,
            "tenant_id": self.tenant_id,
            "payload": self.payload,
            "occurred_at": self.occurred_at,
            "version": self.version,
            "source_module": self.source_module,
            "correlation_id": self.correlation_id,
        }

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> "DomainEvent":
        return cls(**data)


class EventBus:
    """
    Redis-backed event bus.
    Publish events to channels; subscribers receive and handle them.
    """

    CHANNEL_PREFIX = "baithak:events"
    GLOBAL_CHANNEL = "baithak:events:all"
    STORE_KEY_PREFIX = "baithak:event_store"

    def __init__(self) -> None:
        self._handlers: dict[str, list[EventHandler]] = {}

    def channel_for(self, event_type: str) -> str:
        return f"{self.CHANNEL_PREFIX}:{event_type}"

    async def publish(self, event: DomainEvent) -> None:
        """
        Publish a domain event to the Redis channel.
        Also persists to the in-memory event store for durability.
        """
        redis = await get_redis()
        payload = json.dumps(event.to_dict(), default=str)

        # Publish to event-specific channel AND global fanout channel
        channel = self.channel_for(event.event_type)
        await redis.publish(channel, payload)
        await redis.publish(self.GLOBAL_CHANNEL, payload)

        # Persist event (lightweight — full DB persistence done by module)
        store_key = f"{self.STORE_KEY_PREFIX}:{event.tenant_id}"
        await redis.lpush(store_key, payload)
        await redis.ltrim(store_key, 0, 999)  # Keep last 1000 events per tenant

        logger.info(
            "Event published",
            event_type=event.event_type,
            event_id=event.event_id,
            tenant_id=event.tenant_id,
            channel=channel,
        )

    def subscribe(self, event_type: str) -> Callable[[EventHandler], EventHandler]:
        """Decorator to register an async handler for a specific event type."""
        def decorator(handler: EventHandler) -> EventHandler:
            if event_type not in self._handlers:
                self._handlers[event_type] = []
            self._handlers[event_type].append(handler)
            logger.debug("Event handler registered", event_type=event_type, handler=handler.__name__)
            return handler
        return decorator

    async def dispatch_locally(self, event: DomainEvent) -> None:
        """Dispatch event to locally registered handlers (in-process)."""
        handlers = self._handlers.get(event.event_type, [])
        for handler in handlers:
            try:
                await handler(event.to_dict())
            except Exception as exc:
                logger.error(
                    "Event handler failed",
                    event_type=event.event_type,
                    handler=handler.__name__,
                    error=str(exc),
                )


# Global event bus singleton
event_bus = EventBus()


# ──────────────────────────────────────────────
# Convenience factory functions for common events
# ──────────────────────────────────────────────

def order_created_event(tenant_id: str, order_id: str, **extra: Any) -> DomainEvent:
    return DomainEvent(
        event_type="OrderCreated",
        tenant_id=tenant_id,
        payload={"order_id": order_id, **extra},
        source_module="orders",
    )


def room_checked_in_event(tenant_id: str, room_id: str, guest_id: str, **extra: Any) -> DomainEvent:
    return DomainEvent(
        event_type="RoomCheckedIn",
        tenant_id=tenant_id,
        payload={"room_id": room_id, "guest_id": guest_id, **extra},
        source_module="hotel_pms",
    )


def room_checked_out_event(tenant_id: str, room_id: str, folio_id: str, **extra: Any) -> DomainEvent:
    return DomainEvent(
        event_type="RoomCheckedOut",
        tenant_id=tenant_id,
        payload={"room_id": room_id, "folio_id": folio_id, **extra},
        source_module="hotel_pms",
    )


def inventory_low_stock_event(tenant_id: str, product_id: str, current_qty: float, **extra: Any) -> DomainEvent:
    return DomainEvent(
        event_type="InventoryLowStock",
        tenant_id=tenant_id,
        payload={"product_id": product_id, "current_qty": current_qty, **extra},
        source_module="inventory",
    )


def payment_received_event(tenant_id: str, invoice_id: str, amount: float, **extra: Any) -> DomainEvent:
    return DomainEvent(
        event_type="PaymentReceived",
        tenant_id=tenant_id,
        payload={"invoice_id": invoice_id, "amount": amount, **extra},
        source_module="billing",
    )


def rent_past_due_event(tenant_id: str, tenant_resident_id: str, amount_due: float, **extra: Any) -> DomainEvent:
    return DomainEvent(
        event_type="RentPastDue",
        tenant_id=tenant_id,
        payload={"tenant_resident_id": tenant_resident_id, "amount_due": amount_due, **extra},
        source_module="pg_management",
    )
