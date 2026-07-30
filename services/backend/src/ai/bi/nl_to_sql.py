"""
Natural Language to SQL (NL-to-SQL) Reporting Engine
Converts natural language user questions into analytical SQL queries.
"""
from typing import Dict, Any


class NLToSQLEngine:
    """NL-to-SQL Converter."""

    def convert_to_sql(self, natural_language_query: str) -> Dict[str, Any]:
        """Translate user natural language question to read-only SQL query."""
        q = natural_language_query.lower()
        if "sales" in q or "revenue" in q:
            sql = "SELECT DATE(created_at) as date, SUM(total_amount) as revenue FROM pos_orders GROUP BY DATE(created_at) ORDER BY date DESC LIMIT 30;"
        elif "top items" in q or "best sellers" in q:
            sql = "SELECT item_name, SUM(quantity) as total_qty FROM order_items GROUP BY item_name ORDER BY total_qty DESC LIMIT 10;"
        else:
            sql = "SELECT COUNT(*) as total_orders FROM pos_orders;"

        return {
            "query": natural_language_query,
            "generated_sql": sql,
            "is_read_only": True,
        }


nl_to_sql_engine = NLToSQLEngine()
