"""
Enterprise Multi-Tier Approval Engine
Evaluates approval thresholds, authority limits, and hierarchical authorization chains.
"""
from typing import Dict, Any


class ApprovalEngine:
    """Approval Engine managing multi-level business approval rules."""

    def requires_approval(self, entity_type: str, amount: float) -> bool:
        """Determine if an entity mutation or discount requires manager approval."""
        if entity_type == "discount" and amount > 15.0:
            return True
        if entity_type == "refund" and amount > 500.0:
            return True
        if entity_type == "po" and amount > 10000.0:
            return True
        return False

    def evaluate_approval(
        self, entity_type: str, amount: float, approver_role: str
    ) -> Dict[str, Any]:
        """Evaluate whether an approver's role is authorized for the given amount."""
        required = self.requires_approval(entity_type, amount)
        if not required:
            return {"approved": True, "required": False, "level": "AUTO"}

        role_levels = {"SUPER_ADMIN": 3, "ADMIN": 2, "MANAGER": 1, "STAFF": 0}
        user_level = role_levels.get(approver_role.upper(), 0)

        if user_level >= 1:
            return {"approved": True, "required": True, "level": approver_role}
        return {"approved": False, "required": True, "reason": "Insufficient approval authority"}


approval_engine = ApprovalEngine()
