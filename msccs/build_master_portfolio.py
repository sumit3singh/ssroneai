"""
Build Complete Master Academic Portfolio PDF & ZIP Package for Sumit Singh
1. Combines all 11 academic documents into a single consolidated Master PDF.
2. Bundles all 11 PDFs and 2 PPTX presentations into a 1-click ZIP archive.
"""
import os
import subprocess
import zipfile
import json

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
APP_DIR = os.path.join(BASE_DIR, "app")
DOWNLOADS_DIR = os.path.join(APP_DIR, "downloads")
CHROME_PATH = r"C:\Program Files\Google\Chrome\Application\chrome.exe"

DOC_ORDER = [
    ("master_index", "M.Sc. Computer Science Semester IV Master Index & Syllabus Alignment"),
    ("project_application", "Major Project: Topic Approval Application"),
    ("project_synopsis", "Major Project: Official 8-Part Project Synopsis"),
    ("project_thesis", "Major Project: Full Master's Thesis Report (30-35 Pages)"),
    ("project_slides", "Major Project: Viva Voce Presentation Slides & Speech Script"),
    ("project_viva", "Major Project: Examiner Defense & Model Q&A Guide"),
    ("project_paper", "Major Project: IEEE Academic Conference Research Paper"),
    ("seminar_application", "Seminar: Topic Approval Application Letter"),
    ("seminar_report", "Seminar: Full Academic Report (10-15 Pages)"),
    ("seminar_slides", "Seminar: Oral Presentation Slides & Speech"),
    ("seminar_viva", "Seminar: Faculty Discussion Q&A Guide"),
]

