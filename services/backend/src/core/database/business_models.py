"""
SQLAlchemy ORM Business Models – Canonical Re-exports
Consolidates domain models from module packages into unified accessors.
Prevents duplicate __tablename__ declarations across SQLAlchemy metadata.
"""

from src.modules.restaurant.models import MenuItem as MenuItemModel
from src.modules.orders.models import Order as POSOrderModel
from src.modules.hotel.models import Room as HotelRoomModel, Reservation as HotelReservationModel
from src.modules.inventory.models import Product as InventoryItemModel
from src.modules.billing.models import Invoice as InvoiceModel
from src.modules.crm.models import Customer as CustomerModel, CustomerAddress as CustomerAddressModel
from src.modules.hrms.models import Employee as EmployeeModel
from src.modules.pg_management.models import PGBed as PGBedModel
from src.modules.finance.models import FinancialYear as FinancialYearModel

__all__ = [
    "MenuItemModel",
    "POSOrderModel",
    "HotelRoomModel",
    "HotelReservationModel",
    "InventoryItemModel",
    "InvoiceModel",
    "CustomerModel",
    "CustomerAddressModel",
    "EmployeeModel",
    "PGBedModel",
    "FinancialYearModel",
]
