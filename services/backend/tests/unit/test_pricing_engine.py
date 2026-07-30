"""
Tests for The Baithak Pricing Engine.
"""
from decimal import Decimal
import pytest

from src.core.pricing_engine.engine import (
    PricingContext, PricingEngine, PriceRule, PriceType,
)


class TestPricingEngine:
    def setup_method(self):
        self.engine = PricingEngine()

    def _ctx(self, **kwargs):
        return PricingContext(
            product_id="prod-1",
            base_price=Decimal("100.00"),
            **kwargs,
        )

    def test_returns_base_price_with_no_rules(self):
        ctx = self._ctx()
        result = self.engine.compute(ctx, [])
        assert result.unit_price == Decimal("100.00")
        assert result.price_type == PriceType.MRP

    def test_applies_pos_rule(self):
        rules = [PriceRule("r1", PriceType.POS, Decimal("90.00"))]
        result = self.engine.compute(self._ctx(channel="pos"), rules)
        assert result.unit_price == Decimal("90.00")
        assert result.applied_rules == ["r1"]

    def test_happy_hour_wins_over_pos(self):
        rules = [
            PriceRule("pos", PriceType.POS, Decimal("90.00")),
            PriceRule("hh", PriceType.HAPPY_HOUR, Decimal("75.00")),
        ]
        result = self.engine.compute(self._ctx(is_happy_hour=True), rules)
        assert result.unit_price == Decimal("75.00")
        assert result.applied_rules == ["hh"]

    def test_happy_hour_ignored_when_not_active(self):
        rules = [
            PriceRule("pos", PriceType.POS, Decimal("90.00")),
            PriceRule("hh", PriceType.HAPPY_HOUR, Decimal("75.00")),
        ]
        result = self.engine.compute(self._ctx(is_happy_hour=False), rules)
        assert result.unit_price == Decimal("90.00")

    def test_vip_pricing_applied_for_vip_customer(self):
        rules = [
            PriceRule("pos", PriceType.POS, Decimal("100.00")),
            PriceRule("vip", PriceType.VIP, Decimal("80.00")),
        ]
        result = self.engine.compute(self._ctx(customer_tier="VIP"), rules)
        assert result.unit_price == Decimal("80.00")

    def test_line_total_calculated_correctly(self):
        rules = [PriceRule("pos", PriceType.POS, Decimal("50.00"))]
        ctx = self._ctx(quantity=Decimal("3"))
        result = self.engine.compute(ctx, rules)
        assert result.line_total == Decimal("150.00")

    def test_inactive_rule_ignored(self):
        rules = [PriceRule("r1", PriceType.POS, Decimal("50.00"), is_active=False)]
        result = self.engine.compute(self._ctx(), rules)
        assert result.unit_price == Decimal("100.00")
