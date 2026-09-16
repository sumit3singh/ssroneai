"""
Compatibility shim for Form Builder models.
Re-exports canonical models from src.engines.form_builder.models.
"""
from src.engines.form_builder.models import (
    FieldValidationModel,
    FormFieldModel,
    FormMaster,
    FormSubmission,
)

__all__ = [
    "FieldValidationModel",
    "FormFieldModel",
    "FormMaster",
    "FormSubmission",
]
