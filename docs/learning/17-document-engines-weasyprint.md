# Lesson 17: Document Generation Engines, WeasyPrint & OpenPyXL

> **Architecture Pillar**: Asynchronous Document Compilation & High-Precision Print Engines  
> **Repository Path**: `services/backend/src/engines/print/`, `services/backend/src/engines/report/`, `services/backend/src/workers/tasks.py`  
> **Prerequisites**: Lesson 03 (Docker & System C-Libs), Lesson 04 (FastAPI), Lesson 16 (Celery & Redis)

---

## 1. What It Is (Simple Explanation + Analogy)

In a high-volume hospitality SaaS like **The ssrone (SSR INFINITY)**, businesses generate hundreds of thousands of documents every day:
1. **Thermal Kitchen Order Tickets (KOTs)** (80mm / 58mm slips printed instantly next to the sizzling tandoor or wok station).
2. **GST-Compliant Tax Invoices & Guest Folios** (A4 or thermal slips with exact tax breakdowns, HSN codes, and QR codes).
3. **Managerial Audit & Sales Spreadsheets** (Multi-tab Excel workbooks aggregating 50,000 order line items for end-of-month accounting).

### The Real-Life Analogy
Imagine running a Michelin-star restaurant kitchen with a professional printing desk:
* **The Low-Level Binary Approach (ReportLab / Direct PDF Canvas)** is like having a draftsman hand-draw every line, letter, and table cell using a ruler and mathematical coordinates (`(x=140, y=280)`). If you add a new line item, every single box beneath it must have its coordinates manually recalculated, or text will overlap and ruin the bill.
* **The HTML/CSS Template Engine (WeasyPrint + Jinja2)** is like giving a web designer a clean HTML page with CSS styling. You write standard HTML tables and CSS rules (`border-collapse: collapse; font-family: Inter;`). WeasyPrint compiles that HTML/CSS into a pixel-perfect, publication-grade vector PDF.
* **The High-Performance Tabular Streamer (OpenPyXL)** is like an automated ledger machine that feeds rows into a `.xlsx` spreadsheet one by one without having to hold the entire encyclopedic ledger in its human hands at once.

```
       ┌────────────────────────────────────────────────────────┐
       │              SSR One AI Document Pipeline              │
       └───────────────────────────┬────────────────────────────┘
                                   │
         ┌─────────────────────────┴────────────────────────┐
         │                                                  │
         ▼                                                  ▼
┌───────────────────────────────┐          ┌────────────────────────────────┐
│   Pixel-Perfect Vector PDFs   │          │  High-Throughput Spreadsheets  │
│     (Invoices, Folios, KOT)   │          │   (Sales, Tax, Stock Ledgers)  │
├───────────────────────────────┤          ├────────────────────────────────┤
│ • Jinja2 HTML/CSS Templates   │          │ • OpenPyXL (Streaming Mode)    │
│ • CSS Paged Media (@page)     │          │ • Memory-constant chunking     │
│ • WeasyPrint (Cairo + Pango)  │          │ • Multi-sheet analytical export│
└───────────────────────────────┘          └────────────────────────────────┘
```

---

## 2. Why This Project Uses It (Problems Solved & Trade-offs)

### The Core Problems
1. **The POS Bill Layout Nightmare**: Every restaurant owner wants their logo positioned differently, custom footer notes ("FSSAI Lic No.", "GSTIN: 07AAAAA0000A1Z5"), and specific currency formatting. Coding this in raw PDF canvas primitives (like ReportLab or PDFKit) requires thousands of lines of fragile arithmetic.
2. **Thermal Roll Pagination**: Standard printers print onto fixed pages (A4 or Letter). POS thermal printers print onto continuous paper rolls (80mm or 58mm width) that cut only when the order ends. The engine must support continuous roll CSS (`@page { size: 80mm auto; margin: 0; }`).
3. **RAM Blowout on Massive Excel Exports**: A restaurant chain exporting 12 months of sales transactions (500,000 rows) can crash a backend container with an Out-Of-Memory (OOM) error if the spreadsheet is built in memory as a monolithic Python dictionary.

### Alternative Comparisons

