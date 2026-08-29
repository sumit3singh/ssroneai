"""
The ssrone – AI Copilot Module
AI agents: CEO Agent, Kitchen Agent, CRM Agent, Finance Agent.
Prompt library, database persistence, OpenAI/Anthropic integration, and audit logs.
"""
import json
from datetime import datetime, timezone
from decimal import Decimal
from typing import Any, AsyncGenerator

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.database.engine import get_db_session, AsyncSessionLocal
from src.core.database.audit import log_audit
from src.ai.copilot.models import AIConversation, AIMessage, AIPromptTemplate
from src.modules.auth.dependencies import get_current_user
from src.modules.auth.models import User
from src.shared.config import get_settings
from src.shared.logger import get_logger

logger = get_logger(__name__)
settings = get_settings()
router = APIRouter(prefix="/ai", tags=["AI Copilot"])


# ─── Schemas ─────────────────────────────────────────────────

class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str
    agent_type: str = Field(default="general")
    conversation_id: int | None = None
    context: dict = Field(default_factory=dict)
    stream: bool = True


class InsightCard(BaseModel):
    id: str
    title: str
    description: str
    category: str
    priority: str
    action_label: str | None = None
    action_url: str | None = None
    metric_value: str | None = None
    metric_change: str | None = None
    icon: str | None = None


class SimulationRequest(BaseModel):
    scenario: str
    parameters: dict
    agent_type: str = "finance"


# ─── AI Service ──────────────────────────────────────────────

class AIService:
    AGENT_SYSTEM_PROMPTS = {
        "general": """You are the AI Copilot for The ssrone Hospitality Platform.
You help hospitality business owners and staff with operations, analysis, and decisions.
Be concise, professional, and always ground your answers in data when available.""",

        "kitchen": """You are the Kitchen AI Agent for The ssrone Platform.
You assist with recipe management, ingredient forecasting, waste reduction, and kitchen efficiency.""",

        "crm": """You are the CRM AI Agent for The ssrone Platform.
You help with customer segmentation, loyalty analysis, churn prediction, and personalized outreach.""",

        "finance": """You are the Finance AI Agent for The ssrone Platform.
You assist with revenue analysis, expense tracking, GST filing preparation, and financial forecasting.""",

        "ceo": """You are the CEO AI Agent for The ssrone Platform.
You provide executive-level insights across all business dimensions: revenue, operations, HR, and customer satisfaction.""",
    }

    async def get_insight_cards(self, tenant_id: str, branch_id: str | None = None) -> list[InsightCard]:
        # Return mock insights for demonstration
        return [
            InsightCard(
                id="rev_growth",
                title="Revenue up 18% this week",
                description="Strong performance driven by weekend dine-in traffic. Saturday revenue was highest in 3 months.",
                category="revenue",
                priority="info",
                metric_value="₹1,24,500",
                metric_change="+18%",
                icon="trending-up",
            ),
            InsightCard(
                id="vip_churn",
                title="7 VIP customers haven't visited in 45 days",
                description="Consider sending a personalized win-back offer to maintain loyalty tier retention.",
                category="crm",
                priority="warning",
                action_label="Create Campaign",
                action_url="/crm/campaigns/new",
                icon="users",
            ),
            InsightCard(
                id="low_stock",
                title="3 items below reorder level",
                description="Paneer, Tomatoes, and Cooking Oil are running low. Auto-purchase orders suggested.",
                category="inventory",
                priority="critical",
                action_label="View Inventory",
                action_url="/inventory",
                icon="package",
            ),
        ]

    def build_messages(
        self, system_prompt: str, history: list[AIMessage], new_message: str, context: dict
    ) -> list[dict]:
        if context:
            system_prompt += f"\n\nBusiness Context:\n{json.dumps(context)}"

        messages = [{"role": "system", "content": system_prompt}]
        for msg in history[-10:]:
            messages.append({"role": msg.role, "content": msg.content})
        messages.append({"role": "user", "content": new_message})
        return messages


ai_service = AIService()


# ─── Routes ──────────────────────────────────────────────────

