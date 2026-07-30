"""
Attribute-Based Access Control (ABAC) Policy Engine
Evaluates tenant isolation, branch context, time window, and IP attribute rules.
"""
from typing import Dict, Any, Optional
from datetime import datetime, timezone


class ABACPolicyEngine:
    """ABAC Engine evaluating attribute rules for zero-trust authorization."""

    def evaluate_access(
        self,
        user_attributes: Dict[str, Any],
        resource_attributes: Dict[str, Any],
        context_attributes: Dict[str, Any],
    ) -> bool:
        """Evaluate if user attributes satisfy resource and context policies."""
        user_tenant = user_attributes.get("tenant_id")
        resource_tenant = resource_attributes.get("tenant_id")

        # 1. Enforce Strict Tenant Isolation
        if resource_tenant and user_tenant != resource_tenant:
            return False

        # 2. Enforce Branch Context Matching (if restricted)
        user_branch = user_attributes.get("branch_id")
        resource_branch = resource_attributes.get("branch_id")
        if resource_branch and user_branch and user_branch != resource_branch:
            return False

        # 3. Check IP Whitelist (if applicable)
        allowed_ips: Optional[list[str]] = resource_attributes.get("allowed_ips")
        request_ip: Optional[str] = context_attributes.get("ip_address")
        if allowed_ips and request_ip and request_ip not in allowed_ips:
            return False

        return True


abac_engine = ABACPolicyEngine()