| Technology | Approach | Pros | Cons / Why We Rejected or Scoped It |
| :--- | :--- | :--- | :--- |
| **WeasyPrint** *(Chosen for PDFs)* | HTML5 + CSS3 ➡️ PDF via Cairo/Pango | Uses standard HTML/CSS templates; supports CSS Paged Media (`@page`, page counters); zero headless browser bloat. | Requires Linux C-libraries (`libpango`, `libcairo`). |
| **Puppeteer / Headless Chrome** | Headless Chrome renders webpage | Perfect CSS support. | Massive memory consumption (~350MB RAM per worker); slow startup latency; security attack surface. |
| **ReportLab** | Python imperative canvas drawing | Fast, low RAM. | Nightmarish maintenance. Changing column padding requires manual X/Y math calculation across 50 files. |
| **OpenPyXL** *(Chosen for Excel)* | Direct Python `.xlsx` generator | Full formatting support (bold, colors, auto-filters, formulas); built-in `write_only=True` stream mode. | Slower than pure CSV, but enterprise clients require formatted Excel files. |
| **ESC/POS Binary** | Raw bytes to thermal printer heads | Instant sub-second printing over LAN/USB sockets. | Low-level hardware command bytes, not suitable for customer download or email attachments. |

---

## 3. Core Concepts (From Zero to Architect)

### 1. The WeasyPrint Architecture (Cairo + Pango)
WeasyPrint does **not** use Chromium or WebKit. Instead, it is built on two battle-tested Linux graphics and typography libraries:
* **Pango**: Handles text layout, Unicode normalization, font matching, and bidirectional text rendering (crucial for multi-lingual POS systems).
* **Cairo**: A 2D graphics library that renders vector shapes, borders, background gradients, and text directly into PDF instructions.

### 2. CSS Paged Media Module (`@page`)
Web browsers render infinitely long scrollable pages. Print engines render discrete physical sheets or continuous rolls. CSS Paged Media allows you to control page boundaries:

```css
/* 80mm POS Thermal Receipt */
@page {
  size: 80mm auto; /* 80mm width, continuous height */
  margin: 2mm 3mm;
}

/* A4 Legal Tax Invoice */
@page {
  size: A4 portrait;
  margin: 15mm 10mm 15mm 10mm;
  @bottom-right {
    content: "Page " counter(page) " of " counter(pages);
    font-size: 8pt;
    font-family: 'Inter', sans-serif;
  }
}
```

### 3. OpenPyXL Streaming Mode (`write_only=True`)
In standard OpenPyXL, creating a workbook builds an in-memory DOM tree of every cell, row, and style. For 100,000 rows, this consumes > 1.5 GB of RAM.
In `write_only` mode:
* Cells are written immediately to an XML stream on disk.
* Memory usage remains flat at **< 30 MB** whether you export 10 rows or 1,000,000 rows.

---

## 4. Language & Syntax Breakdown

### 1. Generating a PDF with WeasyPrint & Jinja2

```python
from jinja2 import Environment, FileSystemLoader
from weasyprint import HTML, CSS

# 1. Load Jinja2 template
env = Environment(loader=FileSystemLoader("templates/documents/"))
template = env.get_template("tax_invoice.html")

# 2. Render HTML with tenant context and dynamic order data
rendered_html = template.render(
    tenant_name="The Royal Baithak",
    gstin="07AAAAA0000A1Z5",
    invoice_number="INV-2026-0891",
    date="2026-10-23",
    items=[
        {"name": "Paneer Butter Masala", "hsn": "2106", "qty": 2, "price": 320.00, "cgst": 16.00, "sgst": 16.00},
        {"name": "Butter Naan", "hsn": "1905", "qty": 4, "price": 60.00, "cgst": 6.00, "sgst": 6.00},
    ],
    total_tax=44.00,
    grand_total=924.00,
)

# 3. Compile to PDF bytes
pdf_bytes = HTML(string=rendered_html).write_pdf(
    stylesheets=[CSS(string="@page { size: A4 portrait; margin: 10mm; }")]
)
```

### 2. Streaming Large Excel Exports with OpenPyXL

```python
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment

def stream_sales_report(orders_generator, file_path: str):
    # write_only=True prevents high RAM consumption
    wb = Workbook(write_only=True)
    ws = wb.create_sheet(title="Sales Summary")

    # Header Row
    headers = ["Order #", "Date", "Customer", "Subtotal (₹)", "Tax (₹)", "Total (₹)", "Payment Mode"]
    ws.append(headers)

    # Stream chunks of database records directly to the file stream
    for order in orders_generator:
        ws.append([
            order.order_number,
            order.created_at.strftime("%Y-%m-%d %H:%M"),
            order.customer_name or "Walk-in Guest",
            float(order.subtotal),
            float(order.tax_total),
            float(order.grand_total),
            order.payment_method,
        ])

    wb.save(file_path)
```

---

## 5. How It Is Used in OUR Project

