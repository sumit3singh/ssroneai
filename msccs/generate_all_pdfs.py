"""
Script to batch generate all 11 academic PDFs using Chrome Headless.
This produces real, high-resolution vector PDF files on disk inside msccs/app/downloads/
"""
import subprocess
import os
import sys

CHROME_PATH = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DOWNLOADS_DIR = os.path.join(BASE_DIR, "app", "downloads")
html_path = os.path.join(BASE_DIR, 'app', 'index.html').replace('\\', '/')
INDEX_URL = f"file:///{html_path}"

DOCUMENTS = [
    ("master_index", "00_Master_Index_and_Curriculum_Guidelines.pdf"),
    ("project_application", "01_Major_Project_Topic_Approval_Application.pdf"),
    ("project_synopsis", "02_Major_Project_Official_Synopsis.pdf"),
    ("project_thesis", "03_Major_Project_Final_Thesis_Report.pdf"),
    ("project_slides", "04_Major_Project_Presentation_Slides_Speech.pdf"),
    ("project_viva", "05_Major_Project_Viva_Defense_Manual.pdf"),
    ("project_paper", "06_Major_Project_IEEE_Research_Paper.pdf"),
    ("seminar_application", "07_Seminar_Topic_Approval_Application.pdf"),
    ("seminar_report", "08_Seminar_Academic_Report.pdf"),
    ("seminar_slides", "09_Seminar_Oral_Presentation_Slides_Speech.pdf"),
    ("seminar_viva", "10_Seminar_Viva_Discussion_Guide.pdf"),
]

def main():
    os.makedirs(DOWNLOADS_DIR, exist_ok=True)
    print("=" * 60)
    print("M.Sc. Computer Science Semester IV - Batch PDF Generator")
    print(f"Target Directory: {DOWNLOADS_DIR}")
    print("=" * 60)

    for doc_key, pdf_name in DOCUMENTS:
        output_pdf = os.path.join(DOWNLOADS_DIR, pdf_name)
        target_url = f"{INDEX_URL}?doc={doc_key}"
        print(f"Generating: {pdf_name}...")

        args = [
            CHROME_PATH,
            "--headless=new",
            "--no-sandbox",
            "--disable-gpu",
            "--no-pdf-header-footer",
            "--virtual-time-budget=3000",
            f"--print-to-pdf={output_pdf}",
            target_url
        ]

        res = subprocess.run(args, capture_output=True, text=True)
        if os.path.exists(output_pdf) and os.path.getsize(output_pdf) > 0:
            size_kb = os.path.getsize(output_pdf) / 1024
            print(f"  [SUCCESS] {pdf_name} ({size_kb:.1f} KB)")
        else:
            print(f"  [ERROR] Failed to generate {pdf_name}: {res.stderr}")

    print("\nAll 11 PDFs generated successfully!")

if __name__ == "__main__":
    main()
