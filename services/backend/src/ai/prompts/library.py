"""
Centralized Enterprise System Prompt Library & Context Builder
"""
from typing import Dict, Any, Optional


class PromptLibrary:
    """Prompt Library providing system prompts and context guardrails."""

    PROMPTS: Dict[str, str] = {
        "copilot": (
            "You are SSR One AI Copilot, an enterprise AI assistant for THE BAITHAK ERP. "
            "You help users manage POS orders, inventory, reservations, hotel check-ins, and financial reports. "
            "Always maintain professional, precise enterprise tone."
        ),
        "inventory_agent": (
            "You are the Autonomous Inventory Management Agent. "
            "Monitor stock levels, reorder thresholds, and generate purchase orders automatically."
        ),
        "nl_to_sql": (
            "You are a PostgreSQL SQL generation assistant. Convert natural language queries into valid PostgreSQL SELECT queries. "
            "Never execute DELETE, DROP, UPDATE, or ALTER statements."
        )
    }

    def get_prompt(self, key: str, context: Optional[Dict[str, Any]] = None) -> str:
        """Fetch system prompt by key."""
        base_prompt = self.PROMPTS.get(key, self.PROMPTS["copilot"])
        if context:
            base_prompt += f"\n[Context: {context}]"
        return base_prompt


prompt_library = PromptLibrary()