### 1. Celery Worker PDF Task (`services/backend/src/workers/tasks.py`)
In our monorepo, PDF generation is decoupled from the web thread and handled asynchronously by Celery workers on the `exports` queue:

```python
# File: services/backend/src/workers/tasks.py
from src.workers.celery_app import celery_app
from src.shared.logger import get_logger

logger = get_logger(__name__)

@celery_app.task(name="src.shared.tasks.generate_pdf", bind=True)
def generate_pdf(self, template: str, data: dict, output_path: str) -> dict:
    """Render a PDF from a Jinja2 template with WeasyPrint."""
    try:
        logger.info("Generating PDF", template=template, output=output_path)
        # Production Flow:
        # 1. Render Jinja2 template with tenant branding
        # 2. Compile via weasyprint.HTML(string=rendered).write_pdf(output_path)
        # 3. Upload to tenant S3/R2 private bucket or save locally
        return {"status": "done", "path": output_path}
    except Exception as exc:
        logger.error("PDF generation failed", error=str(exc))
        raise
```

### 2. Print Engine Blueprint (`services/backend/src/engines/print/engine.py`)
Our backend standardizes receipt data payloads before formatting them into ESC/POS thermal printer bytes or WeasyPrint templates:

```python
# File: services/backend/src/engines/print/engine.py
from typing import Dict, Any, List

class PrintEngine:
    """Print Engine rendering thermal receipt commands and PDF templates."""

    def generate_receipt_payload(
        self, order_number: str, items: List[Dict[str, Any]], total: float, tax: float
    ) -> Dict[str, Any]:
        """Generate structured thermal receipt layout payload."""
        return {
            "order_number": order_number,
            "header": "THE ssrone ENTERPRISE ERP",
            "items": [
                {
                    "name": item.get("name", "Item"),
                    "qty": item.get("quantity", 1),
                    "price": item.get("unit_price", 0.0),
                }
                for item in items
            ],
            "subtotal": total - tax,
            "tax": tax,
            "total": total,
            "footer": "Thank you for visiting! Powered by SSR One AI",
        }

print_engine = PrintEngine()
```

### 3. Docker C-Library Dependencies (`services/backend/Dockerfile`)
WeasyPrint cannot run on Python standard library alone. Notice lines 16–24 in our Dockerfile:

```dockerfile
# File: services/backend/Dockerfile
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    libpango-1.0-0 \
    libharfbuzz0b \
    libpangoft2-1.0-0 \
    libcairo2 \
    libgdk-pixbuf2.0-0 \
    libffi-dev \
    shared-mime-info \
    tesseract-ocr \
    && rm -rf /var/lib/apt/lists/*
```

---

## 6. Common Mistakes and Gotchas (Lead Architect Level)

### Gotcha 1: Running WeasyPrint in the Synchronous FastAPI Request Loop
* **Symptom**: Cashiers report the POS terminal freezing for 2 to 4 seconds whenever they click "Print Invoice".
* **Root Cause**: WeasyPrint parses CSS, performs layout tree calculations, loads fonts, and rasterizes images. Under heavy CPU load, generating a 2-page PDF takes **800ms - 2500ms** of 100% single-core CPU time. Running this inside an `async def` FastAPI route blocks the entire Python event loop!
* **Architect Fix**: Never generate PDFs synchronously inside HTTP routes. Offload the job to Celery via `.delay()` on the dedicated `exports` queue, or stream pre-rendered HTML to the browser and call `window.print()`.

### Gotcha 2: Missing System Fonts in Docker Containers
* **Symptom**: PDF text renders as blank squares ("tofu") or ugly fallback fonts (Times New Roman) instead of corporate typography.
* **Root Cause**: Minimal Linux Docker images (`python:3.11-slim`) do not include modern typography fonts.
* **Architect Fix**: Install font packages (`fonts-liberation`, `fonts-dejavu-core`) in the Dockerfile, or bundle the `.woff2` / `.ttf` font files inside `assets/fonts/` and declare them via `@font-face` with base64 data URIs.

### Gotcha 3: External Image Fetching Network Deadlocks
* **Symptom**: WeasyPrint hangs indefinitely or times out when compiling invoices with restaurant logos (`<img src="http://example.com/logo.png">`).
* **Root Cause**: WeasyPrint attempts an HTTP GET request for every external image URL. If the DNS is slow or the host is down, the renderer blocks.
* **Architect Fix**: Pre-load tenant logos as local disk files or convert them to base64 Data URIs (`<img src="data:image/png;base64,iVBORw0KG...">`) before passing data to Jinja2.

---

## 7. Best Practices & Performance Tips for POS Systems

