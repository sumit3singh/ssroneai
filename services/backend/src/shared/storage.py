"""
The ssrone – Platform File Storage & Media Service
Handles secure document, image, PDF, and KYC file storage across local, S3, and GCS providers.
"""
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from src.shared.logger import get_logger

logger = get_logger(__name__)


@dataclass
class StoredFile:
    file_id: str
    tenant_id: str
    file_name: str
    content_type: str
    size_bytes: int
    url: str
    category: str  # "kyc", "invoice_pdf", "room_photo", "qr_code", "menu"


class StorageService:
    """
    Unified Storage Service abstraction.
    Saves and resolves tenant media files securely.
    """

    def upload_file(self, tenant_id: str, file_name: str, content: bytes, category: str) -> StoredFile:
        """Simulate secure storage save and return metadata URL."""
        file_id = f"file-{tenant_id}-{hash(file_name) & 0xffffffff}"
        url = f"/storage/{tenant_id}/{category}/{file_name}"
        
        logger.info(
            "File uploaded successfully",
            tenant_id=tenant_id,
            file_id=file_id,
            category=category,
            url=url
        )
        
        return StoredFile(
            file_id=file_id,
            tenant_id=tenant_id,
            file_name=file_name,
            content_type="application/octet-stream",
            size_bytes=len(content),
            url=url,
            category=category
        )


storage_service = StorageService()
