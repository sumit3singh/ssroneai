"""
The Baithak – Universal Pricing Engine
Computes dynamic pricing by aggregating MRP, wholesale, POS, online,
seasonal rates, corporate contracts, VIP tiers, and happy hour rules.
"""
from dataclasses import dataclass, field
from decimal import ROUND_HALF_UP, Decimal
from enum import StrEnum
from typing import Any

from src.shared.logger import get_logger

logger = get_logger(__name__)


class PriceType(StrEnum):
    MRP = "mrp"
    WHOLESALE = "wholesale"
    ONLINE = "online"
    POS = "pos"
    HAPPY_HOUR = "happy_hour"
    CORPORATE = "corporate"
    VIP = "vip"
    SEASONAL = "seasonal"
    CUSTOM = "custom"


class DiscountType(StrEnum):
    FLAT = "flat"
    PERCENTAGE = "percentage"
    BOGO = "bogo"
    FREE_ITEM = "free_item"


@dataclass
class PriceRule:
    """A single pricing rule loaded from metadata."""
    rule_id: str
    price_type: PriceType
    amount: Decimal
    priority: int = 100
    conditions: dict[str, Any] = field(default_factory=dict)
    is_active: bool = True


@dataclass
class PricingContext:
    """
    Context passed to the pricing engine for every calculation.
    Determines which rules apply.
    """
    product_id: str
    base_price: Decimal
    quantity: Decimal = Decimal("1")
    customer_tier: str | None = None     # "VIP", "GOLD", "SILVER", "STANDARD"
    channel: str = "pos"                 # "pos", "online", "kiosk", "api"
    is_happy_hour: bool = False
    branch_id: str | None = None
    corporate_id: str | None = None
    custom_attributes: dict[str, Any] = field(default_factory=dict)


@dataclass
class PricingResult:
    """Result returned by the pricing engine."""
    product_id: str
    base_price: Decimal
    unit_price: Decimal             # Price after rules, before tax
    quantity: Decimal
    line_total: Decimal             # unit_price × quantity
    applied_rules: list[str]        # Rule IDs that were applied
    price_type: PriceType
    breakdown: dict[str, Decimal] = field(default_factory=dict)


class PricingEngine:
    """
    Universal Pricing Engine.

    Rule resolution order (highest priority wins):
    1. Happy Hour (if active)
    2. VIP / Customer Tier pricing
    3. Corporate contract pricing
    4. Online channel pricing
    5. POS default pricing
    6. MRP (fallback)
    """

    def compute(
        self,
        context: PricingContext,
        rules: list[PriceRule],
    ) -> PricingResult:
        """
        Compute the final unit price for a product given the pricing context.
        """
        applicable_rules = self._filter_rules(context, rules)
        best_rule = self._resolve_best_rule(context, applicable_rules)

        if best_rule:
            unit_price = best_rule.amount
            price_type = best_rule.price_type
            applied_rules = [best_rule.rule_id]
        else:
            unit_price = context.base_price
            price_type = PriceType.MRP
            applied_rules = []

        unit_price = unit_price.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        line_total = (unit_price * context.quantity).quantize(
            Decimal("0.01"), rounding=ROUND_HALF_UP
        )

        logger.debug(
            "Price computed",
            product_id=context.product_id,
            unit_price=str(unit_price),
            price_type=price_type,
            applied_rules=applied_rules,
        )

        return PricingResult(
            product_id=context.product_id,
            base_price=context.base_price,
            unit_price=unit_price,
            quantity=context.quantity,
            line_total=line_total,
            applied_rules=applied_rules,
            price_type=price_type,
            breakdown={"base": context.base_price, "final": unit_price},
        )

    def _filter_rules(
        self, context: PricingContext, rules: list[PriceRule]
    ) -> list[PriceRule]:
        """Filter rules to those applicable in the current context."""
        applicable: list[PriceRule] = []

        for rule in rules:
            if not rule.is_active:
                continue
            if rule.price_type == PriceType.HAPPY_HOUR and not context.is_happy_hour:
                continue
            if rule.price_type == PriceType.VIP and context.customer_tier != "VIP":
                continue
            if rule.price_type == PriceType.CORPORATE and not context.corporate_id:
                continue
            if rule.price_type == PriceType.ONLINE and context.channel != "online":
                continue
            applicable.append(rule)

        return applicable

    def _resolve_best_rule(
        self, context: PricingContext, rules: list[PriceRule]
    ) -> PriceRule | None:
        """
        Select the best rule using priority-based resolution.
        Happy Hour > VIP > Corporate > Online > POS > MRP
        """
        if not rules:
            return None

        priority_order = [
            PriceType.HAPPY_HOUR,
            PriceType.VIP,
            PriceType.CORPORATE,
            PriceType.SEASONAL,
            PriceType.ONLINE,
            PriceType.POS,
            PriceType.WHOLESALE,
            PriceType.MRP,
        ]

        for price_type in priority_order:
            type_rules = [r for r in rules if r.price_type == price_type]
            if type_rules:
                # Within the same type, lowest price wins
                return min(type_rules, key=lambda r: r.amount)

        # Fallback: sort by priority field
        return min(rules, key=lambda r: r.priority)

    def apply_quantity_discount(
        self, price: Decimal, quantity: Decimal, tiers: list[dict[str, Any]]
    ) -> Decimal:
        """Apply quantity-based tiered discounts."""
        applicable_tier = None
        for tier in sorted(tiers, key=lambda t: t["min_qty"], reverse=True):
            if quantity >= Decimal(str(tier["min_qty"])):
                applicable_tier = tier
                break

        if not applicable_tier:
            return price

        if applicable_tier["discount_type"] == "percentage":
            discount = price * Decimal(str(applicable_tier["discount_value"])) / 100
            return (price - discount).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        elif applicable_tier["discount_type"] == "flat":
            return (price - Decimal(str(applicable_tier["discount_value"]))).quantize(
                Decimal("0.01"), rounding=ROUND_HALF_UP
            )
        return price


# Global engine singleton
pricing_engine = PricingEngine()
