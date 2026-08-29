"""
Metadata Engine for SSR One AI Backend
Provides cached retrieval of dynamic form, table, report, workflow, and permission metadata.
"""
import json
from pathlib import Path
from typing import Any, Dict, Optional
from src.core.cache.redis import cache_response


class MetadataEngine:
    """Centralized Metadata Engine serving dynamic UI & system configurations."""

    def __init__(self, metadata_base_path: str = "metadata") -> None:
        self.base_path = Path(metadata_base_path)

    def load_metadata_file(self, domain: str, name: str) -> Optional[Dict[str, Any]]:
        """Load JSON metadata file from metadata directory."""
        file_path = self.base_path / domain / f"{name}.json"
        if not file_path.exists():
            return None
        with open(file_path, "r", encoding="utf-8") as f:
            return json.load(f)

    @cache_response(ttl=600, prefix="ssrone:metadata:form")
    async def get_form_metadata(self, form_name: str) -> Optional[Dict[str, Any]]:
        """Retrieve form metadata."""
        return self.load_metadata_file("forms", form_name)

    @cache_response(ttl=600, prefix="ssrone:metadata:table")
    async def get_table_metadata(self, table_name: str) -> Optional[Dict[str, Any]]:
        """Retrieve table metadata."""
        return self.load_metadata_file("tables", table_name)

    @cache_response(ttl=600, prefix="ssrone:metadata:report")
    async def get_report_metadata(self, report_name: str) -> Optional[Dict[str, Any]]:
        """Retrieve report metadata."""
        return self.load_metadata_file("reports", report_name)

    @cache_response(ttl=600, prefix="ssrone:metadata:workflow")
    async def get_workflow_metadata(self, workflow_name: str) -> Optional[Dict[str, Any]]:
        """Retrieve workflow metadata."""
        return self.load_metadata_file("workflow", workflow_name)

    @cache_response(ttl=600, prefix="ssrone:metadata:permission")
    async def get_permission_metadata(self, permission_name: str) -> Optional[Dict[str, Any]]:
        """Retrieve permission metadata."""
        return self.load_metadata_file("permissions", permission_name)


metadata_engine = MetadataEngine()
