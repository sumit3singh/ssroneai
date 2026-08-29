"""
The ssrone – Platform Domain Event Catalog
Defines standardized domain events broadcasted across the Event Bus.
"""
from enum import StrEnum
from typing import Any
from src.core.event_bus.bus import DomainEvent


class EventType(StrEnum):
  # Customer & CRM
  CUSTOMER_CREATED = "CustomerCreated"
  CUSTOMER_UPDATED = "CustomerUpdated"
  LOYALTY_POINTS_EARNED = "LoyaltyPointsEarned"

  # POS & Dining Orders
  ORDER_CREATED = "OrderCreated"
  ORDER_CANCELLED = "OrderCancelled"
  ORDER_SERVED = "OrderServed"
  KOT_FIRED = "KOTFired"

  # Payments & Billing
  PAYMENT_COMPLETED = "PaymentCompleted"
  INVOICE_POSTED = "InvoicePosted"

  # Hotel PMS & PG Management
  RESERVATION_CREATED = "ReservationCreated"
  RESERVATION_CANCELLED = "ReservationCancelled"
  CHECK_IN_COMPLETED = "CheckInCompleted"
  CHECK_OUT_COMPLETED = "CheckOutCompleted"
  RENT_PAST_DUE = "RentPastDue"

  # Inventory & Procurement
  PURCHASE_APPROVED = "PurchaseApproved"
  STOCK_ADJUSTED = "StockAdjusted"
  STOCK_LOW = "StockLow"

  # HR & Staff
  EMPLOYEE_CLOCKED_IN = "EmployeeClockedIn"
  EMPLOYEE_CLOCKED_OUT = "EmployeeClockedOut"


def create_domain_event(
    event_type: EventType, tenant_id: str, payload: dict[str, Any], source: str
) -> DomainEvent:
  """Factory helper to build a structured domain event."""
  return DomainEvent(
      event_type=event_type,
      tenant_id=tenant_id,
      payload=payload,
      source_module=source,
  )
