# Lesson 18: AI Copilot Architecture, LLM Integrations & Tesseract OCR

> **Architecture Pillar**: Intelligent Multi-Agent Copilot, Streaming LLM Infrastructure & Computer Vision OCR  
> **Repository Path**: `services/backend/src/ai/copilot/`, `services/backend/src/ai/ocr/`, `services/backend/src/workers/tasks.py`  
> **Prerequisites**: Lesson 04 (FastAPI & ASGI), Lesson 06 (SQLAlchemy), Lesson 09 (Multi-Tenancy), Lesson 16 (Celery & Redis)

---

## 1. What It Is (Simple Explanation + Analogy)

Modern hospitality enterprises do not just need a digital cash register; they need an intelligent management suite that helps them make profitable operational decisions:
1. **The AI Copilot**: A multi-agent conversational advisor embedded into the POS and ERP. A business owner can ask: *"Why did our food cost spike 14% this week?"* or *"Draft a promotional SMS to win back VIP diners who haven't ordered in 30 days."*
2. **Optical Character Recognition (OCR)**: An automated document processing pipeline. When raw grocery or vegetable deliveries arrive at the kitchen back door with a printed paper invoice, the chef snaps a photo. The system automatically reads the vendor name, line items, quantities, and GST totals, creating a draft purchase order without manual data entry.

### The Real-Life Analogy
* **The AI Copilot** is like having four specialized executive consultants sitting in your back office:
  * **The CEO Agent**: Looks at high-level profit margins, branch comparisons, and labor cost ratios.
  * **The Kitchen Agent**: Monitors recipe ingredient waste, recipe yields, and stock depletion rates.
  * **The CRM Agent**: Identifies customer churn patterns and crafts personalized loyalty campaigns.
  * **The Finance Agent**: Calculates GST input tax credits and monitors overhead expenses.
* **Tesseract OCR** is like a high-speed data entry clerk equipped with a magnifying glass. It scans physical ink on paper, recognizes character shapes across fonts and angles, and transcribes them into digital records.

```
                  ┌──────────────────────────────────────────────┐
                  │          SSR One AI Intelligence Core        │
                  └───────────────────────┬──────────────────────┘
                                          │
            ┌─────────────────────────────┴─────────────────────────────┐
            │                                                           │
            ▼                                                           ▼
┌──────────────────────────────────────┐             ┌─────────────────────────────────────┐
│          Multi-Agent Copilot         │             │          Tesseract OCR Vision       │
├──────────────────────────────────────┤             ├─────────────────────────────────────┤
│ • Specialized Agent Personas         │             │ • Computer Vision Preprocessing     │
│   (CEO, Kitchen, CRM, Finance)       │             │   (Grayscale, Thresholding)         │
│ • Server-Sent Events (SSE) Streaming │             │ • Pytesseract Text Extraction       │
│ • Anthropic / OpenAI Fallback Modes  │             │ • Line Item Regex & Tax Parsing     │
│ • Tenant-Scoped Conversation History │             │ • Auto-Draft Purchase Orders (PO)   │
└──────────────────────────────────────┘             └─────────────────────────────────────┘
```

---

## 2. Why This Project Uses It (Problems Solved & Trade-offs)

### The Core Problems
1. **Manual Data Entry Bottlenecks**: Kitchen managers spend 1 to 2 hours every evening manually typing vegetable, dairy, and meat vendor paper receipts into an inventory system. One mistyped decimal places an order of ₹10,000 as ₹1,00,000.
2. **Data Rich, Insight Poor**: A busy restaurant generates millions of rows of order history, but owners lack the time to analyze SQL queries or build pivot tables to discover why their profit margin dropped on Tuesdays.
3. **API Cost & Connectivity Fragility**: If an ERP hardcodes a single proprietary LLM API and that API experiences an outage or requires expensive per-token fees, local restaurant operations must not stop. The architecture must support **pluggable LLM providers (Anthropic Claude + OpenAI GPT-4o)** with a **graceful local simulation sandbox**.

### Alternative Comparisons

