"""
The ssrone – Discount Engine
Resolves discounts using priority-based rules:
flat, percentage, BOGO, coupon, employee, and combo discounts.
"""
from dataclasses import dataclass, field
from decimal import ROUND_HALF_UP, Decimal
from enum import StrEnum
from typing import Any

from src.shared.logger import get_logger

logger = get_logger(__name__)


class DiscountType(StrEnum):
    FLAT = "flat"
    PERCENTAGE = "percentage"
    BOGO = "bogo"             # Buy one get one
    FREE_ITEM = "free_item"
    COUPON = "coupon"
    EMPLOYEE = "employee"
    COMBO = "combo"
    LOYALTY = "loyalty"


@dataclass
class DiscountRule:
    rule_id: str
    discount_type: DiscountType
    value: Decimal              # Amount or percentage
    priority: int = 100         # Lower = higher priority
    code: str | None = None     # Coupon code if applicable
    min_order_value: Decimal = Decimal("0")
    max_discount_cap: Decimal | None = None
    conditions: dict[str, Any] = field(default_factory=dict)
    is_active: bool = True
    is_stackable: bool = False  # Can combine with other discounts


@dataclass
class DiscountContext:
    order_value: Decimal
    items: list[dict[str, Any]] = field(default_factory=list)
    customer_tier: str | None = None
    coupon_code: str | None = None
    is_employee: bool = False
    branch_id: str | None = None


@dataclass
class DiscountResult:
    applied_rules: list[str]
    discount_amount: Decimal
    final_amount: Decimal
    breakdown: list[dict[str, Any]] = field(default_factory=list)
    free_items: list[str] = field(default_factory=list)


class DiscountEngine:
    """
    Universal Discount Engine.
    Priority resolution: Employee > Coupon > Loyalty > BOGO > Percentage > Flat.
    Non-stackable discounts: only the highest priority rule applies.
    Stackable discounts: accumulated up to max_discount_cap.
    """

    def resolve(
        self,
        context: DiscountContext,
        rules: list[DiscountRule],
    ) -> DiscountResult:
        applicable = self._filter(context, rules)
        if not applicable:
            return DiscountResult([], Decimal("0"), context.order_value)

        # Separate stackable vs non-stackable
        stackable = [r for r in applicable if r.is_stackable]
        non_stackable = [r for r in applicable if not r.is_stackable]

        applied: list[DiscountRule] = []
        total_discount = Decimal("0")
        breakdown = []
        free_items: list[str] = []

        # Apply best non-stackable rule first
        if non_stackable:
            best = min(non_stackable, key=lambda r: r.priority)
            disc, fi = self._calculate(context.order_value, best)
            applied.append(best)
            total_discount += disc
            breakdown.append({"rule_id": best.rule_id, "type": best.discount_type, "amount": float(disc)})
            free_items.extend(fi)

        # Stack all stackable rules on top
        running_value = context.order_value - total_discount
        for rule in sorted(stackable, key=lambda r: r.priority):
            disc, fi = self._calculate(running_value, rule)
            applied.append(rule)
            total_discount += disc
            running_value -= disc
            breakdown.append({"rule_id": rule.rule_id, "type": rule.discount_type, "amount": float(disc)})
            free_items.extend(fi)

        total_discount = min(total_discount, context.order_value).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        final = (context.order_value - total_discount).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

        logger.debug("Discount resolved", total_discount=str(total_discount), rules=[r.rule_id for r in applied])
        return DiscountResult(
            applied_rules=[r.rule_id for r in applied],
            discount_amount=total_discount,
            final_amount=final,
            breakdown=breakdown,
            free_items=free_items,
        )

    def _filter(self, ctx: DiscountContext, rules: list[DiscountRule]) -> list[DiscountRule]:
        out = []
        for r in rules:
            if not r.is_active:
                continue
            if ctx.order_value < r.min_order_value:
                continue
            if r.discount_type == DiscountRule and not ctx.is_employee:
                continue
            if r.discount_type == DiscountType.COUPON:
                if not ctx.coupon_code or ctx.coupon_code.upper() != (r.code or "").upper():
                    continue
            if r.discount_type == DiscountType.EMPLOYEE and not ctx.is_employee:
                continue
            out.append(r)
        return out

    def _calculate(self, base: Decimal, rule: DiscountRule) -> tuple[Decimal, list[str]]:
        free_items: list[str] = []
        if rule.discount_type == DiscountType.FLAT:
            disc = min(rule.value, base)
        elif rule.discount_type == DiscountType.PERCENTAGE:
            disc = (base * rule.value / 100).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        elif rule.discount_type == DiscountType.EMPLOYEE:
            disc = (base * rule.value / 100).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        elif rule.discount_type == DiscountType.COUPON:
            disc = (base * rule.value / 100).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP) \
                if rule.value <= 100 else min(rule.value, base)
        elif rule.discount_type == DiscountType.LOYALTY:
            disc = (base * rule.value / 100).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        else:
            disc = Decimal("0")

        if rule.max_discount_cap:
            disc = min(disc, rule.max_discount_cap)

        return disc.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP), free_items


discount_engine = DiscountEngine()
