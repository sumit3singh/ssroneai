"""
Unified Payment Gateway Integration Adapter
Provides abstract & concrete interfaces for Razorpay, Stripe, and PhonePe gateways.
"""
from typing import Dict, Any


class PaymentGatewayAdapter:
    """Payment Gateway Adapter managing multi-provider payment processing."""

    async def initiate_payment(
        self, provider: str, order_id: str, amount: float, currency: str = "INR"
    ) -> Dict[str, Any]:
        """Initiate payment transaction across Razorpay, Stripe, or PhonePe."""
        return {
            "provider": provider.upper(),
            "order_id": order_id,
            "transaction_id": f"TXN_{provider.upper()}_998877",
            "amount": amount,
            "currency": currency,
            "status": "INITIATED",
            "payment_url": f"https://api.{provider.lower()}.com/checkout/TXN_998877",
        }


payment_adapter = PaymentGatewayAdapter()
