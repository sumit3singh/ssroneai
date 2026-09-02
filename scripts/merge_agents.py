from pathlib import Path
from datetime import datetime

ROOT = Path(__file__).resolve().parent.parent
AGENTS_DIR = ROOT / ".agents"
OUTPUT = ROOT / "MASTER_CONTEXT.md"

EXCLUDED_FILES = {
    "MASTER_CONTEXT.md",
}

files = sorted(
    p for p in AGENTS_DIR.rglob("*.md")
    if p.name not in EXCLUDED_FILES
)

parts = []

parts.append("# SSR ONE AI — MASTER CONTEXT")
parts.append("")
parts.append("> Automatically generated from `.agents/` documentation.")
parts.append(f"> Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
parts.append("")
parts.append("---")
parts.append("")

for file in files:
    relative_path = file.relative_to(ROOT)

    parts.append(f"# SOURCE: `{relative_path}`")
    parts.append("")
    
    try:
        content = file.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        content = file.read_text(encoding="utf-8-sig")

    parts.append(content.strip())
    parts.append("")
    parts.append("---")
    parts.append("")

OUTPUT.write_text("\n".join(parts), encoding="utf-8")

print(f"Generated: {OUTPUT}")
print(f"Markdown files merged: {len(files)}")
