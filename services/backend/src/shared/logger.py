"""
The ssrone – Structured Logger
JSON-structured logging with request context binding.
"""
import logging
import sys
from typing import Any

import structlog
from structlog.types import EventDict, Processor

from src.shared.config import get_settings

settings = get_settings()


def _add_app_context(
    logger: logging.Logger, method_name: str, event_dict: EventDict
) -> EventDict:
    """Inject application metadata into every log line."""
    event_dict["app"] = settings.app_name
    event_dict["env"] = settings.app_env
    return event_dict


def configure_logging() -> None:
    """Configure structlog for the application. Call once at startup."""
    shared_processors: list[Processor] = [
        structlog.contextvars.merge_contextvars,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        _add_app_context,
    ]

    if settings.is_development:
        # Pretty colored output for development
        processors: list[Processor] = shared_processors + [
            structlog.dev.ConsoleRenderer(colors=True)
        ]
    else:
        # JSON output for production (Datadog / CloudWatch / Loki)
        processors = shared_processors + [
            structlog.processors.dict_tracebacks,
            structlog.processors.JSONRenderer(),
        ]

    structlog.configure(
        processors=processors,
        wrapper_class=structlog.make_filtering_bound_logger(
            logging.DEBUG if settings.app_debug else logging.INFO
        ),
        context_class=dict,
        logger_factory=structlog.stdlib.LoggerFactory(),
        cache_logger_on_first_use=True,
    )


def get_logger(name: str) -> structlog.BoundLogger:  # type: ignore[type-arg]
    """Get a bound logger with module context."""
    return structlog.get_logger(name)


def bind_request_context(**kwargs: Any) -> None:
    """Bind request-scoped context (tenant_id, request_id, user_id)."""
    structlog.contextvars.bind_contextvars(**kwargs)


def clear_request_context() -> None:
    """Clear request-scoped context after each request."""
    structlog.contextvars.clear_contextvars()