| Architectural Component | SSR One AI Approach | Alternatives Evaluated | Why This Decision |
| :--- | :--- | :--- | :--- |
| **Response Delivery** | **Server-Sent Events (SSE)** (`text/event-stream`) | WebSocket or Blocking JSON POST | WebSockets add bi-directional state overhead; blocking JSON forces the user to stare at a spinner for 8 seconds. SSE streams tokens instantly as they generate. |
| **Model Abstraction** | **Multi-Provider Adapter Pattern** (`Anthropic` + `OpenAI` + `Sandbox Fallback`) | Single Vendor SDK (e.g., LangChain or OpenAI-only) | LangChain adds heavy abstraction bloat. Our native adapter enables zero-dependency fallbacks and instant provider switching. |
| **Conversation Storage** | **Relational PostgreSQL Tables** (`ai_conversations`, `ai_messages`) | Vector DB only (Pinecone/Chroma) | Vector databases lack transactional ACID guarantees and cannot easily enforce our multi-tenant PostgreSQL RLS security boundary. |
| **OCR Pipeline** | **Tesseract OCR + OpenCV** in Docker | Cloud APIs (Google Cloud Vision, AWS Textract) | Cloud vision APIs cost $1.50 per 1,000 pages and fail when offline. Tesseract runs locally inside our Docker container with zero per-scan fees. |

---

## 3. Core Concepts (From Zero to Architect)

### 1. Server-Sent Events (SSE) Streaming (`text/event-stream`)
Traditional HTTP endpoints wait for the entire LLM response to complete before sending data:
```
Client Request ───▶ [Server waits 6 seconds for LLM] ───▶ Full 500-word response
```
With SSE Streaming, the server opens a persistent HTTP connection with `Content-Type: text/event-stream` and yields chunks token-by-token:
```
Client Request ───▶ [Token 1: "The"] (50ms)
               ───▶ [Token 2: " food"] (100ms)
               ───▶ [Token 3: " cost"] (150ms) ...
```
The user sees words appearing across the screen in real-time with zero perceived lag.

### 2. Multi-Agent Persona Routing
Instead of a generic AI assistant that tries to know everything, SSR One AI splits intelligence into 5 dedicated system personas:
* `general`: Broad operational help and system navigation.
* `kitchen`: Recipe yields, food waste reduction, shelf-life monitoring.
* `crm`: Customer Lifetime Value (LTV), VIP win-back campaigns, churn mitigation.
* `finance`: Revenue leak detection, GST reconciliation, expense tracking.
* `ceo`: Executive business overview, Multi-branch P&L comparisons.

### 3. OCR Image Preprocessing Pipeline
Raw camera photos taken in kitchen environments are noisy, greasy, unevenly lit, and skewed. Feeding a raw JPEG into an OCR engine yields garbage text. The pipeline must apply:
1. **Grayscale Conversion**: Eliminates color noise.
2. **Otsu Binarization / Adaptive Thresholding**: Converts subtle shadows into pure black ink on crisp white paper.
3. **Noise Removal (Median Blur)**: Removes specks of dirt or flour dust.

---

## 4. Language & Syntax Breakdown

### 1. Server-Sent Events (SSE) with FastAPI `StreamingResponse`

```python
from typing import AsyncGenerator
from fastapi import APIRouter
from fastapi.responses import StreamingResponse

router = APIRouter()

async def generate_token_stream() -> AsyncGenerator[str, None]:
    tokens = ["Welcome", " to", " The", " ssrone", " AI", " Copilot."]
    for token in tokens:
        import asyncio
        await asyncio.sleep(0.05)  # Simulate LLM generation latency
        # SSE format requires lines starting with "data: " and ending with double newline "\n\n"
        yield f"data: {token}\n\n"
    yield "data: [DONE]\n\n"

@router.get("/stream-demo")
async def stream_demo():
    return StreamingResponse(generate_token_stream(), media_type="text/event-stream")
```

### 2. Calling Anthropic Claude & OpenAI Async SDKs

