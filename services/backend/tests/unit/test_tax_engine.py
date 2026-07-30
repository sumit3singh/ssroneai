"""
Tests for The Baithak Tax Engine.
"""
from decimal import Decimal
import pytest

from src.core.tax_engine.engine import (
    TaxCalculationMethod, TaxEngine,
    gst_18_intrastate, gst_5_intrastate, gst_exempt,
)


class TestTaxEngine:
    def setup_method(self):
        self.engine = TaxEngine()

    def test_gst18_exclusive_calculation(self):
        group = gst_18_intrastate()
        result = self.engine.calculate(Decimal("100.00"), group)
        assert result.taxable_amount == Decimal("100.00")
        assert result.tax_breakdown["CGST"] == Decimal("9.00")
        assert result.tax_breakdown["SGST"] == Decimal("9.00")
        assert result.total_tax == Decimal("18.00")
        assert result.total_with_tax == Decimal("118.00")

    def test_gst5_exclusive_calculation(self):
        group = gst_5_intrastate()
        result = self.engine.calculate(Decimal("200.00"), group)
        assert result.total_tax == Decimal("10.00")
        assert result.total_with_tax == Decimal("210.00")

    def test_gst18_inclusive_calculation(self):
        group = gst_18_intrastate()
        group.calculation_method = TaxCalculationMethod.INCLUSIVE
        result = self.engine.calculate(Decimal("118.00"), group)
        assert result.taxable_amount == Decimal("100.00")
        assert result.total_tax == Decimal("18.00")
        assert result.total_with_tax == Decimal("118.00")

    def test_exempt_group_no_tax(self):
        group = gst_exempt()
        result = self.engine.calculate(Decimal("500.00"), group)
        assert result.total_tax == Decimal("0")
        assert result.total_with_tax == Decimal("500.00")

    def test_quantity_multiplier(self):
        group = gst_18_intrastate()
        result = self.engine.calculate(Decimal("100.00"), group, quantity=Decimal("3"))
        assert result.taxable_amount == Decimal("300.00")
        assert result.total_tax == Decimal("54.00")
        assert result.total_with_tax == Decimal("354.00")
