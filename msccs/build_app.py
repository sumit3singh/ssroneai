"""
Build script to pack all academic markdown files and structured slide decks
into a single data.js for the standalone browser viewer application.
"""
import os
import json
import re

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
APP_DIR = os.path.join(BASE_DIR, "app")
os.makedirs(APP_DIR, exist_ok=True)

def parse_slides(md_content):
    """Parse slide markdown into structured objects for PPTX generation and slide player."""
    slides = []
    # Match ## Slide X: Title
    slide_chunks = re.split(r"(?=## Slide \d+:)", md_content)
    for chunk in slide_chunks:
        chunk = chunk.strip()
        if not chunk.startswith("## Slide"):
            continue
        
        # Extract title
        title_match = re.search(r"## Slide \d+:\s*(.+)", chunk)
        title = title_match.group(1).strip() if title_match else "Slide"
        
        # Extract bullet points
        bullets = []
        for line in chunk.split("\n"):
            line = line.strip()
            if line.startswith("* ") or line.startswith("- "):
                # clean bold/formatting for PPTX
                clean_line = line[2:].strip()
                if not clean_line.startswith("**Spoken Speech") and not clean_line.startswith("**Speech"):
                    bullets.append(clean_line)
        
        # Extract speech script / notes
        speech_match = re.search(r"\*(?:\*Spoken Speech Script|\*Speech Script|\*Script).*?\*:\s*(.+)", chunk, re.DOTALL)
        if not speech_match:
            speech_match = re.search(r"Spoken Speech Script.*?:(.*?)(?=\n##|\Z)", chunk, re.DOTALL)
        
        speech = ""
        if speech_match:
            speech = speech_match.group(1).strip().strip('*').strip('"').strip("'")
            # Remove any trailing markdown headers
            speech = speech.split("\n## ")[0].strip()
        
        slides.append({
            "title": title,
            "bullets": bullets,
            "speech": speech,
            "raw": chunk
        })
    return slides

def main():
    doc_files = {
        "project_application": "01-MAJOR-PROJECT-MSCS-4-03P/01-TOPIC-APPROVAL-APPLICATION.md",
        "project_synopsis": "01-MAJOR-PROJECT-MSCS-4-03P/02-PROJECT-SYNOPSIS.md",
        "project_thesis": "01-MAJOR-PROJECT-MSCS-4-03P/03-FINAL-PROJECT-REPORT-THESIS.md",
        "project_slides": "01-MAJOR-PROJECT-MSCS-4-03P/04-PRESENTATION-SLIDES.md",
        "project_viva": "01-MAJOR-PROJECT-MSCS-4-03P/05-VIVA-VOCE-DEFENSE-GUIDE.md",
        "project_paper": "01-MAJOR-PROJECT-MSCS-4-03P/06-RESEARCH-PAPER-IEEE.md",
        
        "seminar_application": "02-SEMINAR-MSCS-4-04/01-SEMINAR-TOPIC-APPROVAL-APPLICATION.md",
        "seminar_report": "02-SEMINAR-MSCS-4-04/02-SEMINAR-REPORT.md",
        "seminar_slides": "02-SEMINAR-MSCS-4-04/03-SEMINAR-PRESENTATION-SLIDES.md",
        "seminar_viva": "02-SEMINAR-MSCS-4-04/04-SEMINAR-VIVA-QA.md",
        "master_index": "00-MASTER-INDEX.md",
    }
    
    data = {}
    for key, rel_path in doc_files.items():
        full_path = os.path.join(BASE_DIR, rel_path)
        if os.path.exists(full_path):
            with open(full_path, "r", encoding="utf-8") as f:
                content = f.read()
                data[key] = {
                    "path": rel_path,
                    "content": content
                }
                if "slides" in key:
                    data[key]["parsed_slides"] = parse_slides(content)
        else:
            print(f"Warning: {full_path} not found")

    output_js = os.path.join(APP_DIR, "data.js")
    with open(output_js, "w", encoding="utf-8") as f:
        f.write("/* Auto-generated document dataset for M.Sc. CS Viewer App */\n")
        f.write("window.ACADEMIC_DATA = ")
        json.dump(data, f, indent=2, ensure_ascii=False)
        f.write(";\n")
        
    print(f"Successfully generated {output_js} with {len(data)} documents!")

if __name__ == "__main__":
    main()
