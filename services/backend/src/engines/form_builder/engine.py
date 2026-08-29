"""
The ssrone – Form Builder Engine
Reads field_master records from the database to generate
dynamic, validated forms for any business type without code changes.
"""
from dataclasses import dataclass, field
from enum import StrEnum
from typing import Any

from src.shared.logger import get_logger

logger = get_logger(__name__)


class FieldType(StrEnum):
    TEXT = "text"
    NUMBER = "number"
    EMAIL = "email"
    PHONE = "phone"
    DATE = "date"
    DATETIME = "datetime"
    SELECT = "select"
    MULTI_SELECT = "multi_select"
    CHECKBOX = "checkbox"
    TEXTAREA = "textarea"
    FILE = "file"
    IMAGE = "image"
    CURRENCY = "currency"
    PERCENTAGE = "percentage"
    GSTIN = "gstin"
    PAN = "pan"
    AADHAAR = "aadhaar"
    PINCODE = "pincode"
    HIDDEN = "hidden"
    SECTION_HEADER = "section_header"


@dataclass
class FieldValidation:
    min_value: float | None = None
    max_value: float | None = None
    min_length: int | None = None
    max_length: int | None = None
    regex_pattern: str | None = None
    regex_message: str | None = None
    allowed_values: list[str] = field(default_factory=list)


@dataclass
class FormField:
    field_id: str
    form_id: str
    field_name: str
    field_label: str
    field_type: FieldType
    placeholder: str = ""
    default_value: Any = None
    is_required: bool = False
    is_readonly: bool = False
    is_hidden: bool = False
    sort_order: int = 0
    section: str = "default"
    tab: str = "basic"
    width: str = "full"         # full | half | third
    help_text: str = ""
    validation: FieldValidation = field(default_factory=FieldValidation)
    options: list[dict[str, str]] = field(default_factory=list)  # For select fields
    depends_on: str | None = None   # Show only when another field has a value
    depends_value: str | None = None


@dataclass
class FormDefinition:
    form_id: str
    form_key: str
    title: str
    business_type_id: str | None = None
    description: str = ""
    fields: list[FormField] = field(default_factory=list)
    tabs: list[str] = field(default_factory=lambda: ["basic"])
    sections: list[str] = field(default_factory=lambda: ["default"])
    submit_label: str = "Save"
    is_active: bool = True


class FormBuilderEngine:
    """
    Metadata-driven form generator.
    Reads form/field definitions and outputs structured schemas
    consumed by the frontend FormRenderer component.
    """

    # Built-in regex validators
    VALIDATORS = {
        FieldType.GSTIN: {
            "pattern": r"^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$",
            "message": "Invalid GSTIN format",
        },
        FieldType.PAN: {
            "pattern": r"^[A-Z]{5}[0-9]{4}[A-Z]{1}$",
            "message": "Invalid PAN format",
        },
        FieldType.AADHAAR: {
            "pattern": r"^\d{12}$",
            "message": "Aadhaar must be 12 digits",
        },
        FieldType.PINCODE: {
            "pattern": r"^\d{6}$",
            "message": "PIN code must be 6 digits",
        },
        FieldType.EMAIL: {
            "pattern": r"^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$",
            "message": "Invalid email address",
        },
        FieldType.PHONE: {
            "pattern": r"^(\+91[\-\s]?)?[6-9]\d{9}$",
            "message": "Invalid Indian phone number",
        },
    }

    def to_json_schema(self, form: FormDefinition) -> dict[str, Any]:
        """Convert a FormDefinition to a JSON Schema for frontend validation."""
        properties: dict[str, Any] = {}
        required: list[str] = []

        for f in form.fields:
            if f.field_type == FieldType.SECTION_HEADER:
                continue

            prop: dict[str, Any] = {
                "title": f.field_label,
                "description": f.help_text,
                "default": f.default_value,
            }

            if f.field_type in (FieldType.TEXT, FieldType.TEXTAREA, FieldType.EMAIL,
                                FieldType.PHONE, FieldType.GSTIN, FieldType.PAN,
                                FieldType.AADHAAR, FieldType.PINCODE):
                prop["type"] = "string"
                if f.validation.min_length:
                    prop["minLength"] = f.validation.min_length
                if f.validation.max_length:
                    prop["maxLength"] = f.validation.max_length
                v = self.VALIDATORS.get(f.field_type)
                pattern = f.validation.regex_pattern or (v["pattern"] if v else None)
                if pattern:
                    prop["pattern"] = pattern

            elif f.field_type in (FieldType.NUMBER, FieldType.CURRENCY, FieldType.PERCENTAGE):
                prop["type"] = "number"
                if f.validation.min_value is not None:
                    prop["minimum"] = f.validation.min_value
                if f.validation.max_value is not None:
                    prop["maximum"] = f.validation.max_value

            elif f.field_type == FieldType.CHECKBOX:
                prop["type"] = "boolean"

            elif f.field_type == FieldType.SELECT:
                prop["type"] = "string"
                if f.options:
                    prop["enum"] = [o["value"] for o in f.options]

            elif f.field_type == FieldType.MULTI_SELECT:
                prop["type"] = "array"
                if f.options:
                    prop["items"] = {"enum": [o["value"] for o in f.options]}

            elif f.field_type in (FieldType.DATE, FieldType.DATETIME):
                prop["type"] = "string"
                prop["format"] = "date" if f.field_type == FieldType.DATE else "date-time"

            properties[f.field_name] = prop
            if f.is_required:
                required.append(f.field_name)

        return {
            "$schema": "http://json-schema.org/draft-07/schema#",
            "title": form.title,
            "type": "object",
            "properties": properties,
            "required": required,
        }

    def group_by_tabs(self, form: FormDefinition) -> dict[str, list[FormField]]:
        """Group fields by their tab for progressive form rendering."""
        tabs: dict[str, list[FormField]] = {}
        for f in sorted(form.fields, key=lambda x: x.sort_order):
            tabs.setdefault(f.tab, []).append(f)
        return tabs

    def validate_value(self, field: FormField, value: Any) -> list[str]:
        """Validate a single field value. Returns list of error messages."""
        errors: list[str] = []
        if field.is_required and (value is None or value == ""):
            errors.append(f"{field.field_label} is required")
            return errors

        if value is None or value == "":
            return errors

        v = field.validation
        if v.min_length and isinstance(value, str) and len(value) < v.min_length:
            errors.append(f"{field.field_label} must be at least {v.min_length} characters")
        if v.max_length and isinstance(value, str) and len(value) > v.max_length:
            errors.append(f"{field.field_label} must be at most {v.max_length} characters")

        built_in = self.VALIDATORS.get(field.field_type)
        pattern = v.regex_pattern or (built_in["pattern"] if built_in else None)
        if pattern and isinstance(value, str):
            import re
            if not re.match(pattern, value):
                msg = v.regex_message or (built_in["message"] if built_in else f"Invalid {field.field_label}")
                errors.append(msg)

        return errors


form_builder = FormBuilderEngine()
