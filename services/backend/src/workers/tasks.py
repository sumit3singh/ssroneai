"""
The ssrone – Background Tasks
Celery task definitions for notifications, PDF export, AI processing.
"""
from src.workers.celery_app import celery_app
from src.shared.logger import get_logger

logger = get_logger(__name__)


@celery_app.task(name="src.shared.tasks.send_email", bind=True, max_retries=3)
def send_email(self, to: str, subject: str, body: str, html: str | None = None) -> dict:
    """Send transactional email via configured SMTP."""
    try:
        logger.info("Sending email", to=to, subject=subject)
        # In production: use FastAPI-Mail / SMTP client here
        return {"status": "sent", "to": to}
    except Exception as exc:
        logger.error("Email send failed", error=str(exc))
        raise self.retry(exc=exc, countdown=60)


@celery_app.task(name="src.shared.tasks.generate_pdf", bind=True)
def generate_pdf(self, template: str, data: dict, output_path: str) -> dict:
    """Render a PDF from a Jinja2 template with WeasyPrint."""
    try:
        logger.info("Generating PDF", template=template, output=output_path)
        # In production: render HTML template -> WeasyPrint -> save to disk/S3
        return {"status": "done", "path": output_path}
    except Exception as exc:
        logger.error("PDF generation failed", error=str(exc))
        raise


@celery_app.task(name="src.shared.tasks.run_ai_job", bind=True)
def run_ai_job(self, job_type: str, payload: dict) -> dict:
    """Run an async AI forecasting or analysis job."""
    try:
        logger.info("Running AI job", job_type=job_type)
        # In production: call LLM / Prophet forecasting pipeline
        return {"status": "done", "job_type": job_type}
    except Exception as exc:
        logger.error("AI job failed", error=str(exc))
        raise


@celery_app.task(name="src.shared.tasks.send_whatsapp")
def send_whatsapp(to: str, message: str, template_name: str | None = None) -> dict:
    """Send WhatsApp message via configured gateway."""
    logger.info("Sending WhatsApp", to=to)
    return {"status": "queued", "to": to}


@celery_app.task(name="src.shared.tasks.export_report")
def export_report(report_type: str, filters: dict, tenant_id: str, user_id: str) -> dict:
    """Generate and email a report export (Excel/CSV/PDF)."""
    logger.info("Exporting report", report_type=report_type, tenant_id=tenant_id)
    return {"status": "queued", "report_type": report_type}