```
┌─────────────────────────────────────────────────────────────┐
│              POS Thermal Printing Decision Tree             │
└──────────────────────────────┬──────────────────────────────┘
                               │
                Is customer physical at counter?
                               │
               ┌───────────────┴───────────────┐
              YES                              NO
               │                               │
    Generate ESC/POS Raw            Offload Celery Task to
    Bytes (< 10ms CPU time)         `exports` Queue
               │                               │
    Send to Local LAN Thermal       WeasyPrint renders PDF
    Printer (Port 9100 / USB)                  │
               │                    Save to S3 Bucket & Email
    Instant paper receipt cut       to Customer / WhatsApp Link
```

1. **Keep Thermal KOTs as Pure ESC/POS Strings**: For kitchen tickets, don't generate PDFs. Kitchen thermal printers expect raw text with escape control codes (`\x1b\x40` initialize, `\x1b\x61\x01` center, `\x1d\x56\x00` cut paper). This takes **< 1ms**.
2. **Use WeasyPrint for Legal Invoices & Reports**: Invoices, tax certificates, and end-of-day Z-Reports require precise margins, barcodes, QR codes, and government tax tables. Use WeasyPrint for these documents.
3. **Stream Large Excel Reports with Generators**: When exporting historical data from PostgreSQL, use an `AsyncSession.stream_scalars()` generator to yield records in chunks of 500 directly into OpenPyXL's `ws.append()`. Never load 100,000 ORM objects into memory at once.

---

## 8. Practice Exercises

### Exercise 1: Create an 80mm Thermal Receipt CSS Template (Easy)
Write the complete CSS `@page` rule and typography rules for a continuous 80mm thermal receipt that prevents line wrapping on item names and hides page headers.

<details>
<summary>View Solution</summary>

```css
@page {
  size: 80mm auto;
  margin: 3mm 2mm;
}

body {
  font-family: 'Courier New', monospace;
  font-size: 11pt;
  line-height: 1.2;
  color: #000;
  width: 76mm;
  margin: 0 auto;
}

.receipt-header {
  text-align: center;
  border-bottom: 1px dashed #000;
  padding-bottom: 3mm;
  margin-bottom: 3mm;
}

.item-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1.5mm;
}

.item-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 45mm;
}

.divider {
  border-top: 1px dashed #000;
  margin: 2mm 0;
}
```
</details>

---

### Exercise 2: Jinja2 Tax Split Calculations (Medium)
Create a Jinja2 snippet that calculates and displays CGST (9%) and SGST (9%) if the customer is within the state, or IGST (18%) if the transaction is interstate.

<details>
<summary>View Solution</summary>

```html
<table class="tax-summary-table">
  <tr>
    <td>Taxable Amount:</td>
    <td class="text-right">₹{{ "%.2f"|format(taxable_subtotal) }}</td>
  </tr>
  {% if is_interstate %}
  <tr>
    <td>Integrated GST (IGST @ 18%):</td>
    <td class="text-right">₹{{ "%.2f"|format(taxable_subtotal * 0.18) }}</td>
  </tr>
  {% else %}
  <tr>
    <td>Central GST (CGST @ 9%):</td>
    <td class="text-right">₹{{ "%.2f"|format(taxable_subtotal * 0.09) }}</td>
  </tr>
  <tr>
    <td>State GST (SGST @ 9%):</td>
    <td class="text-right">₹{{ "%.2f"|format(taxable_subtotal * 0.09) }}</td>
  </tr>
  {% endif %}
  <tr class="grand-total-row">
    <td><strong>Grand Total:</strong></td>
    <td class="text-right"><strong>₹{{ "%.2f"|format(grand_total) }}</strong></td>
  </tr>
</table>
```
</details>

---

### Exercise 3: Zero-Memory Celery Export Task with OpenPyXL (Hard)
Write a Python function for a Celery task that queries orders in chunks of 500 rows, streams them into an OpenPyXL `write_only` workbook, saves it to `/tmp/reports/`, and returns the final file path and row count.

<details>
<summary>View Solution</summary>

