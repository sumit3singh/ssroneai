"""
Enterprise Print & ESC/POS Receipt Rendering Engine
Generates thermal receipt payloads, KOT kitchen tickets, and invoice print commands.
"""
from typing import Dict, Any, List


class PrintEngine:
    """Print Engine rendering thermal receipt commands and PDF templates."""

    def generate_receipt_payload(
        self, order_number: str, items: List[Dict[str, Any]], total: float, tax: float
    ) -> Dict[str, Any]:
        """Generate structured thermal receipt layout payload."""
        return {
            "order_number": order_number,
            "header": "THE ssrone ENTERPRISE ERP",
            "items": [
                {
                    "name": item.get("name", "Item"),
                    "qty": item.get("quantity", 1),
                    "price": item.get("unit_price", 0.0),
                }
                for item in items
            ],
            "subtotal": total - tax,
            "tax": tax,
            "total": total,
            "footer": "Thank you for visiting! Powered by SSR One AI",
        }


print_engine = PrintEngine()
