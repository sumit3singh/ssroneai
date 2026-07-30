"""
The Baithak – Form Builder Router
API endpoints for fetching dynamic forms and submitting response payloads.
"""
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.database.engine import get_db_session
from src.core.form_builder.engine import (
    FieldValidation,
    FormDefinition,
    FormField,
    form_builder,
)
from src.core.form_builder.models import (
    FieldValidationModel,
    FormFieldModel,
    FormMaster,
    FormSubmission,
)
from src.modules.auth.dependencies import get_current_user
from src.modules.auth.models import User

router = APIRouter(prefix="/forms", tags=["Form Builder"])


class FormSubmissionRequest(BaseModel):
    payload: dict[str, Any]


@router.get("/{form_key}")
async def get_form_definition(
    form_key: str, db: AsyncSession = Depends(get_db_session)
) -> dict[str, Any]:
    """Fetch metadata of a form by its key and generate validation schema."""
    result = await db.execute(
        select(FormMaster).where(FormMaster.form_key == form_key, FormMaster.is_active == True)
    )
    form = result.scalar_one_or_none()
    if not form:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Form '{form_key}' not found or inactive.",
        )

    # Fetch form fields
    fields_result = await db.execute(
        select(FormFieldModel)
        .where(FormFieldModel.form_id == form.id)
        .order_by(FormFieldModel.sort_order)
    )
    fields = fields_result.scalars().all()

    form_fields = []
    tabs = set()
    sections = set()

    for f in fields:
        # Load validation metadata if present
        val_result = await db.execute(
            select(FieldValidationModel).where(FieldValidationModel.field_id == f.id)
        )
        val = val_result.scalar_one_or_none()

        validation = FieldValidation(
            min_value=val.min_value if val else None,
            max_value=val.max_value if val else None,
            min_length=val.min_length if val else None,
            max_length=val.max_length if val else None,
            regex_pattern=val.regex_pattern if val else None,
            regex_message=val.regex_message if val else None,
        )

        form_fields.append(
            FormField(
                field_id=str(f.id),
                form_id=str(f.form_id),
                field_name=f.field_name,
                field_label=f.field_label,
                field_type=f.field_type,  # type: ignore[arg-type]
                placeholder=f.placeholder or "",
                default_value=f.default_value,
                is_required=f.is_required,
                is_readonly=f.is_readonly,
                is_hidden=f.is_hidden,
                sort_order=f.sort_order,
                section=f.section,
                tab=f.tab,
                width=f.width,
                help_text=f.help_text or "",
                options=f.options or [],
                depends_on=f.depends_on,
                depends_value=f.depends_value,
                validation=validation,
            )
        )

        tabs.add(f.tab)
        sections.add(f.section)

    form_def = FormDefinition(
        form_id=str(form.id),
        form_key=form.form_key,
        title=form.title,
        business_type_id=form.business_type_id,
        description=form.description or "",
        fields=form_fields,
        tabs=list(tabs) if tabs else ["basic"],
        sections=list(sections) if sections else ["default"],
        submit_label=form.submit_label,
        is_active=form.is_active,
    )

    json_schema = form_builder.to_json_schema(form_def)

    # Convert FormField objects to dicts for JSON serialization
    serialized_fields = []
    for f in form_fields:
        serialized_fields.append(
            {
                "id": f.field_id,
                "name": f.field_name,
                "label": f.field_label,
                "type": f.field_type,
                "placeholder": f.placeholder,
                "default_value": f.default_value,
                "is_required": f.is_required,
                "is_readonly": f.is_readonly,
                "is_hidden": f.is_hidden,
                "section": f.section,
                "tab": f.tab,
                "width": f.width,
                "help_text": f.help_text,
                "options": f.options,
                "depends_on": f.depends_on,
                "depends_value": f.depends_value,
                "validation": {
                    "min_value": f.validation.min_value,
                    "max_value": f.validation.max_value,
                    "min_length": f.validation.min_length,
                    "max_length": f.validation.max_length,
                    "regex_pattern": f.validation.regex_pattern,
                    "regex_message": f.validation.regex_message,
                },
            }
        )

    return {
        "form_id": form_def.form_id,
        "form_key": form_def.form_key,
        "title": form_def.title,
        "description": form_def.description,
        "submit_label": form_def.submit_label,
        "fields": serialized_fields,
        "tabs": form_def.tabs,
        "sections": form_def.sections,
        "json_schema": json_schema,
    }


@router.post("/{form_key}/submit")
async def submit_form(
    form_key: str,
    body: FormSubmissionRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> dict[str, Any]:
    """Validate dynamic form submission values and save them."""
    result = await db.execute(
        select(FormMaster).where(FormMaster.form_key == form_key, FormMaster.is_active == True)
    )
    form = result.scalar_one_or_none()
    if not form:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Form '{form_key}' not found or inactive.",
        )

    # Fetch form fields to validate them
    fields_result = await db.execute(
        select(FormFieldModel).where(FormFieldModel.form_id == form.id)
    )
    fields = fields_result.scalars().all()

    validation_errors = {}

    for f in fields:
        val_result = await db.execute(
            select(FieldValidationModel).where(FieldValidationModel.field_id == f.id)
        )
        val = val_result.scalar_one_or_none()

        validation = FieldValidation(
            min_value=val.min_value if val else None,
            max_value=val.max_value if val else None,
            min_length=val.min_length if val else None,
            max_length=val.max_length if val else None,
            regex_pattern=val.regex_pattern if val else None,
            regex_message=val.regex_message if val else None,
        )

        form_field = FormField(
            field_id=str(f.id),
            form_id=str(f.form_id),
            field_name=f.field_name,
            field_label=f.field_label,
            field_type=f.field_type,  # type: ignore[arg-type]
            is_required=f.is_required,
            validation=validation,
        )

        value = body.payload.get(f.field_name)
        errors = form_builder.validate_value(form_field, value)
        if errors:
            validation_errors[f.field_name] = errors

    if validation_errors:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={
                "error": "validation_failed",
                "message": "Dynamic form validation failed.",
                "fields": validation_errors,
            },
        )

    # Save to dynamic response table
    submission = FormSubmission(
        tenant_id=current_user.tenant_id,
        form_key=form_key,
        submitted_by=current_user.id,
        payload=body.payload,
        created_by=current_user.id,
    )
    db.add(submission)
    await db.flush()

    return {
        "success": True,
        "submission_id": str(submission.id),
        "message": "Form submission saved successfully!",
    }