def generate_master_html():
    data_js_path = os.path.join(APP_DIR, "data.js")
    with open(data_js_path, "r", encoding="utf-8") as f:
        raw = f.read().split("window.ACADEMIC_DATA = ")[1].rstrip(";\n")
        data = json.loads(raw)

    master_html_path = os.path.join(APP_DIR, "master_portfolio.html")
    
    html_content = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>M.Sc. Computer Science Semester IV Master Academic Portfolio — Sumit Singh</title>
  <link rel="stylesheet" href="styles.css">
  <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
  <style>
    @page {
      margin: 15mm 15mm 15mm 15mm;
      size: A4 portrait;
    }
    body {
      background: #FFFFFF;
      color: #1A202C;
      font-family: 'Merriweather', serif;
      font-size: 11pt;
      line-height: 1.6;
      margin: 0;
      padding: 0;
    }
    .page-break {
      page-break-before: always;
      break-before: page;
      margin-top: 2rem;
      padding-top: 1rem;
    }
    .cover-card {
      border: 3px double #0F1E36;
      padding: 3rem 2rem;
      text-align: center;
      margin-bottom: 2rem;
      min-height: 85vh;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .academic-table-wrapper {
      width: 100%;
      overflow: visible;
      margin: 1rem 0;
    }
    .academic-doc table {
      width: 100%;
      border-collapse: collapse;
      font-size: 10pt;
    }
    .academic-doc th {
      background-color: #1E3A8A;
      color: #FFFFFF;
      padding: 8px 10px;
      border: 1px solid #1E293B;
    }
    .academic-doc td {
      padding: 7px 10px;
      border: 1px solid #CBD5E1;
    }
    .academic-doc tr:nth-child(even) td {
      background-color: #F8FAFC;
    }
    .academic-doc pre {
      background-color: #F8FAFC;
      border: 1px solid #CBD5E1;
      padding: 0.75rem 1rem;
      font-size: 9pt;
      line-height: 1.4;
      white-space: pre-wrap;
      word-break: break-all;
    }
    .academic-doc h1 { font-family: 'Outfit', sans-serif; font-size: 20pt; font-weight: 800; color: #0F1E36; margin-top: 1.5rem; border-bottom: 2px solid #0F1E36; padding-bottom: 0.4rem; }
    .academic-doc h2 { font-family: 'Outfit', sans-serif; font-size: 15pt; font-weight: 700; color: #1E3A8A; margin-top: 1.25rem; border-bottom: 1px solid #CBD5E1; padding-bottom: 0.3rem; }
    .academic-doc h3 { font-family: 'Outfit', sans-serif; font-size: 13pt; font-weight: 600; color: #334155; margin-top: 1rem; }
    .doc-section-header {
      background: #F1F5F9;
      border-left: 5px solid #C58B3A;
      padding: 0.75rem 1.25rem;
      margin-bottom: 1.5rem;
      font-family: 'Outfit', sans-serif;
    }
  </style>
</head>
<body class="academic-doc">

  <!-- OFFICIAL UNIVERSITY MASTER PORTFOLIO COVER PAGE -->
  <div class="cover-card">
    <div>
      <h3 style="font-size: 12pt; font-weight: 800; letter-spacing: 2px; color: #C58B3A; text-transform: uppercase; margin: 0;">
        JAGAT GURU NANAK DEV PUNJAB STATE OPEN UNIVERSITY, PATIALA
      </h3>
      <p style="font-size: 10pt; color: #64748B; margin: 4px 0 0 0;">(Established by Act No. 19 of 2019 of the Legislature of State of Punjab)</p>
      <h2 style="font-size: 16pt; font-weight: 800; color: #0F1E36; text-transform: uppercase; margin: 1.5rem 0 0.5rem 0; border: none;">
        DEPARTMENT OF COMPUTER SCIENCE & APPLICATIONS
      </h2>
      <hr style="border: none; border-top: 2px solid #0F1E36; width: 60%; margin: 1rem auto;">
    </div>

    <div style="margin: 2rem 0;">
      <h4 style="font-size: 13pt; color: #475569; font-weight: 600; text-transform: uppercase; margin: 0 0 0.5rem 0;">
        Master of Science in Computer Science (M.Sc. CS) — Semester IV
      </h4>
      <h1 style="font-size: 22pt; font-weight: 900; color: #0F1E36; line-height: 1.3; border: none; margin: 0 auto; max-width: 85%;">
        COMPREHENSIVE FINAL ACADEMIC PORTFOLIO
      </h1>
      <p style="font-size: 11pt; color: #1E3A8A; font-weight: 700; margin-top: 0.75rem;">
        Complete Academic Fulfillment: Major Project (MSCS-4-03P: 200 Marks) & Seminar (MSCS-4-04: 50 Marks)
      </p>
    </div>

    <div style="border: 1px solid #CBD5E1; background: #F8FAFC; border-radius: 8px; padding: 1.5rem; max-width: 70%; margin: 0 auto; text-align: left;">
      <table style="width: 100%; border: none; font-size: 11pt;">
        <tr style="background: transparent;"><td style="border: none; font-weight: 700; color: #0F1E36; width: 45%;">Candidate Name:</td><td style="border: none; font-weight: 800; color: #0F1E36;">Sumit Singh</td></tr>
        <tr style="background: transparent;"><td style="border: none; font-weight: 700; color: #0F1E36;">Roll No. / Enrollment ID:</td><td style="border: none; font-family: monospace; font-weight: 700;">PSOU/MSCS/2026/042</td></tr>
        <tr style="background: transparent;"><td style="border: none; font-weight: 700; color: #0F1E36;">Academic Session / Cycle:</td><td style="border: none;">July 2024 - 2026 Cycle</td></tr>
        <tr style="background: transparent;"><td style="border: none; font-weight: 700; color: #0F1E36;">Study Centre:</td><td style="border: none;">JGND PSOU Regional Centre, Patiala</td></tr>
        <tr style="background: transparent;"><td style="border: none; font-weight: 700; color: #0F1E36;">Faculty Supervisor / Guide:</td><td style="border: none; font-weight: 700;">Dr. Harpreet Singh</td></tr>
        <tr style="background: transparent;"><td style="border: none; font-weight: 700; color: #0F1E36;">Designation:</td><td style="border: none;">Assistant Professor, Dept. of Computer Science</td></tr>
        <tr style="background: transparent;"><td style="border: none; font-weight: 700; color: #0F1E36;">Submission Date:</td><td style="border: none;">15/05/2026</td></tr>
      </table>
    </div>

    <div>
      <p style="font-size: 10pt; color: #475569; margin: 1rem 0 0 0; font-weight: 600;">
        JGND PSOU Campus, C-28, Lower Mall Road, Patiala, Punjab – 147001
      </p>
    </div>
  </div>

  <div id="master-rendered-docs"></div>

  <script>
    const docsOrder = """ + json.dumps(DOC_ORDER) + """;
    const academicData = """ + json.dumps(data) + """;
    const container = document.getElementById('master-rendered-docs');

    docsOrder.forEach(([key, title], index) => {
      const doc = academicData[key];
      if (!doc || !doc.content) return;

      const sectionDiv = document.createElement('div');
      sectionDiv.className = 'page-break';

      const headerDiv = document.createElement('div');
      headerDiv.className = 'doc-section-header';
      headerDiv.innerHTML = `
        <span style="font-size: 10pt; font-weight: 800; color: #92400E; text-transform: uppercase;">Section ${index + 1} of ${docsOrder.length} • Deliverable Document</span>
        <h2 style="margin: 4px 0 0 0; font-size: 16pt; border: none; color: #0F1E36;">${title}</h2>
      `;
      sectionDiv.appendChild(headerDiv);

      const bodyDiv = document.createElement('div');
      bodyDiv.innerHTML = marked.parse(doc.content);
      sectionDiv.appendChild(bodyDiv);

      container.appendChild(sectionDiv);
    });
  </script>
</body>
</html>
"""
    with open(master_html_path, "w", encoding="utf-8") as f:
        f.write(html_content)
    print("Master HTML created:", master_html_path)
    return master_html_path

def compile_master_pdf():
    master_html_path = generate_master_html()
    output_pdf = os.path.join(DOWNLOADS_DIR, "00_COMPLETE_MASTER_ACADEMIC_PORTFOLIO_SUMIT_SINGH.pdf")
    html_url_path = master_html_path.replace('\\', '/')
    target_url = f"file:///{html_url_path}"

    print(f"Compiling Master Consolidated PDF to: {output_pdf}...")
    args = [
        CHROME_PATH,
        "--headless=new",
        "--no-sandbox",
        "--disable-gpu",
        "--no-pdf-header-footer",
        "--virtual-time-budget=6000",
        f"--print-to-pdf={output_pdf}",
        target_url
    ]

    res = subprocess.run(args, capture_output=True, text=True)
    if os.path.exists(output_pdf) and os.path.getsize(output_pdf) > 0:
        size_mb = os.path.getsize(output_pdf) / (1024 * 1024)
        print(f"  [SUCCESS] Master PDF Generated: {output_pdf} ({size_mb:.2f} MB)")
    else:
        print(f"  [ERROR] Failed to generate Master PDF: {res.stderr}")

def create_all_in_one_zip():
    zip_path = os.path.join(DOWNLOADS_DIR, "Sumit_Singh_MSc_CS_Semester_IV_All_Deliverables.zip")
    print(f"Creating complete deliverables ZIP package: {zip_path}...")

    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zipf:
        for root, _, files in os.walk(DOWNLOADS_DIR):
            for file in files:
                if file.endswith(".zip") or file.startswith("test"):
                    continue
                file_path = os.path.join(root, file)
                arcname = os.path.relpath(file_path, DOWNLOADS_DIR)
                zipf.write(file_path, arcname)
                print(f"  Added to ZIP: {arcname}")

    size_mb = os.path.getsize(zip_path) / (1024 * 1024)
    print(f"  [SUCCESS] All-in-One ZIP Package Ready: {zip_path} ({size_mb:.2f} MB)")

if __name__ == "__main__":
    compile_master_pdf()
    create_all_in_one_zip()
