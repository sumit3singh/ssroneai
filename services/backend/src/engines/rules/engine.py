"""
The Baithak – Rule Engine
Evaluates complex conditional business rules without code changes.
e.g. IF customer_tier == 'VIP' AND order_value > 2000 THEN apply_discount(15)
"""
from dataclasses import dataclass, field
from enum import StrEnum
from typing import Any

from src.shared.logger import get_logger

logger = get_logger(__name__)


class Operator(StrEnum):
    EQ = "eq"           # equals
    NEQ = "neq"         # not equals
    GT = "gt"           # greater than
    GTE = "gte"         # greater than or equal
    LT = "lt"           # less than
    LTE = "lte"         # less than or equal
    IN = "in"           # value in list
    NOT_IN = "not_in"
    CONTAINS = "contains"
    STARTS_WITH = "starts_with"
    IS_NULL = "is_null"
    IS_NOT_NULL = "is_not_null"


class LogicOperator(StrEnum):
    AND = "AND"
    OR = "OR"


class ActionType(StrEnum):
    APPLY_DISCOUNT = "apply_discount"
    SET_PRICE = "set_price"
    BLOCK = "block"                 # Block the transaction
    NOTIFY = "notify"               # Send notification
    REQUIRE_APPROVAL = "require_approval"
    SET_FIELD = "set_field"
    TRIGGER_WORKFLOW = "trigger_workflow"
    LOG = "log"


@dataclass
class RuleCondition:
    field: str
    operator: Operator
    value: Any
    logic: LogicOperator = LogicOperator.AND


@dataclass
class RuleAction:
    action_type: ActionType
    parameters: dict[str, Any] = field(default_factory=dict)


@dataclass
class BusinessRule:
    rule_id: str
    name: str
    entity_type: str            # "order", "invoice", "reservation", "employee"
    conditions: list[RuleCondition]
    actions: list[RuleAction]
    priority: int = 100
    is_active: bool = True
    description: str = ""


@dataclass
class RuleEvaluationResult:
    triggered_rules: list[str]
    actions_to_execute: list[RuleAction]
    blocked: bool = False
    block_reason: str | None = None


class RuleEngine:
    """
    Evaluates business rules against a context object.
    Supports complex AND/OR conditions and multiple action types.
    """

    def evaluate(
        self,
        rules: list[BusinessRule],
        context: dict[str, Any],
        entity_type: str,
    ) -> RuleEvaluationResult:
        """Evaluate all applicable rules for an entity context."""
        triggered: list[str] = []
        all_actions: list[RuleAction] = []
        blocked = False
        block_reason = None

        applicable = sorted(
            [r for r in rules if r.is_active and r.entity_type == entity_type],
            key=lambda r: r.priority,
        )

        for rule in applicable:
            if self._evaluate_conditions(rule.conditions, context):
                triggered.append(rule.rule_id)
                logger.debug("Rule triggered", rule_id=rule.rule_id, name=rule.name)

                for action in rule.actions:
                    if action.action_type == ActionType.BLOCK:
                        blocked = True
                        block_reason = action.parameters.get("reason", f"Rule {rule.rule_id} blocked this action")
                    else:
                        all_actions.append(action)

        return RuleEvaluationResult(
            triggered_rules=triggered,
            actions_to_execute=all_actions,
            blocked=blocked,
            block_reason=block_reason,
        )

    def _evaluate_conditions(self, conditions: list[RuleCondition], ctx: dict[str, Any]) -> bool:
        if not conditions:
            return True

        results: list[bool] = []
        for cond in conditions:
            val = self._get_nested(ctx, cond.field)
            result = self._check(val, cond.operator, cond.value)
            results.append((cond.logic, result))

        # Evaluate AND/OR chain
        final = results[0][1] if results else False
        for i in range(1, len(results)):
            logic, res = results[i]
            if logic == LogicOperator.AND:
                final = final and res
            else:
                final = final or res
        return final

    def _get_nested(self, ctx: dict[str, Any], field: str) -> Any:
        """Support dot-notation field access: 'customer.tier'"""
        parts = field.split(".")
        val: Any = ctx
        for p in parts:
            if isinstance(val, dict):
                val = val.get(p)
            else:
                return None
        return val

    def _check(self, actual: Any, op: Operator, expected: Any) -> bool:
        try:
            if op == Operator.EQ:          return actual == expected
            if op == Operator.NEQ:         return actual != expected
            if op == Operator.GT:          return float(actual) > float(expected)
            if op == Operator.GTE:         return float(actual) >= float(expected)
            if op == Operator.LT:          return float(actual) < float(expected)
            if op == Operator.LTE:         return float(actual) <= float(expected)
            if op == Operator.IN:          return actual in (expected if isinstance(expected, list) else [expected])
            if op == Operator.NOT_IN:      return actual not in (expected if isinstance(expected, list) else [expected])
            if op == Operator.CONTAINS:    return str(expected) in str(actual)
            if op == Operator.STARTS_WITH: return str(actual).startswith(str(expected))
            if op == Operator.IS_NULL:     return actual is None
            if op == Operator.IS_NOT_NULL: return actual is not None
        except (TypeError, ValueError):
            return False
        return False


rule_engine = RuleEngine()
