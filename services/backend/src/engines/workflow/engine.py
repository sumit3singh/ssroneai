"""
The Baithak – Workflow Engine
Approval chain evaluator for purchase requests, leave approvals,
vendor payments, and any multi-step document workflow.
"""
from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import StrEnum
from typing import Any

from src.shared.logger import get_logger

logger = get_logger(__name__)


class WorkflowStatus(StrEnum):
    DRAFT = "draft"
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    APPROVED = "approved"
    REJECTED = "rejected"
    CANCELLED = "cancelled"
    ON_HOLD = "on_hold"


class StepType(StrEnum):
    APPROVAL = "approval"
    NOTIFICATION = "notification"
    AUTO = "auto"
    CONDITION = "condition"
    API_HOOK = "api_hook"


@dataclass
class WorkflowStep:
    step_id: str
    step_name: str
    step_type: StepType
    assignee_role: str | None = None
    assignee_user_id: str | None = None
    order: int = 1
    is_parallel: bool = False
    timeout_hours: int | None = None
    conditions: dict[str, Any] = field(default_factory=dict)
    on_approve_next: str | None = None
    on_reject_next: str | None = None
    notification_template: str | None = None


@dataclass
class WorkflowDefinition:
    workflow_id: str
    name: str
    entity_type: str            # "purchase_order", "leave_request", "payment", etc.
    steps: list[WorkflowStep]
    is_active: bool = True
    version: int = 1


@dataclass
class WorkflowInstance:
    instance_id: str
    workflow_id: str
    entity_id: str
    entity_type: str
    tenant_id: str
    status: WorkflowStatus = WorkflowStatus.PENDING
    current_step_id: str | None = None
    initiated_by: str | None = None
    initiated_at: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    completed_at: str | None = None
    metadata: dict[str, Any] = field(default_factory=dict)
    history: list[dict[str, Any]] = field(default_factory=list)


@dataclass
class ApprovalAction:
    instance_id: str
    step_id: str
    actor_id: str
    action: str                 # "approve" | "reject" | "hold" | "delegate"
    comment: str | None = None
    acted_at: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class WorkflowEngine:
    """
    Visual Workflow Engine.
    Evaluates multi-step approval chains, emits notifications,
    and triggers API hooks at each step transition.
    """

    def initiate(
        self,
        definition: WorkflowDefinition,
        entity_id: str,
        tenant_id: str,
        initiated_by: str,
        context: dict[str, Any] | None = None,
    ) -> WorkflowInstance:
        """Start a new workflow instance for an entity."""
        first_step = min(definition.steps, key=lambda s: s.order)
        instance_id = f"wf-{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S%f')}"
        instance = WorkflowInstance(
            instance_id=instance_id,
            workflow_id=definition.workflow_id,
            entity_id=entity_id,
            entity_type=definition.entity_type,
            tenant_id=tenant_id,
            status=WorkflowStatus.PENDING,
            current_step_id=first_step.step_id,
            initiated_by=initiated_by,
            metadata=context or {},
        )
        logger.info("Workflow initiated", instance_id=instance.instance_id, entity=entity_id)
        return instance

    def process_action(
        self,
        instance: WorkflowInstance,
        definition: WorkflowDefinition,
        action: ApprovalAction,
    ) -> WorkflowInstance:
        """Process an approval/rejection action and advance the workflow."""
        current_step = next(
            (s for s in definition.steps if s.step_id == instance.current_step_id), None
        )
        if not current_step:
            raise ValueError(f"Step {instance.current_step_id} not found")

        # Log the action
        instance.history.append({
            "step_id": action.step_id,
            "actor_id": action.actor_id,
            "action": action.action,
            "comment": action.comment,
            "at": action.acted_at,
        })

        if action.action == "approve":
            next_step_id = current_step.on_approve_next
            if next_step_id:
                next_step = next((s for s in definition.steps if s.step_id == next_step_id), None)
                if next_step:
                    instance.current_step_id = next_step.step_id
                    instance.status = WorkflowStatus.IN_PROGRESS
                    logger.info("Workflow advanced", next_step=next_step_id)
                else:
                    instance.status = WorkflowStatus.APPROVED
                    instance.completed_at = datetime.now(timezone.utc).isoformat()
            else:
                instance.status = WorkflowStatus.APPROVED
                instance.completed_at = datetime.now(timezone.utc).isoformat()
                logger.info("Workflow approved", instance_id=instance.instance_id)

        elif action.action == "reject":
            instance.status = WorkflowStatus.REJECTED
            instance.completed_at = datetime.now(timezone.utc).isoformat()
            logger.info("Workflow rejected", instance_id=instance.instance_id)

        elif action.action == "hold":
            instance.status = WorkflowStatus.ON_HOLD

        return instance

    def get_pending_steps(
        self, definition: WorkflowDefinition, instance: WorkflowInstance
    ) -> list[WorkflowStep]:
        """Return steps still pending approval."""
        if instance.status not in (WorkflowStatus.PENDING, WorkflowStatus.IN_PROGRESS):
            return []
        current_order = 0
        if instance.current_step_id:
            cur = next((s for s in definition.steps if s.step_id == instance.current_step_id), None)
            if cur:
                current_order = cur.order
        return [s for s in definition.steps if s.order >= current_order]

    def can_actor_approve(
        self, step: WorkflowStep, actor_role: str, actor_id: str
    ) -> bool:
        """Check if an actor is allowed to approve the given step."""
        if step.assignee_user_id and step.assignee_user_id == actor_id:
            return True
        if step.assignee_role and step.assignee_role == actor_role:
            return True
        return False


workflow_engine = WorkflowEngine()