```python
# Anthropic Streaming
import anthropic

client = anthropic.AsyncAnthropic(api_key="sk-ant-...")
async with client.messages.stream(
    model="claude-3-5-sonnet-20241022",
    max_tokens=1024,
    system="You are an expert hospitality accountant.",
    messages=[{"role": "user", "content": "Analyze our food cost"}],
) as stream:
    async for text_chunk in stream.text_stream:
        print(text_chunk, end="", flush=True)

# OpenAI Streaming
from openai import AsyncOpenAI

openai_client = AsyncOpenAI(api_key="sk-...")
response = await openai_client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Analyze our food cost"}],
    stream=True,
)
async for chunk in response:
    delta = chunk.choices[0].delta.content or ""
    print(delta, end="", flush=True)
```

---

## 5. How It Is Used in OUR Project

### 1. AI Copilot Router & Streaming Endpoint (`services/backend/src/ai/copilot/router.py`)

Here is the exact production architecture implemented in our repository:

```python
# File: services/backend/src/ai/copilot/router.py
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
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

@router.post("/chat")
async def chat(
    body: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> StreamingResponse:
    if not settings.feature_ai_copilot:
        raise HTTPException(status_code=403, detail="AI Copilot is not enabled.")

    # 1. Resolve or create AIConversation under the caller's tenant_id
    conversation_id = body.conversation_id
    if not conversation_id:
        new_conv = AIConversation(
            tenant_id=current_user.tenant_id,
            user_id=current_user.id,
            agent_type=body.agent_type,
            title=f"Chat about {body.agent_type}",
            context=body.context,
            created_by=current_user.id,
        )
        db.add(new_conv)
        await db.flush()
        conversation_id = new_conv.id

    # 2. Fetch history and active prompt template
    # ... loads AIMessage history & system prompt ...

    # 3. Stream response with multi-provider fallback
    use_anthropic = bool(settings.ai.anthropic_api_key)
    use_openai = bool(settings.ai.openai_api_key)

    async def stream_response() -> AsyncGenerator[str, None]:
        full_reply = []
        model_used = "simulation-fallback"
        try:
            if use_anthropic:
                import anthropic
                client = anthropic.AsyncAnthropic(api_key=settings.ai.anthropic_api_key)
                async with client.messages.stream(
                    model=settings.ai.model or "claude-3-5-sonnet-20241022",
                    max_tokens=1024,
                    system=system_prompt,
                    messages=api_messages,
                ) as stream:
                    async for text in stream.text_stream:
                        full_reply.append(text)
                        yield f"data: {text}\n\n"
            elif use_openai:
                from openai import AsyncOpenAI
                client = AsyncOpenAI(api_key=settings.ai.openai_api_key)
                response = await client.chat.completions.create(
                    model=settings.ai.model or "gpt-4o",
                    messages=api_messages,
                    stream=True,
                )
                async for chunk in response:
                    text = chunk.choices[0].delta.content or ""
                    full_reply.append(text)
                    yield f"data: {text}\n\n"
            else:
                # Graceful offline / developer sandbox fallback
                fallback_reply = (
                    f"Copilot Sandbox Mode 🛠️\n"
                    f"You queried: '{body.message}' under agent scope '{body.agent_type}'.\n"
                    f"To enable real LLM responses, set OPENAI_API_KEY or ANTHROPIC_API_KEY."
                )
                for word in fallback_reply.split(" "):
                    yield f"data: {word} \n\n"
                    full_reply.append(word + " ")

            yield "data: [DONE]\n\n"
        finally:
            # 4. Asynchronously persist assistant message and audit log prompt execution
            async with AsyncSessionLocal() as session:
                assistant_msg = AIMessage(
                    tenant_id=current_user.tenant_id,
                    conversation_id=conversation_id,
                    role="assistant",
                    content="".join(full_reply).strip(),
                    model_used=model_used,
                    created_by=current_user.id,
                )
                session.add(assistant_msg)
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

    return StreamingResponse(stream_response(), media_type="text/event-stream")
```

### 2. Multi-Tenant AI Models (`services/backend/src/ai/copilot/models.py`)

All conversation memory and prompt templates strictly inherit from `TenantBaseModel` to ensure tenant data is never leaked between competing restaurants:

