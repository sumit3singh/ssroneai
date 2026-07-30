"""
The Baithak – AI Module Models
Conversation history, prompt templates, and AI governance records.
"""
from sqlalchemy import BigInteger, Boolean, Float, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from src.core.database.models import TenantBaseModel


class AIConversation(TenantBaseModel):
    __tablename__ = "ai_conversations"
    user_id: Mapped[int] = mapped_column(BigInteger, nullable=False)
    agent_type: Mapped[str] = mapped_column(String(50), nullable=False, default="general")
    title: Mapped[str | None] = mapped_column(String(300), nullable=True)
    context: Mapped[dict] = mapped_column(JSONB, default=dict)
    token_count: Mapped[int] = mapped_column(Integer, default=0)
    cost_usd: Mapped[float] = mapped_column(Float, default=0.0)
    is_archived: Mapped[bool] = mapped_column(Boolean, default=False)


class AIMessage(TenantBaseModel):
    __tablename__ = "ai_messages"
    conversation_id: Mapped[int] = mapped_column(BigInteger, nullable=False, index=True)
    role: Mapped[str] = mapped_column(String(20), nullable=False)  # user, assistant, system
    content: Mapped[str] = mapped_column(Text, nullable=False)
    token_count: Mapped[int] = mapped_column(Integer, default=0)
    model_used: Mapped[str | None] = mapped_column(String(100), nullable=True)
    metadata_: Mapped[dict] = mapped_column("metadata", JSONB, default=dict)
    feedback: Mapped[str | None] = mapped_column(String(10), nullable=True)  # good, bad


class AIPromptTemplate(TenantBaseModel):
    __tablename__ = "ai_prompt_templates"
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    category: Mapped[str] = mapped_column(String(100), nullable=False)
    agent_type: Mapped[str] = mapped_column(String(50), nullable=False)
    system_prompt: Mapped[str] = mapped_column(Text, nullable=False)
    user_prompt_template: Mapped[str] = mapped_column(Text, nullable=False)
    variables: Mapped[list] = mapped_column(JSONB, default=list)
    version: Mapped[int] = mapped_column(Integer, default=1)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    usage_count: Mapped[int] = mapped_column(Integer, default=0)
    avg_rating: Mapped[float] = mapped_column(Float, default=0.0)
