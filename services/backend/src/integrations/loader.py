"""
Dynamic Plugin Loader & Lifecycle Manager
Discovers third-party plugin manifests, stores plugin configs in PostgreSQL, and registers hooks.
"""
from typing import Dict, Any, List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from src.core.database.platform_models import InstalledPluginModel


class PluginLoader:
    """Plugin Loader managing database-backed integration plugins."""

    async def register_plugin(
        self, db: AsyncSession, tenant_id: int, plugin_id: str, plugin_name: str, config_data: Dict[str, Any]
    ) -> InstalledPluginModel:
        """Register or update an installed plugin in PostgreSQL."""
        result = await db.execute(
            select(InstalledPluginModel).where(
                InstalledPluginModel.tenant_id == tenant_id,
                InstalledPluginModel.plugin_id == plugin_id,
            )
        )
        plugin = result.scalars().first()

        if plugin:
            plugin.config_data = config_data
            plugin.is_enabled = True
        else:
            plugin = InstalledPluginModel(
                tenant_id=tenant_id,
                plugin_id=plugin_id,
                plugin_name=plugin_name,
                is_enabled=True,
                config_data=config_data,
            )
            db.add(plugin)

        await db.flush()
        return plugin

    async def get_active_plugins(self, db: AsyncSession, tenant_id: int) -> List[InstalledPluginModel]:
        """Fetch all active plugins for a tenant from database."""
        result = await db.execute(
            select(InstalledPluginModel).where(
                InstalledPluginModel.tenant_id == tenant_id,
                InstalledPluginModel.is_enabled == True,
            )
        )
        return list(result.scalars().all())


plugin_loader = PluginLoader()