@router.post("/chat")
async def chat(
    body: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> StreamingResponse:
    """
    Stream AI chat responses from the Copilot.
    Uses prompt templates, persists conversation history, and logs usage audits.
    """
    if not settings.feature_ai_copilot:
        raise HTTPException(status_code=403, detail="AI Copilot is not enabled.")

    # 1. Resolve or create AIConversation
    conversation_id = body.conversation_id
    if not conversation_id:
        new_conv = AIConversation(
            tenant_id=current_user.tenant_id,
            user_id=current_user.id,
            agent_type=body.agent_type,
            title=f"Chat about {body.agent_type} - {datetime.now().strftime('%Y-%m-%d')}",
            context=body.context,
            created_by=current_user.id,
        )
        db.add(new_conv)
        await db.flush()
        conversation_id = new_conv.id

    # 2. Fetch history
    history_stmt = (
        select(AIMessage)
        .where(AIMessage.conversation_id == conversation_id)
        .order_by(AIMessage.created_at)
    )
    history_res = await db.execute(history_stmt)
    history = list(history_res.scalars().all())

    # 3. Retrieve system prompt template
    template_stmt = (
        select(AIPromptTemplate)
        .where(
            AIPromptTemplate.agent_type == body.agent_type,
            AIPromptTemplate.is_active == True,
        )
        .order_by(AIPromptTemplate.version.desc())
    )
    template_res = await db.execute(template_stmt)
    template = template_res.scalar_one_or_none()

    system_prompt = (
        template.system_prompt
        if template
        else ai_service.AGENT_SYSTEM_PROMPTS.get(body.agent_type, ai_service.AGENT_SYSTEM_PROMPTS["general"])
    )

    # 4. Save User Message
    user_msg = AIMessage(
        tenant_id=current_user.tenant_id,
        conversation_id=conversation_id,
        role="user",
        content=body.message,
        created_by=current_user.id,
    )
    db.add(user_msg)
    await db.commit()

    # 5. Format messages
    messages = ai_service.build_messages(system_prompt, history, body.message, body.context)

    # Determine fallback mode
    use_anthropic = bool(settings.ai.anthropic_api_key)
    use_openai = bool(settings.ai.openai_api_key)

    async def stream_response() -> AsyncGenerator[str, None]:
        full_reply = []
        model_used = "simulation-fallback"

        try:
            if use_anthropic:
                import anthropic
                model_used = settings.ai.model or "claude-3-5-sonnet-20241022"
                client = anthropic.AsyncAnthropic(api_key=settings.ai.anthropic_api_key)
                api_messages = [m for m in messages if m["role"] != "system"]
                async with client.messages.stream(
                    model=model_used,
                    max_tokens=1024,
                    system=system_prompt,
                    messages=api_messages,
                ) as stream:
                    async for text in stream.text_stream:
                        full_reply.append(text)
                        yield f"data: {text}\n\n"
            elif use_openai:
                from openai import AsyncOpenAI
                model_used = settings.ai.model or "gpt-4o"
                client = AsyncOpenAI(api_key=settings.ai.openai_api_key)
                api_messages = [{"role": m["role"], "content": m["content"]} for m in messages]
                response = await client.chat.completions.create(
                    model=model_used,
                    messages=api_messages,
                    stream=True,
                )
                async for chunk in response:
                    text = chunk.choices[0].delta.content or ""
                    full_reply.append(text)
                    yield f"data: {text}\n\n"
            else:
                # True fallback when keys are absent
                logger.info("AI keys absent, operating in dynamic simulation mode")
                fallback_reply = (
                    f"Copilot Sandbox Mode 🛠️\n"
                    f"You queried: '{body.message}' under agent scope '{body.agent_type}'.\n"
                    f"To enable real LLM responses, set OPENAI_API_KEY or ANTHROPIC_API_KEY in backend/.env."
                )
                for word in fallback_reply.split(" "):
                    yield f"data: {word} \n\n"
                    full_reply.append(word + " ")
            
            yield "data: [DONE]\n\n"
        except Exception as exc:
            logger.error("AI streaming error", error=str(exc))
            yield f"data: [ERROR] {str(exc)}\n\n"
            full_reply.append(f"[ERROR] {str(exc)}")
        finally:
            # 6. Persist Assistant reply & Log usage audit
            reply_text = "".join(full_reply).strip()
            async with AsyncSessionLocal() as session:
                try:
                    assistant_msg = AIMessage(
                        tenant_id=current_user.tenant_id,
                        conversation_id=conversation_id,
                        role="assistant",
                        content=reply_text,
                        model_used=model_used,
                        created_by=current_user.id,
                    )
                    session.add(assistant_msg)

                    # Update template stats
                    if template:
                        template.usage_count += 1
                        session.add(template)

                    # Audit log AI Prompt Execution
                    await log_audit(
                        session=session,
                        tenant_id=current_user.tenant_id,
                        user_id=current_user.id,
                        action="AI_PROMPT_EXECUTION",
                        resource_type="AIConversation",
                        resource_id=str(conversation_id),
                        new_values={"model": model_used, "agent_type": body.agent_type},
                    )
                    await session.commit()
                except Exception as db_exc:
                    logger.error("Failed to commit AI message history", error=str(db_exc))

    return StreamingResponse(stream_response(), media_type="text/event-stream")


@router.get("/insights", response_model=list[InsightCard])
async def get_insights(
    branch_id: str | None = None,
    current_user: User = Depends(get_current_user),
) -> list[InsightCard]:
    return await ai_service.get_insight_cards(str(current_user.tenant_id), branch_id)


@router.post("/simulate")
async def simulate(
    body: SimulationRequest,
    current_user: User = Depends(get_current_user),
) -> dict:
    return {
        "scenario": body.scenario,
        "simulation_result": {
            "summary": "Simulation complete (demo mode). Configure AI API key for real simulations.",
            "parameters": body.parameters,
            "projected_impact": "N/A in demo mode",
        },
    }