```python
# File: services/backend/src/ai/copilot/models.py
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

class AIMessage(TenantBaseModel):
    __tablename__ = "ai_messages"
    conversation_id: Mapped[int] = mapped_column(BigInteger, nullable=False, index=True)
    role: Mapped[str] = mapped_column(String(20), nullable=False)  # user, assistant, system
    content: Mapped[str] = mapped_column(Text, nullable=False)
    model_used: Mapped[str | None] = mapped_column(String(100), nullable=True)
```

### 3. OCR Document Parsing Engine (`services/backend/src/ai/ocr/service.py`)

```python
# File: services/backend/src/ai/ocr/service.py
from typing import Dict, Any

class OCRService:
    """OCR Document & Receipt Parser."""

    async def parse_invoice_image(self, file_bytes: bytes) -> Dict[str, Any]:
        """Extract structured invoice data from document image."""
        # 1. Image preprocessing via OpenCV/PIL
        # 2. Text extraction via pytesseract.image_to_string()
        # 3. Regex/LLM entity extraction for HSN codes, taxes, vendor name
        return {
            "vendor_name": "Sample Vendor Pvt Ltd",
            "invoice_number": "INV-2026-001",
            "date": "2026-07-30",
            "subtotal": 1000.0,
            "tax": 180.0,
            "total": 1180.0,
            "confidence_score": 0.96,
        }

ocr_service = OCRService()
```

---

## 6. Common Mistakes and Gotchas (Lead Architect Level)

### Gotcha 1: Blocking the Async Event Loop with Pytesseract
* **Symptom**: While a manager uploads a 5MB scanned supplier invoice, the POS terminals in the restaurant experience 3-second freezes when clicking "Send to Kitchen".
* **Root Cause**: `pytesseract.image_to_string()` runs an external C++ binary (`tesseract`) synchronously. This blocks Python's single asyncio thread for the entire 2 to 4 seconds of image processing.
* **Architect Fix**: Always wrap synchronous OCR calls in `asyncio.to_thread(pytesseract.image_to_string, image)` or offload the bill scanning to Celery on the `ai` queue:
  ```python
  # CORRECT:
  extracted_text = await asyncio.to_thread(pytesseract.image_to_string, preprocessed_image)
  ```

### Gotcha 2: Cross-Tenant Context Poisoning in Prompts
* **Symptom**: Restaurant B asks the AI Copilot: *"What was our average order value on Friday?"* and the AI responds with data belonging to Restaurant A!
* **Root Cause**: Injecting context into the system prompt without querying the database through the tenant's Row-Level Security (RLS) session.
* **Architect Fix**: Always pass `tenant_id=current_user.tenant_id` to any RAG vector search or analytics query before formatting `context` into the LLM system prompt.

### Gotcha 3: Database Commit Failure after SSE Stream Finishes
* **Symptom**: The user sees the full AI response in their browser chat window, but upon refreshing the page, the conversation is empty.
* **Root Cause**: In an SSE generator, if the client disconnects prematurely (closing the laptop lid or clicking away), Python raises a `GeneratorExit` exception. If your database save logic is not wrapped in a robust `finally:` block with its own fresh `AsyncSessionLocal()`, the transaction is rolled back.

---

## 7. Best Practices & Performance Tips for POS Systems

```
┌─────────────────────────────────────────────────────────────┐
│                 AI Copilot SLA Architecture                 │
└──────────────────────────────┬──────────────────────────────┘
                               │
               Incoming Copilot Chat Request
                               │
                Check Enterprise Feature Flag
                (settings.feature_ai_copilot)
                               │
               ┌───────────────┴───────────────┐
             TRUE                            FALSE
               │                               │
       Check API Keys                 Return HTTP 403
               │                      "Feature Not Licensed"
      ┌────────┴────────┐
     KEYS             NO KEYS
      │                 │
  Stream SSE        Stream Mock
  Claude / GPT-4o   Simulation Tokens
      │                 │
  Persist Msg &     Persist Msg &
  Audit Log         Audit Log
```

