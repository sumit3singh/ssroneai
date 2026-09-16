"""
Alembic migration environment.
Auto-generates migrations from SQLAlchemy models.
"""
import asyncio
from logging.config import fileConfig

from alembic import context
from sqlalchemy import pool
from sqlalchemy.ext.asyncio import async_engine_from_config

# Import all models so Alembic can detect them
from src.core.database.engine import Base
from src.modules.auth.models import (  # noqa: F401
    AuditLog, EventStore, FeatureLicense, FeatureMaster,
    Role, Tenant, User, UserRole, UserSession,
)
from src.engines.form_builder.models import (  # noqa: F401
    FormMaster, FormFieldModel, FieldValidationModel, FormSubmission,
)
from src.ai.copilot.models import AIConversation, AIMessage, AIPromptTemplate  # noqa: F401
from src.modules.billing.models import Invoice, InvoiceItem, InvoicePayment  # noqa: F401
from src.modules.crm.models import Campaign, Customer, CustomerInteraction, LoyaltyTransaction  # noqa: F401
from src.modules.finance.router import ChartOfAccounts, JournalEntry, BudgetEntry  # noqa: F401
from src.modules.hotel.models import Guest, Reservation, Room, RoomType  # noqa: F401
from src.modules.hrms.models import (  # noqa: F401
    AttendanceRecord, Department, Designation, Employee,
    LeaveRequest, LeaveType, Payslip, PayrollRun, Shift,
)
from src.modules.inventory.models import (  # noqa: F401
    Product, ProductCategory, StockEntry, StockMovement,
)
from src.engines.notification.router import NotificationTemplate, NotificationLog  # noqa: F401
from src.modules.orders.models import Order, OrderItem, OrderPayment  # noqa: F401
from src.modules.pg_management.models import (  # noqa: F401
    PGBed, PGFloor, PGRentRecord, PGResident, PGRoom, PGVisitorLog,
)
from src.modules.restaurant.router import RestaurantTable, KDSStation  # noqa: F401
from src.modules.restaurant.models import (  # noqa: F401
    MenuCategory, MenuTag, MenuItemTag, MenuItem,
    MenuVariantGroup, MenuVariantOption, MenuAddonGroup, MenuAddonOption,
)
from src.shared.config import get_settings

settings_obj = get_settings()

# Alembic Config object
config = context.config

# Set DB URL from our settings
config.set_main_option("sqlalchemy.url", settings_obj.db.async_url)

# Set up logging from alembic.ini
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
    )
    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection):
    context.configure(
        connection=connection,
        target_metadata=target_metadata,
        compare_type=True,
    )
    with context.begin_transaction():
        context.run_migrations()


async def run_async_migrations() -> None:
    connectable = async_engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)
    await connectable.dispose()


def run_migrations_online() -> None:
    asyncio.run(run_async_migrations())


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