```python
import os
from openpyxl import Workbook
from src.workers.celery_app import celery_app
from src.core.database.engine import AsyncSessionLocal
from src.shared.logger import get_logger
from sqlalchemy import select

logger = get_logger(__name__)

@celery_app.task(name="src.shared.tasks.export_large_orders_excel", bind=True)
def export_large_orders_excel(self, tenant_id: str, output_filename: str) -> dict:
    import asyncio
    
    async def _async_export():
        output_dir = "/tmp/reports"
        os.makedirs(output_dir, exist_ok=True)
        file_path = os.path.join(output_dir, output_filename)
        
        # 1. Initialize streaming workbook
        wb = Workbook(write_only=True)
        ws = wb.create_sheet(title="Orders")
        ws.append(["Order Number", "Table", "Total (INR)", "Status", "Date"])
        
        total_rows = 0
        
        # 2. Query in streaming mode
        async with AsyncSessionLocal() as session:
            # Assume OrderModel is imported
            from src.modules.restaurant.models import Order
            
            stmt = select(Order).where(Order.tenant_id == tenant_id).order_by(Order.id)
            result = await session.stream_scalars(stmt)
            
            async for order in result:
                ws.append([
                    order.order_number,
                    order.table_identifier or "N/A",
                    float(order.grand_total or 0.0),
                    order.status,
                    order.created_at.strftime("%Y-%m-%d %H:%M:%S")
                ])
                total_rows += 1
                
        wb.save(file_path)
        return {"status": "success", "file_path": file_path, "row_count": total_rows}

    # Execute async generator within the synchronous Celery worker thread
    return asyncio.run(_async_export())
```
</details>

---

## 9. Self-Test (Active Recall & Feynman Technique)

### Active Recall Questions
1. Why does WeasyPrint require `libpango` and `libcairo` installed on the host operating system, and what happens if you run it in a bare Alpine or Debian container without them?
2. How does `@page { size: 80mm auto; }` differ from `@page { size: A4 portrait; }` when printing on thermal hardware?
3. What is the fundamental memory difference between `Workbook()` and `Workbook(write_only=True)` in OpenPyXL?
4. Why should WeasyPrint PDF compilation NEVER be executed synchronously within an `async def` FastAPI route?
5. How does `PrintEngine.generate_receipt_payload()` decouple the user interface from thermal hardware ESC/POS printer byte streams?

### Feynman Explanations
1. **Explain CSS Paged Media to a Junior Web Developer**: Explain why standard responsive web design CSS (like `100vw`, `100vh`, and continuous scrolling) breaks completely when sending documents to a printer, and how `@page` rules and page counters solve it.
2. **Explain Write-Only Streaming to a Systems Engineer**: Explain why loading 500,000 database records into a spreadsheet can trigger Linux OOM Killer (`exit code 137`), and how an iterator stream pipeline fixes it.

---

## 10. Architect's Cheat Sheet (One-Screen Reference)

```
╔══════════════════════════════════════════════════════════════════════════════════╗
║               SSR ONE AI — DOCUMENT ENGINE ARCHITECT'S CHEAT SHEET               ║
╠══════════════════════════════════════════════════════════════════════════════════╣
║ 1. ENGINE DIRECTORY LOCATIONS:                                                   ║
║    • Print Engine: services/backend/src/engines/print/engine.py                  ║
║    • Report Engine: services/backend/src/engines/report/engine.py                ║
║    • Celery Tasks: services/backend/src/workers/tasks.py (generate_pdf, export)  ║
║                                                                                  ║
║ 2. THERMAL ROLL CSS STANDARDS:                                                   ║
║    • 80mm Printer (3-inch): @page { size: 80mm auto; margin: 2mm 3mm; }          ║
║    • 58mm Printer (2-inch): @page { size: 58mm auto; margin: 1mm 2mm; }          ║
║    • Font Stack: Courier New, monospace, font-size: 10pt; line-height: 1.2;      ║
║                                                                                  ║
║ 3. TAX INVOICE A4 CSS STANDARDS:                                                 ║
║    • @page { size: A4 portrait; margin: 15mm 10mm; }                            ║
║    • Headers/Footers: @bottom-right { content: "Page " counter(page); }          ║
║                                                                                  ║
║ 4. HIGH-PERFORMANCE EXCEL STREAMING:                                             ║
║    • Use: wb = openpyxl.Workbook(write_only=True)                                ║
║    • Append: ws.append([col1, col2, ...])                                        ║
║    • Memory: Stays flat < 30 MB regardless of dataset size                       ║
║                                                                                  ║
║ 5. PRODUCTION GOLDEN RULES:                                                      ║
║    • NEVER call WeasyPrint inside FastAPI async event loop                       ║
║    • ALWAYS dispatch via Celery queue: exports                                   ║
║    • ALWAYS embed logos as Base64 Data URIs to eliminate external HTTP fetches   ║
║    • Use ESC/POS raw bytes for sub-second counter KOTs                           ║
╚══════════════════════════════════════════════════════════════════════════════════╝
```
