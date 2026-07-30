"""
The Baithak – Tax Engine
Global tax engine supporting CGST, SGST, IGST, VAT, CESS,
tax-inclusive, tax-exclusive pricing, and location-dependent tax rules.
"""
from dataclasses import dataclass, field
from decimal import ROUND_HALF_UP, Decimal
from enum import StrEnum
from typing import Any

from src.shared.logger import get_logger

logger = get_logger(__name__)


class TaxType(StrEnum):
    CGST = "CGST"           # Central GST (India)
    SGST = "SGST"           # State GST (India)
    IGST = "IGST"           # Integrated GST (inter-state India)
    CESS = "CESS"           # Cess (India)
    VAT = "VAT"             # Value Added Tax (global)
    SERVICE_TAX = "SERVICE_TAX"
    EXEMPT = "EXEMPT"
    ZERO_RATED = "ZERO_RATED"


class TaxCalculationMethod(StrEnum):
    EXCLUSIVE = "exclusive"     # Tax added ON TOP of price
    INCLUSIVE = "inclusive"     # Tax already included IN price


@dataclass
class TaxComponent:
    """A single tax component (e.g., CGST @ 9%)."""
    tax_type: TaxType
    rate: Decimal               # e.g., Decimal("9.00") for 9%
    name: str
    hsn_code: str | None = None
    cess_rate: Decimal = Decimal("0")

    @property
    def effective_rate(self) -> Decimal:
        return self.rate + self.cess_rate


@dataclass
class TaxGroup:
    """
    A group of tax components applied together.
    e.g., GST 18% = CGST 9% + SGST 9%
    """
    group_id: str
    group_name: str             # "GST 18%", "GST 5%", "Exempt"
    components: list[TaxComponent]
    calculation_method: TaxCalculationMethod = TaxCalculationMethod.EXCLUSIVE
    applicable_states: list[str] = field(default_factory=list)   # Empty = all states
    business_type_ids: list[str] = field(default_factory=list)   # Empty = all types

    @property
    def total_rate(self) -> Decimal:
        return sum(c.effective_rate for c in self.components)


@dataclass
class TaxCalculationResult:
    """Detailed result of a tax calculation."""
    taxable_amount: Decimal
    tax_breakdown: dict[str, Decimal]   # {"CGST": 9.00, "SGST": 9.00}
    total_tax: Decimal
    total_with_tax: Decimal
    tax_group_id: str
    calculation_method: TaxCalculationMethod