1. **Always Cap Token Context**: Cap conversation history to the last 10 messages (`history[-10:]`). Beyond 10 messages, summarize earlier turns or drop them. Otherwise, token costs compound exponentially, and you risk hitting model context window limits.
2. **Audit Every AI Generation**: In regulated hospitality environments, staff might ask an AI to recalculate tax liability or void reasonings. Store `user_id`, `model_used`, and `action="AI_PROMPT_EXECUTION"` in the enterprise audit log table (`audit_logs`).
3. **Use OCR Confidence Scoring**: Never automatically approve an inventory purchase order from OCR alone. Always return a `confidence_score` (e.g., `0.96`). If the confidence is below `0.85`, highlight the suspicious fields (e.g., total tax, invoice number) in amber on the frontend for manual cashier confirmation.

---

## 8. Practice Exercises

### Exercise 1: Custom Kitchen Persona System Prompt (Easy)
Write a Python prompt template dictionary entry for an AI Agent named `"pastry_chef"` that specializes in bakery shelf-life, temperature-sensitive ingredient storage (chocolate, cream), and recipe batch scaling.

<details>
<summary>View Solution</summary>

```python
AGENT_SYSTEM_PROMPTS["pastry_chef"] = """You are the Master Pastry Chef & Bakery Operations Agent for The ssrone Platform.
Your responsibilities:
1. Advise on shelf-life and strict temperature-controlled storage for dairy, cream, chocolate, and yeast.
2. Calculate exact baker's percentages and batch-scaling formulas based on target cake or pastry counts.
3. Suggest immediate repurposing strategies for day-old bakery items (e.g., turning unsold baguettes into garlic croutons or bread pudding).
Be concise, scientific, and maintain kitchen hygiene and food safety standards."""
```
</details>

---

### Exercise 2: SSE Token Generator with Cancellation Safeguard (Medium)
Write a FastAPI SSE streaming generator function that reads tokens from an async queue, yields valid `data: {token}\n\n` strings, and catches `asyncio.CancelledError` to ensure conversation stats are updated even if the cashier closes the browser tab early.

<details>
<summary>View Solution</summary>

```python
import asyncio
from typing import AsyncGenerator
from src.shared.logger import get_logger

logger = get_logger(__name__)

async def safe_token_stream(token_iterator, conversation_id: int) -> AsyncGenerator[str, None]:
    token_count = 0
    try:
        async for token in token_iterator:
            token_count += 1
            yield f"data: {token}\n\n"
        yield "data: [DONE]\n\n"
    except asyncio.CancelledError:
        logger.warning("Client disconnected from SSE stream early", conversation_id=conversation_id)
        raise
    finally:
        logger.info("SSE Stream completed", conversation_id=conversation_id, tokens_generated=token_count)
        # Execute cleanup and update token usage stats in database
```
</details>

---

### Exercise 3: Computer Vision OCR Invoice Parser with Preprocessing (Hard)
Write an asynchronous Python service method `parse_supplier_bill(file_bytes)` using PIL, OpenCV (or NumPy), and Pytesseract that:
1. Converts image bytes to a NumPy array.
2. Applies grayscale and Otsu thresholding.
3. Executes Pytesseract in a non-blocking background thread.
4. Uses regular expressions to extract the Invoice Number (e.g., `INV-\d+`) and Total Amount (e.g., `Total[:\s]+₹?(\d+\.\d{2})`).

<details>
<summary>View Solution</summary>

```python
import io
import re
import asyncio
import numpy as np
import pytesseract
from PIL import Image

class InvoiceOCRParser:
    async def parse_supplier_bill(self, file_bytes: bytes) -> dict:
        # 1. Non-blocking image conversion and preprocessing
        def _preprocess_and_ocr():
            # Load image from bytes
            pil_image = Image.open(io.BytesIO(file_bytes)).convert("L") # Convert to Grayscale
            img_np = np.array(pil_image)
            
            # Simple binary thresholding (Otsu-like via numpy)
            threshold_val = np.mean(img_np)
            binary_img = ((img_np > threshold_val) * 255).astype(np.uint8)
            
            # Run Tesseract OCR
            raw_text = pytesseract.image_to_string(binary_img)
            return raw_text

        # Offload C-extension computation to thread pool
        extracted_text = await asyncio.to_thread(_preprocess_and_ocr)
        
        # 2. Extract structured fields via regex
        inv_match = re.search(r"(?:INV|INVOICE)[\s#:-]+([A-Z0-9-]+)", extracted_text, re.IGNORECASE)
        total_match = re.search(r"(?:TOTAL|GRAND TOTAL|NET AMOUNT)[\s:₹Rs.]+([0-9,]+\.[0-9]{2})", extracted_text, re.IGNORECASE)
        
        invoice_number = inv_match.group(1) if inv_match else "UNKNOWN"
        total_amount = float(total_match.group(1).replace(",", "")) if total_match else 0.0
        
        return {
            "invoice_number": invoice_number,
            "total_amount": total_amount,
            "raw_text_snippet": extracted_text[:200],
        }
```
</details>

