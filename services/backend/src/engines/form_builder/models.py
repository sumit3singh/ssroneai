"""
The ssrone – Form Builder Database Models
ORM models for metadata-driven dynamic forms, fields, validation, and submissions.
"""
from sqlalchemy import BigInteger, Boolean, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.core.database.models import BaseModel, TenantBaseModel


class FormMaster(BaseModel):
    """Metadata catalog for dynamic forms."""
    __tablename__ = "form_master"

    form_key: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str | None] = mapped_column(String(500), nullable=True)
    business_type_id: Mapped[str | None] = mapped_column(String(50), nullable=True)
    submit_label: Mapped[str] = mapped_column(String(50), default="Save")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    # Relationships
    fields: Mapped[list["FormFieldModel"]] = relationship(
        "FormFieldModel",
        back_populates="form",
        cascade="all, delete-orphan",
        order_by="FormFieldModel.sort_order",
    )


class FormFieldModel(BaseModel):
    """Metadata definition of a field inside a dynamic form."""
    __tablename__ = "form_fields"

    form_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("form_master.id", ondelete="CASCADE"), nullable=False
    )
    field_name: Mapped[str] = mapped_column(String(100), nullable=False)
    field_label: Mapped[str] = mapped_column(String(200), nullable=False)
    field_type: Mapped[str] = mapped_column(String(50), nullable=False)  # text, number, select, etc.
    placeholder: Mapped[str | None] = mapped_column(String(200), nullable=True)
    default_value: Mapped[str | None] = mapped_column(String(200), nullable=True)
    is_required: Mapped[bool] = mapped_column(Boolean, default=False)
    is_readonly: Mapped[bool] = mapped_column(Boolean, default=False)
    is_hidden: Mapped[bool] = mapped_column(Boolean, default=False)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    section: Mapped[str] = mapped_column(String(50), default="default")
    tab: Mapped[str] = mapped_column(String(50), default="basic")
    width: Mapped[str] = mapped_column(String(50), default="full")  # full | half | third
    help_text: Mapped[str | None] = mapped_column(String(500), nullable=True)
    options: Mapped[list[dict] | None] = mapped_column(JSONB, nullable=True)  # [{"label": "A", "value": "a"}]
    depends_on: Mapped[str | None] = mapped_column(String(100), nullable=True)
    depends_value: Mapped[str | None] = mapped_column(String(100), nullable=True)

    # Relationships
    form: Mapped[FormMaster] = relationship("FormMaster", back_populates="fields")
    validation: Mapped["FieldValidationModel | None"] = relationship(
        "FieldValidationModel",
        back_populates="field",
        cascade="all, delete-orphan",
        uselist=False,
    )

    __table_args__ = (
        UniqueConstraint("form_id", "field_name", name="uq_form_field_name"),
    )


class FieldValidationModel(BaseModel):
    """Validation metadata for a dynamic form field."""
    __tablename__ = "field_validations"

    field_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("form_fields.id", ondelete="CASCADE"), nullable=False, unique=True
    )
    min_value: Mapped[float | None] = mapped_column(nullable=True)
    max_value: Mapped[float | None] = mapped_column(nullable=True)
    min_length: Mapped[int | None] = mapped_column(nullable=True)
    max_length: Mapped[int | None] = mapped_column(nullable=True)
    regex_pattern: Mapped[str | None] = mapped_column(String(500), nullable=True)
    regex_message: Mapped[str | None] = mapped_column(String(300), nullable=True)
    allowed_values: Mapped[list[str] | None] = mapped_column(JSONB, nullable=True)

    # Relationships
    field: Mapped[FormFieldModel] = relationship("FormFieldModel", back_populates="validation")


class FormSubmission(TenantBaseModel):
    """Stores submissions from metadata-driven forms scoped by tenant."""
    __tablename__ = "form_submissions"

    form_key: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    submitted_by: Mapped[int | None] = mapped_column(BigInteger, nullable=True)
    payload: Mapped[dict] = mapped_column(JSONB, default=dict)
