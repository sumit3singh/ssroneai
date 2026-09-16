"""
SSR One AI – Comprehensive SQLAlchemy ORM Mapper Initializer
Imports all domain models across all modules and configures Base.registry deterministically.
"""
from src.shared.logger import get_logger

logger = get_logger(__name__)

_models_initialized = False


def init_sqlalchemy_models() -> None:
    """Import all ORM models and configure the registry before any queries run."""
    global _models_initialized
    if _models_initialized:
        return

    # Eagerly import all ORM models across domain modules
    import src.modules.auth.models
    import src.modules.restaurant.models
    import src.modules.orders.models
    import src.modules.hotel.models
    import src.modules.pg_management.models
    import src.modules.inventory.models
    import src.modules.billing.models
    import src.modules.finance.models
    import src.modules.crm.models
    import src.modules.hrms.models
    import src.modules.marketing.models
    import src.core.database.platform_models

    from src.core.database.engine import Base

    Base.registry.configure()
    _models_initialized = True
    logger.info("SQLAlchemy Base.registry mappers successfully configured.")