---

## 9. Self-Test (Active Recall & Feynman Technique)

### Active Recall Questions
1. Why does SSR One AI stream LLM tokens using Server-Sent Events (`text/event-stream`) instead of standard JSON POST request-response cycles?
2. What happens to the Python event loop if you execute `pytesseract.image_to_string()` directly inside an `async def` route without `asyncio.to_thread()`?
3. How do `AIConversation` and `AIMessage` maintain enterprise multi-tenant isolation, and what base model do they inherit from?
4. How does the system behave if neither `ANTHROPIC_API_KEY` nor `OPENAI_API_KEY` is configured in the environment?
5. Why must invoice OCR extraction results include a `confidence_score` instead of immediately committing a finalized purchase order to the ledger?

### Feynman Explanations
1. **Explain Server-Sent Events to a Restaurant Cashier**: Explain why an AI that types word-by-word like a human feels 10 times faster than an AI that makes you wait 10 seconds for the entire answer to appear at once.
2. **Explain OCR Image Thresholding to a Chef**: Explain why taking a photo of a grease-stained vegetable bill under poor kitchen lighting produces scrambled letters, and how turning gray pixels into pure black and white makes the letters readable to a computer.

---

## 10. Architect's Cheat Sheet (One-Screen Reference)

```
╔══════════════════════════════════════════════════════════════════════════════════╗
║               SSR ONE AI — AI & OCR ENGINE ARCHITECT'S CHEAT SHEET               ║
╠══════════════════════════════════════════════════════════════════════════════════╣
║ 1. ARCHITECTURE LOCATIONS:                                                       ║
║    • Copilot Router: services/backend/src/ai/copilot/router.py                   ║
║    • Data Models: services/backend/src/ai/copilot/models.py                      ║
║    • OCR Service: services/backend/src/ai/ocr/service.py                         ║
║    • Background Worker: services/backend/src/workers/tasks.py (run_ai_job)       ║
║                                                                                  ║
║ 2. AGENT PERSONAS:                                                               ║
║    • "general": Platform copilot & operational assistance                        ║
║    • "kitchen": Recipe yield, ingredient forecast, waste reduction               ║
║    • "crm": Churn prediction, VIP retention, automated campaigns                 ║
║    • "finance": Revenue tracking, GST input tax credit, forecasting              ║
║    • "ceo": High-level executive performance & multi-branch P&L                  ║
║                                                                                  ║
║ 3. SSE STREAM PROTOCOL:                                                          ║
║    • Header: Content-Type: text/event-stream; Cache-Control: no-cache            ║
║    • Chunks: yield f"data: {token}\n\n"                                          ║
║    • Termination: yield "data: [DONE]\n\n"                                       ║
║                                                                                  ║
║ 4. OCR PIPELINE STANDARDS:                                                       ║
║    • Step 1: Grayscale & Adaptive Thresholding (Otsu)                            ║
║    • Step 2: NEVER block event loop -> use asyncio.to_thread(pytesseract.run)    ║
║    • Step 3: Regex entity extraction for HSN, GST, and totals                    ║
║    • Step 4: Always require human confirmation if confidence_score < 0.85        ║
║                                                                                  ║
║ 5. PRODUCTION GOLDEN RULES:                                                      ║
║    • Bound history context window to history[-10:] to control token costs        ║
║    • ALWAYS record AI_PROMPT_EXECUTION in audit_logs table                       ║
║    • Maintain sandbox fallback mode when third-party AI keys are unconfigured    ║
╚══════════════════════════════════════════════════════════════════════════════════╝
```
