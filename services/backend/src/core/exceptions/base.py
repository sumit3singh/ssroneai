"""
Enterprise Base Exception Hierarchy for FastAPI Backend.
"""
from typing import Any, Optional


class AppException(Exception):
    """Base application exception."""

    def __init__(
        self,
        message: str = "An internal server error occurred",
        code: str = "INTERNAL_SERVER_ERROR",
        status_code: int = 500,
        details: Optional[list[Any]] = None,
    ) -> None:
        super().__init__(message)
        self.message = message
        self.code = code
        self.status_code = status_code
        self.details = details or []


class EntityNotFoundException(AppException):
    def __init__(self, entity_name: str, entity_id: Any) -> None:
        super().__init__(
            message=f"{entity_name} with id '{entity_id}' was not found.",
            code="ENTITY_NOT_FOUND",
            status_code=404,
        )


class UnauthorizedException(AppException):
    def __init__(self, message: str = "Authentication credentials were invalid or missing.") -> None:
        super().__init__(
            message=message,
            code="UNAUTHORIZED",
            status_code=401,
        )


class ForbiddenException(AppException):
    def __init__(self, message: str = "You do not have permission to perform this operation.") -> None:
        super().__init__(
            message=message,
            code="FORBIDDEN",
            status_code=403,
        )


class ValidationException(AppException):
    def __init__(self, message: str = "Validation failed.", details: Optional[list[Any]] = None) -> None:
        super().__init__(
            message=message,
            code="VALIDATION_ERROR",
            status_code=422,
            details=details,
        )