class TaxEngine:
    """
    Universal Tax Engine.

    Supports:
    - India GST: CGST + SGST (intra-state), IGST (inter-state)
    - International VAT
    - Tax-inclusive and tax-exclusive price modes
    - Location-based tax rule selection
    - CESS calculation
    """

    def calculate(
        self,
        amount: Decimal,
        tax_group: TaxGroup,
        quantity: Decimal = Decimal("1"),
    ) -> TaxCalculationResult:
        """
        Calculate taxes for a given amount and tax group.

        Args:
            amount: Unit price (exclusive) or inclusive price depending on method
            tax_group: The applicable tax group
            quantity: Item quantity

        Returns:
            TaxCalculationResult with full breakdown
        """
        line_amount = (amount * quantity).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

        if tax_group.calculation_method == TaxCalculationMethod.EXCLUSIVE:
            return self._calculate_exclusive(line_amount, tax_group)
        else:
            return self._calculate_inclusive(line_amount, tax_group)

    def _calculate_exclusive(
        self, taxable_amount: Decimal, tax_group: TaxGroup
    ) -> TaxCalculationResult:
        """Tax is ADDED on top of the base price."""
        breakdown: dict[str, Decimal] = {}
        total_tax = Decimal("0")

        for component in tax_group.components:
            tax_amount = (taxable_amount * component.rate / 100).quantize(
                Decimal("0.01"), rounding=ROUND_HALF_UP
            )
            breakdown[component.tax_type] = tax_amount
            total_tax += tax_amount

            if component.cess_rate > 0:
                cess_amount = (taxable_amount * component.cess_rate / 100).quantize(
                    Decimal("0.01"), rounding=ROUND_HALF_UP
                )
                cess_key = f"{component.tax_type}_CESS"
                breakdown[cess_key] = cess_amount
                total_tax += cess_amount

        return TaxCalculationResult(
            taxable_amount=taxable_amount,
            tax_breakdown=breakdown,
            total_tax=total_tax,
            total_with_tax=(taxable_amount + total_tax).quantize(
                Decimal("0.01"), rounding=ROUND_HALF_UP
            ),
            tax_group_id=tax_group.group_id,
            calculation_method=TaxCalculationMethod.EXCLUSIVE,
        )

    def _calculate_inclusive(
        self, inclusive_amount: Decimal, tax_group: TaxGroup
    ) -> TaxCalculationResult:
        """Tax is ALREADY INCLUDED in the price — extract it."""
        total_rate = tax_group.total_rate
        divisor = Decimal("100") + total_rate
        taxable_amount = (inclusive_amount * 100 / divisor).quantize(
            Decimal("0.01"), rounding=ROUND_HALF_UP
        )
        total_tax = (inclusive_amount - taxable_amount).quantize(
            Decimal("0.01"), rounding=ROUND_HALF_UP
        )

        breakdown: dict[str, Decimal] = {}
        remaining = total_tax

        for i, component in enumerate(tax_group.components):
            if i == len(tax_group.components) - 1:
                # Last component gets the remainder to avoid rounding errors
                breakdown[component.tax_type] = remaining
            else:
                comp_tax = (taxable_amount * component.effective_rate / 100).quantize(
                    Decimal("0.01"), rounding=ROUND_HALF_UP
                )
                breakdown[component.tax_type] = comp_tax
                remaining -= comp_tax

        return TaxCalculationResult(
            taxable_amount=taxable_amount,
            tax_breakdown=breakdown,
            total_tax=total_tax,
            total_with_tax=inclusive_amount,
            tax_group_id=tax_group.group_id,
            calculation_method=TaxCalculationMethod.INCLUSIVE,
        )

    def select_tax_group(
        self,
        available_groups: list[TaxGroup],
        state_code: str | None = None,
        is_inter_state: bool = False,
        business_type_id: str | None = None,
    ) -> TaxGroup | None:
        """
        Select the most applicable tax group for the given context.
        Inter-state transactions should use IGST groups.
        """
        filtered = [
            g for g in available_groups
            if not g.business_type_ids or business_type_id in g.business_type_ids
        ]

        if is_inter_state:
            igst_groups = [
                g for g in filtered
                if any(c.tax_type == TaxType.IGST for c in g.components)
            ]
            if igst_groups:
                return igst_groups[0]

        if state_code:
            state_groups = [
                g for g in filtered
                if state_code in g.applicable_states or not g.applicable_states
            ]
            if state_groups:
                return state_groups[0]

        return filtered[0] if filtered else None


# ──────────────────────────────────────────────
# Common Indian GST group presets
# ──────────────────────────────────────────────

def gst_18_intrastate() -> TaxGroup:
    """GST 18% — CGST 9% + SGST 9% (intra-state)."""
    return TaxGroup(
        group_id="GST18_INTRA",
        group_name="GST 18%",
        components=[
            TaxComponent(TaxType.CGST, Decimal("9"), "CGST @ 9%"),
            TaxComponent(TaxType.SGST, Decimal("9"), "SGST @ 9%"),
        ],
        calculation_method=TaxCalculationMethod.EXCLUSIVE,
    )


def gst_12_intrastate() -> TaxGroup:
    return TaxGroup(
        group_id="GST12_INTRA",
        group_name="GST 12%",
        components=[
            TaxComponent(TaxType.CGST, Decimal("6"), "CGST @ 6%"),
            TaxComponent(TaxType.SGST, Decimal("6"), "SGST @ 6%"),
        ],
    )


def gst_5_intrastate() -> TaxGroup:
    return TaxGroup(
        group_id="GST5_INTRA",
        group_name="GST 5%",
        components=[
            TaxComponent(TaxType.CGST, Decimal("2.5"), "CGST @ 2.5%"),
            TaxComponent(TaxType.SGST, Decimal("2.5"), "SGST @ 2.5%"),
        ],
    )


def gst_exempt() -> TaxGroup:
    return TaxGroup(
        group_id="GST_EXEMPT",
        group_name="GST Exempt",
        components=[
            TaxComponent(TaxType.EXEMPT, Decimal("0"), "Exempt"),
        ],
    )


# Global singleton
tax_engine = TaxEngine()
