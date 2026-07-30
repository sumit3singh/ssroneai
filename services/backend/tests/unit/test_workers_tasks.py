import pytest
from unittest.mock import MagicMock, patch
from src.workers.tasks import send_email, generate_pdf, run_ai_job, send_whatsapp, export_report

def test_send_email_success():
    res = send_email.run("test@example.com", "Subject", "Body")
    assert res["status"] == "sent"
    assert res["to"] == "test@example.com"

def test_send_email_retry():
    with patch("src.workers.tasks.send_email.retry", side_effect=Exception("retried")) as mock_retry:
        with patch("src.workers.tasks.logger.info", side_effect=ValueError("SMTP Error")):
            with pytest.raises(Exception) as exc_info:
                send_email.run("test@example.com", "Subject", "Body")
            assert str(exc_info.value) == "retried"
            mock_retry.assert_called_once()

def test_generate_pdf_success():
    res = generate_pdf.run("invoice.html", {"amount": 100}, "/tmp/invoice.pdf")
    assert res["status"] == "done"
    assert res["path"] == "/tmp/invoice.pdf"

def test_generate_pdf_failure():
    with patch("src.workers.tasks.logger.info", side_effect=ValueError("Weasyprint Error")):
        with pytest.raises(ValueError):
            generate_pdf.run("invoice.html", {"amount": 100}, "/tmp/invoice.pdf")

def test_run_ai_job_success():
    res = run_ai_job.run("forecast", {"days": 30})
    assert res["status"] == "done"
    assert res["job_type"] == "forecast"

def test_run_ai_job_failure():
    with patch("src.workers.tasks.logger.info", side_effect=ValueError("GPU Error")):
        with pytest.raises(ValueError):
            run_ai_job.run("forecast", {"days": 30})

def test_send_whatsapp_success():
    res = send_whatsapp("1234567890", "Hello", "template_a")
    assert res["status"] == "queued"
    assert res["to"] == "1234567890"

def test_export_report_success():
    res = export_report("sales", {"start_date": "2026-01-01"}, "tenant_id", "user_id")
    assert res["status"] == "queued"
    assert res["report_type"] == "sales"
