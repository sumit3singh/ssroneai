/**
 * SSR ONE AI - M.Sc. Computer Science Academic Portal Engine (Light Theme Edition)
 * Student Developer Studio: Live In-Browser Customization Architecture
 * Features:
 * - 🛠️ Student Developer Studio (Add, Edit, Change, Delete all deliverables, viva Q&A, slides & glossary)
 * - 📝 Live Document & Thesis Markdown Studio with Real-time Preview & Code Snippets
 * - ❓ Viva Voce Q&A Manager (Interactive Examiner Defense Question & Answer Builder)
 * - 🎤 Slide Decks & Speech Script Studio (Oral Defense Presentation Manager)
 * - 📖 कठिन शब्दार्थ (Hard Words Glossary Manager in Hindi & English)
 * - 💾 Complete Project Backup & Restore Engine (1-Click JSON Export & Import)
 * - 1-Click Direct PPTX Download (Pre-compiled 100% reliable PowerPoint presentations)
 * - 1-Click Clean PDF Export (html2pdf with A4 print rules)
 * - Fit-to-Screen Presenter View (Side-by-side Slide + Speech Script)
 * - Student Particulars Dynamic Synchronizer
 */

// Default Student Profile
const DEFAULT_PROFILE = {
  studentName: "Sumit Singh",
  rollNumber: "PSOU/MSCS/2026/042",
  admissionCycle: "July 2024 - 2026",
  studyCentre: "JGND PSOU Regional Centre, Patiala",
  guideName: "Dr. Harpreet Singh (Assistant Professor, Dept of CS)",
};

let currentProfile = { ...DEFAULT_PROFILE };
let currentDocKey = "project_synopsis";
let currentSlideIndex = 0;
let currentSlidesData = [];
let isScriptPanelOpen = true;

// 📖 Dictionary of Hard Words (Baseline)
const HARD_WORDS_GLOSSARY = [
  {
    id: "glossary_1",
    term: "Idempotency (आईडेम्पोटेंसी)",
    pronounce: "आई-डेम-पो-टेंसी",
    definition: "An API or database property where an operation produces the exact same result no matter how many times it is repeated.",
    hindiMeaning: "अगर इंटरनेट कटने या कैशियर द्वारा गलती से 2 बार 'Pay' बटन दब जाए, तो भी कस्टमर का 2 बार बिल नहीं कटेगा। सिस्टम दूसरी बार में पहचान कर डुप्लीकेट को अपने आप रोक देता है।",
    example: "नेटवर्क ड्रॉप होने पर जब टर्मिनल 3 बार ऑर्डर री-ट्राई करता है, तो डेटाबेस में केवल 1 ही ऑर्डर बनता है, 3 नहीं।",
    category: "Distributed Systems"
  },
  {
    id: "glossary_2",
    term: "Multi-Tenancy (मल्टी-टेनेंसी)",
    pronounce: "मल्टी-टेनेंसी",
    definition: "An enterprise software architecture where a single physical application and database cluster serves multiple independent client businesses (tenants).",
    hindiMeaning: "एक ही सॉफ्टवेयर और डेटाबेस के अंदर 100 अलग-अलग रेस्टोरेंट का डेटा पूरी तरह अलग-अलग और सुरक्षित रखना, जैसे एक ही बड़ी इमारत में 100 अलग-अलग फ्लैट्स होते हैं।",
    example: "रेस्टोरेंट A का कैशियर कभी भी रेस्टोरेंट B के बिल, मेन्यू या बिक्री के आंकड़े नहीं देख सकता।",
    category: "Cloud Architecture"
  },
  {
    id: "glossary_3",
    term: "Row-Level Security / RLS (रो-लेवल सिक्योरिटी)",
    pronounce: "आर-एल-एस (रो लेवल सिक्योरिटी)",
    definition: "A database-engine level security mechanism in PostgreSQL that restricts row access based on current user session context.",
    hindiMeaning: "डेटाबेस का अपना डिजिटल ताला। यह सुरक्षा प्रोग्रामर के कोड पर निर्भर नहीं करती, बल्कि डेटाबेस का इंजन खुद तय करता है कि किस रेस्टोरेंट को कितनी टेबल दिखेगी।",
    example: "अगर कोई प्रोग्रामर कोड में 'WHERE tenant_id = 5' लिखना भूल भी जाए, तो भी PostgreSQL डेटाबेस दूसरी दुकान का डेटा कभी नहीं दिखाएगा।",
    category: "Database & Security"
  },
  {
    id: "glossary_4",
    term: "Offline-First / Local-First (ऑफलाइन-फर्स्ट)",
    pronounce: "ऑफ-लाइन फर्स्ट",
    definition: "A software design paradigm where local client storage (IndexedDB) is the primary write target, ensuring complete operational availability without internet.",
    hindiMeaning: "इंटरनेट बंद होने पर भी बिलिंग और टोकन 0.5 मिलीसेकंड में काम करते रहेंगे क्योंकि डेटा सीधे ब्राउज़र की लोकल मेमोरी में सेव होता है।",
    example: "वाई-फाई का तार कट जाने पर भी रेस्टोरेंट के 4 कैशियर बिना रुके लगातार ग्राहकों का बिल बनाते रहते हैं।",
    category: "Frontend Architecture"
  },
  {
    id: "glossary_5",
    term: "Eventual Consistency (इवेन्चुअल कंसिस्टेंसी)",
    pronounce: "इवेन्चुअल कंसिस्टेंसी",
    definition: "A distributed consistency model guaranteeing that if no new updates are made, all replicas will eventually converge to identical values.",
    hindiMeaning: "इंटरनेट वापस आते ही सारा ऑफलाइन डेटा बिना किसी डुप्लीकेट या टकराव के क्लाउड सर्वर से सही तरीके से मिल जाना।",
    example: "ऑफलाइन मोड में कटे 50 बिल इंटरनेट आते ही 4 सेकंड के अंदर मुख्य सर्वर पर सिंक हो जाते हैं।",
    category: "Distributed Systems"
  },
  {
    id: "glossary_6",
    term: "IndexedDB & Dexie.js (इंडेक्स्ड-डीबी)",
    pronounce: "इंडेक्स्ड डी-बी",
    definition: "A powerful, asynchronous, transactional NoSQL database engine built directly inside modern web browsers.",
    hindiMeaning: "ब्राउज़र की अपनी इन-बिल्ट हार्ड डिस्क मेमोरी जो इंटरनेट न होने पर भी लाखों ऑर्डर्स और मेन्यू को सुरक्षित सेव रख सकती है।",
    example: "Dexie.js के जरिए हमारा POS सिस्टम मात्र 0.38 मिलीसेकंड में ऑर्डर कंप्यूटर में लिख लेता है।",
    category: "Web Storage"
  },
  {
    id: "glossary_7",
    term: "WebSockets (वेबसॉकेट)",
    pronounce: "वेब-सॉकेट",
    definition: "A full-duplex, persistent bidirectional communication protocol over a single TCP connection.",
    hindiMeaning: "कैशियर और किचन स्क्रीन के बीच सीधी लाइव तार। कैशियर के बटन दबाते ही 1 सेकंड से कम (25 मिलीसेकंड) में किचन स्क्रीन पर घंटी बज जाती है।",
    example: "वेटर ने टेबल 4 का ऑर्डर पंच किया, और शेफ के सामने लगे iPad पर तुरंत हरी टिकट बनकर आ गई।",
    category: "Networking"
  },
  {
    id: "glossary_8",
    term: "Tesseract OCR (ऑप्टिकल कैरेक्टर रिकॉग्निशन)",
    pronounce: "टेसरेक्ट ओ-सी-आर",
    definition: "An open-source computer vision OCR engine that extracts printed and handwritten text from images.",
    hindiMeaning: "कागज़ के सब्ज़ी/किराने के बिल की फोटो से अपने आप कंप्यूटर में सामान, मात्रा और GST टैक्स पढ़ लेना।",
    example: "किचन में आई टमाटर और पनीर की रसीद की फोटो खींची, और सॉफ्टवेयर ने अपने आप गोदाम का परचेज ऑर्डर बना दिया।",
    category: "Computer Vision & AI"
  },
  {
    id: "glossary_9",
    term: "ASGI & FastAPI (एसिंक्रोनस सर्वर)",
    pronounce: "ए-एस-जी-आई और फास्ट-ए-पी-आई",
    definition: "Asynchronous Server Gateway Interface executing non-blocking event loops with high concurrent connection throughput.",
    hindiMeaning: "सुपर-फास्ट पाइथन सर्वर जो एक साथ हज़ारों ग्राहकों और ऑर्डर्स को बिना अटके या धीमे हुए प्रोसेस करता है।",
    example: "हज़ारों ग्राहक एक साथ मोबाइल पर क्यूआर कोड मेन्यू देख रहे हैं, फिर भी सर्वर का लोड 1% रहता है।",
    category: "Backend Engine"
  },
  {
    id: "glossary_10",
    term: "Bill of Materials / BOM (बिल ऑफ मटीरियल्स)",
    pronounce: "बी-ओ-एम (बिल ऑफ मटीरियल्स)",
    definition: "A comprehensive formula defining the exact raw material components and quantities required to produce a finished item.",
    hindiMeaning: "खाने की रेसिपी का सटीक नाप-तौल। जैसे ही 1 पनीर टिक्का बिका, गोदाम के स्टॉक से 200 ग्राम पनीर और 50 ग्राम दही अपने आप घट जाता है।",
    example: "महीने के अंत में मालिक को पता चल जाता है कि कितना पनीर बिका और कितना चोरी या खराब हुआ।",
    category: "Supply Chain & ERP"
  },
  {
    id: "glossary_11",
    term: "UUIDv4 (यूनिक आईडी)",
    pronounce: "यू-यू-आई-डी-वी-4",
    definition: "A 128-bit Universally Unique Identifier generated using cryptographic randomness (e.g. 9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d).",
    hindiMeaning: "कंप्यूटर द्वारा बनाया गया ऐसा अनूठा कोड (जैसे आधार नंबर) जो दुनिया भर में कभी किसी दूसरे ऑर्डर से नहीं टकरा सकता।",
    example: "जब 5 कैशियर ऑफलाइन होते हैं, तो वे अपनी-अपनी मशीनों पर यूनिक टोकन बनाते हैं जो बाद में आपस में कभी मिक्स नहीं होते।",
    category: "Computer Science Foundations"
  },
  {
    id: "glossary_12",
    term: "Write-Ahead Log / WAL (राइट-अहेड लॉग)",
    pronounce: "डबल्यू-ए-एल (वॉल)",
    definition: "A database transaction technique where mutations are appended to a disk log before being committed to main index trees.",
    hindiMeaning: "डेटाबेस का पक्का खाता जो कंप्यूटर बंद होने या अचानक बिजली कटने पर भी किसी ऑर्डर को गायब नहीं होने देता।",
    example: "अगर ऑर्डर सेव होते ही सर्वर की लाइट चली जाए, तो दोबारा चालू होने पर WAL फाइल से पूरा ऑर्डर वापस आ जाता है।",
    category: "Database Internals"
  },
  {
    id: "glossary_13",
    term: "CAP Theorem (सी.ए.पी. प्रमेय)",
    pronounce: "कैप थ्योरम",
    definition: "A fundamental distributed theorem stating that a distributed store can guarantee at most two of Consistency, Availability, and Partition Tolerance.",
    hindiMeaning: "कंप्यूटर साइंस का अटल नियम: इंटरनेट कटने पर या तो सॉफ्टवेयर को पूरी तरह रोक दो, या फिर ऑफलाइन चलाकर बाद में डेटा मिलाओ।",
    example: "हमारा सिस्टम Availability (100% चालू रहना) चुनता है, ताकि इंटरनेट बंद होने पर भी दुकान की बिक्री न रुके।",
    category: "Distributed Systems Theory"
  },
  {
    id: "glossary_14",
    term: "Server-Sent Events / SSE (सर्वर-सेंट इवेंट्स)",
    pronounce: "एस-एस-ई",
    definition: "A server-to-client unidirectional streaming protocol over HTTP for streaming real-time tokens.",
    hindiMeaning: "AI कॉपायलट का जवाब एक-एक शब्द टाइप होते हुए लाइव स्क्रीन पर दिखाना (जैसे ChatGPT में दिखता है)।",
    example: "जब होटल मालिक पूछता है 'आज का मुनाफा बताओ', तो AI जवाब को एक झटके में नहीं, बल्कि सेकंड्स में शब्द-दर-शब्द स्क्रीन पर लिखता है।",
    category: "AI & Streaming"
  },
  {
    id: "glossary_15",
    term: "Kitchen Display System / KDS (किचन डिस्प्ले सिस्टम)",
    pronounce: "के-डी-एस",
    definition: "A digital display terminal in commercial kitchens replacing paper KOT slips with real-time station-routed order tickets.",
    hindiMeaning: "रसोई में शेफ के सामने लगी डिजिटल टच स्क्रीन जो नए ऑर्डर्स को लाइव घंटी की आवाज़ और रंगों के साथ दिखाती है।",
    example: "तंदूर शेफ को सिर्फ नान और रोटी के ऑर्डर दिखते हैं, जबकि बिरयानी शेफ को सिर्फ चावल के ऑर्डर दिखते हैं।",
    category: "POS Hardware & Ops"
  }
];

// =========================================================================
// 🛠️ CUSTOM REACTIVE DATA STORES (DEVELOPER MODE ENGINE)
// =========================================================================

let customDocuments = {}; // { [docKey]: markdownString }
let customViva = { project_viva: [], seminar_viva: [] };
let customSlides = { project_slides: [], seminar_slides: [] };
let customGlossary = [];

let isDevModeActive = false;
let isInlineEditActive = false;
let currentVivaTrack = "project_viva";
let currentSlidesDeck = "project_slides";

// Parse initial viva questions from raw markdown
function parseInitialVivaQuestions(rawContent) {
  if (!rawContent) return [];
  const questions = [];
  const parts = rawContent.split(/\n### Question\s+/);
  parts.slice(1).forEach((part, idx) => {
    const match = part.match(/^(\d+):\s*["']?(.*?)["']?\n([\s\S]*)/);
    if (match) {
      const qTitle = match[2].trim();
      const rest = match[3];

      let category = "Viva Voce Defense";
      let goal = "";
      let answer = "";

      // Category match
      const catMatch = rest.match(/\*\s+\*\*Technical Category\*\*:\s*`?(.*?)`?(?=\n\*|\Z)/i);
      if (catMatch) category = catMatch[1].trim();

      // Goal match
      const goalMatch = rest.match(/\*\s+\*\*Examiner'?s?\s+Goal\*\*:\s*(.*?)(?=\n\*|\Z)/i);
      if (goalMatch) goal = goalMatch[1].trim();

      // Defending Answer match
      const answerMatch = rest.match(/\*\s+\*\*Architect'?s?\s+Defending\s+Answer\*\*:\s*([\s\S]*?)(?=\n---\n|\n###|\Z)/i);
      if (answerMatch) {
        answer = answerMatch[1].trim();
      } else {
        answer = rest.trim();
      }

      questions.push({
        id: `viva_${idx + 1}`,
        question: qTitle,
        category: category,
        examinerGoal: goal,
        answer: answer
      });
    }
  });
  return questions;
}

// Generate clean markdown from viva questions array
function generateVivaMarkdown(track, questions) {
  const isProj = track === "project_viva";
  let md = isProj
    ? `# MAJOR PROJECT VIVA VOCE DEFENSE & EXAMINER Q&A GUIDE\n## Course Code: MSCS-4-03P | Major Project (M.Sc. Computer Science, Semester-IV)\n\n**Project Title**: Design and Implementation of a High-Throughput, Offline-First, Multi-Tenant SaaS Enterprise POS Architecture with Integrated AI Copilot and Computer Vision OCR  \n**Target Evaluator**: External University Examiner & Faculty Defense Committee (JGND PSOU)  \n**Viva Voce Duration**: 7 to 10 Minutes\n\n---\n\n## 🎯 Anticipated Technical Questions & Architect's Model Answers\n\n`
    : `# SEMINAR VIVA VOCE & QUESTION DEFENSE GUIDE\n## Course Code: MSCS-4-04 | Seminar (M.Sc. Computer Science, Semester-IV)\n\n**Topic**: Architectural Patterns for Offline-First Distributed Web Applications: Balancing Zero-Latency User Experience with Eventual Consistency  \n**Evaluator Target**: University Examiners, Faculty Chair, Seminar Panel  \n**Q&A Duration**: 5 to 7 Minutes\n\n---\n\n## 🎯 Anticipated Faculty Examiner Questions & Architect's Model Answers\n\n`;

  questions.forEach((q, idx) => {
    md += `### Question ${idx + 1}: "${q.question}"\n`;
    if (q.category) md += `* **Technical Category**: \`${q.category}\`\n`;
    if (q.examinerGoal) md += `* **Examiner's Goal**: ${q.examinerGoal}\n`;
    md += `* **Architect's Defending Answer**:\n`;
    const lines = q.answer.split('\n');
    lines.forEach(l => {
      const cleanLine = l.trim();
      if (cleanLine.startsWith('>')) md += `  ${cleanLine}\n`;
      else if (cleanLine) md += `  > ${cleanLine}\n`;
      else md += `  >\n`;
    });
    md += `\n---\n\n`;
  });

  return md;
}

// Generate clean markdown from slides array
function generateSlidesMarkdown(deckKey, slides) {
  const isProj = deckKey === "project_slides";
  let md = isProj
    ? `# MAJOR PROJECT PRESENTATION SLIDES & EXAMINER SPEECH SCRIPT\n## Course Code: MSCS-4-03P | Major Project (M.Sc. Computer Science, Semester-IV)\n\n**Candidate**: ${currentProfile.studentName} | **Roll No**: ${currentProfile.rollNumber} | **University**: JGND PSOU, Patiala\n\n---\n\n`
    : `# SEMINAR ORAL PRESENTATION SLIDES & EXAMINER SPEECH SCRIPT\n## Course Code: MSCS-4-04 | Seminar (M.Sc. Computer Science, Semester-IV)\n\n**Candidate**: ${currentProfile.studentName} | **Roll No**: ${currentProfile.rollNumber} | **University**: JGND PSOU, Patiala\n\n---\n\n`;

  slides.forEach((s, idx) => {
    md += `## Slide ${idx + 1}: ${s.title}\n`;
    if (s.bullets && s.bullets.length > 0) {
      s.bullets.forEach(b => {
        md += `${b.startsWith('*') ? b : '* ' + b}\n`;
      });
    }
    if (s.speech) {
      const cleanSpeech = s.speech.replace(/^"|"$/g, '').trim();
      md += `* **Spoken Speech Script**:  \n  *"${cleanSpeech}"*\n\n`;
    }
    md += `---\n\n`;
  });

  return md;
}

// Load all custom stores from localStorage or defaults
function loadCustomStores() {
  // 1. Documents
  try {
    const savedDocs = localStorage.getItem("msc_custom_documents");
    customDocuments = savedDocs ? JSON.parse(savedDocs) : {};
  } catch {
    customDocuments = {};
  }

  // 2. Glossary
  try {
    const savedGlossary = localStorage.getItem("msc_custom_glossary");
    customGlossary = savedGlossary ? JSON.parse(savedGlossary) : [...HARD_WORDS_GLOSSARY];
  } catch {
    customGlossary = [...HARD_WORDS_GLOSSARY];
  }
  customGlossary.forEach((item, idx) => {
    if (!item.id) item.id = `glossary_${idx + 1}`;
  });

  // 3. Viva Voce Q&A
  try {
    const savedViva = localStorage.getItem("msc_custom_viva");
    if (savedViva) {
      customViva = JSON.parse(savedViva);
    } else {
      customViva = {
        project_viva: window.ACADEMIC_DATA && window.ACADEMIC_DATA.project_viva
          ? parseInitialVivaQuestions(window.ACADEMIC_DATA.project_viva.content)
          : [],
        seminar_viva: window.ACADEMIC_DATA && window.ACADEMIC_DATA.seminar_viva
          ? parseInitialVivaQuestions(window.ACADEMIC_DATA.seminar_viva.content)
          : []
      };
    }
  } catch {
    customViva = { project_viva: [], seminar_viva: [] };
  }

  // 4. Slide Decks
  try {
    const savedSlides = localStorage.getItem("msc_custom_slides");
    if (savedSlides) {
      customSlides = JSON.parse(savedSlides);
    } else {
      customSlides = {
        project_slides: window.ACADEMIC_DATA && window.ACADEMIC_DATA.project_slides && window.ACADEMIC_DATA.project_slides.parsed_slides
          ? JSON.parse(JSON.stringify(window.ACADEMIC_DATA.project_slides.parsed_slides))
          : [],
        seminar_slides: window.ACADEMIC_DATA && window.ACADEMIC_DATA.seminar_slides && window.ACADEMIC_DATA.seminar_slides.parsed_slides
          ? JSON.parse(JSON.stringify(window.ACADEMIC_DATA.seminar_slides.parsed_slides))
          : []
      };
    }
  } catch {
    customSlides = { project_slides: [], seminar_slides: [] };
  }

  // Synchronize window.ACADEMIC_DATA with custom slides
  if (window.ACADEMIC_DATA) {
    if (window.ACADEMIC_DATA.project_slides && customSlides.project_slides.length > 0) {
      window.ACADEMIC_DATA.project_slides.parsed_slides = customSlides.project_slides;
    }
    if (window.ACADEMIC_DATA.seminar_slides && customSlides.seminar_slides.length > 0) {
      window.ACADEMIC_DATA.seminar_slides.parsed_slides = customSlides.seminar_slides;
    }
  }

  // 5. Developer Mode status
  isDevModeActive = localStorage.getItem("msc_dev_mode_active") === "true";
  updateDevModeUI();
}

function getActiveGlossary() {
  return customGlossary && customGlossary.length > 0 ? customGlossary : HARD_WORDS_GLOSSARY;
}

function getActiveSlides(deckKey) {
  if (customSlides && customSlides[deckKey] && customSlides[deckKey].length > 0) {
    return customSlides[deckKey];
  }
  const defaultData = window.ACADEMIC_DATA && window.ACADEMIC_DATA[deckKey];
  return (defaultData && defaultData.parsed_slides) || [];
}

function getActiveViva(track) {
  if (customViva && customViva[track] && customViva[track].length > 0) {
    return customViva[track];
  }
  return [];
}

function getCustomDocumentMarkdown(docKey) {
  if (customDocuments && customDocuments[docKey]) {
    return customDocuments[docKey];
  }
  const defaultData = window.ACADEMIC_DATA && window.ACADEMIC_DATA[docKey];
  return defaultData ? defaultData.content : "";
}

// =========================================================================
// 🚀 INITIALIZE APPLICATION ON LOAD
// =========================================================================

document.addEventListener("DOMContentLoaded", () => {
  loadProfile();
  loadCustomStores();
  setupEventListeners();
  setupGlossaryModal();
  setupDeveloperStudioEvents();

  const urlParams = new URLSearchParams(window.location.search);
  const docFromParam = urlParams.get("doc");
  if (docFromParam && window.ACADEMIC_DATA && window.ACADEMIC_DATA[docFromParam]) {
    currentDocKey = docFromParam;
  }

  renderDocument(currentDocKey);
});

// Profile Management
function loadProfile() {
  const saved = localStorage.getItem("msc_cs_profile");
  if (saved) {
    try {
      currentProfile = { ...DEFAULT_PROFILE, ...JSON.parse(saved) };
    } catch {
      currentProfile = { ...DEFAULT_PROFILE };
    }
  }
  updateProfileBadges();
}

function saveProfile(newProfile) {
  currentProfile = { ...currentProfile, ...newProfile };
  localStorage.setItem("msc_cs_profile", JSON.stringify(currentProfile));
  updateProfileBadges();
  renderDocument(currentDocKey);
}

function updateProfileBadges() {
  const nameEl = document.getElementById("profile-badge-name");
  const rollEl = document.getElementById("profile-badge-roll");
  if (nameEl) nameEl.textContent = currentProfile.studentName;
  if (rollEl) rollEl.textContent = currentProfile.rollNumber;
}

// Replace Placeholders with Student Particulars
function applyProfileToText(text) {
  if (!text) return "";
  return text
    .replace(/\[Student Name\]/g, currentProfile.studentName)
    .replace(/\[Candidate Name\]/g, currentProfile.studentName)
    .replace(/\[Student Roll Number\]/g, currentProfile.rollNumber)
    .replace(/\[Roll Number\]/g, currentProfile.rollNumber)
    .replace(/\[Enrollment Number\]/g, currentProfile.rollNumber)
    .replace(/\[Jan \/ July Admission Cycle\]/g, currentProfile.admissionCycle)
    .replace(/\[Study Centre Code & Name\]/g, currentProfile.studyCentre)
    .replace(/\[Supervisor \/ Faculty Guide Name\]/g, currentProfile.guideName)
    .replace(/\[Supervisor Name\]/g, currentProfile.guideName);
}

// Clean raw markdown in bullets
function cleanBulletText(str) {
  if (!str) return "";
  let s = str.replace(/`([^`]+)`/g, "$1");
  return applyProfileToText(s);
}

// Document Rendering
function renderDocument(docKey) {
  currentDocKey = docKey;
  const docData = window.ACADEMIC_DATA ? window.ACADEMIC_DATA[docKey] : null;
  const contentEl = document.getElementById("doc-render-target");
  const titleEl = document.getElementById("doc-header-title");
  const pathEl = document.getElementById("doc-header-path");
  const pptxBtn = document.getElementById("btn-download-pptx");
  const presentBtn = document.getElementById("btn-present-slides");

  if (!docData || !contentEl) return;

  // Update active sidebar link
  document.querySelectorAll(".nav-item").forEach((el) => {
    if (el.getAttribute("data-key") === docKey) {
      el.classList.add("bg-blue-100/80", "text-blue-950", "font-bold", "border-blue-300");
      el.classList.remove("text-slate-600", "hover:bg-slate-50", "border-transparent");
    } else {
      el.classList.remove("bg-blue-100/80", "text-blue-950", "font-bold", "border-blue-300");
      el.classList.add("text-slate-600", "hover:bg-slate-50", "border-transparent");
    }
  });

  // Check if slide deck
  const isSlideDeck = !!docData.parsed_slides;
  if (pptxBtn) pptxBtn.style.display = isSlideDeck ? "inline-flex" : "none";
  if (presentBtn) presentBtn.style.display = isSlideDeck ? "inline-flex" : "none";

  const docTitles = {
    project_application: "Major Project: Topic Approval Application",
    project_synopsis: "Major Project: Official 8-Part Project Synopsis",
    project_thesis: "Major Project: Full Master's Thesis (30-35 Pages)",
    project_slides: "Major Project: Viva Voce Presentation Slides & Speech",
    project_viva: "Major Project: Examiner Defense & Q&A Manual",
    project_paper: "Major Project: IEEE Academic Research Paper",
    seminar_application: "Seminar: Topic Approval Application Letter",
    seminar_report: "Seminar: Full Academic Report (10-15 Pages)",
    seminar_slides: "Seminar: Oral Presentation Slides & Speech",
    seminar_viva: "Seminar: Faculty Discussion & Defense Strategy",
    master_index: "M.Sc. Computer Science Semester IV Master Index",
  };

  if (titleEl) titleEl.textContent = docTitles[docKey] || "Academic Document";
  if (pathEl) pathEl.textContent = `msccs/${docData.path}`;

  // Check for in-page HTML edits or custom markdown
  const customSavedHtml = localStorage.getItem(`custom_doc_html_${docKey}`);
  if (customSavedHtml) {
    contentEl.innerHTML = customSavedHtml;
  } else {
    const rawMarkdown = getCustomDocumentMarkdown(docKey);
    const personalizedContent = applyProfileToText(rawMarkdown);
    contentEl.innerHTML = marked.parse(personalizedContent);
  }

  // Maintain editable state if in-page editing is active
  if (isInlineEditActive) {
    contentEl.contentEditable = "true";
  }

  // Wrap tables with responsive wrapper
  contentEl.querySelectorAll('table').forEach(tbl => {
    if (!tbl.parentElement.classList.contains('academic-table-wrapper')) {
      const wrapper = document.createElement('div');
      wrapper.className = 'academic-table-wrapper';
      tbl.parentNode.insertBefore(wrapper, tbl);
      wrapper.appendChild(tbl);
    }
  });

  window.scrollTo({ top: 0, behavior: "smooth" });
}

// 1-Click Direct Download of Verified Real .PPTX File
function downloadPPTX() {
  let fileName = "";
  if (currentDocKey === "project_slides") {
    fileName = "Major_Project_Presentation_MSCS-4-03P.pptx";
  } else if (currentDocKey === "seminar_slides") {
    fileName = "Seminar_Presentation_MSCS-4-04.pptx";
  } else {
    showToast("Please open a presentation slide deck to download PPTX.", "info");
    return;
  }

  showToast(`Downloading verified PowerPoint presentation (${fileName})...`, "success");

  const link = document.createElement("a");
  link.href = `downloads/${fileName}`;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Pre-compiled PDF files map
const DOC_PDF_MAP = {
  master_index: "00_Master_Index_and_Curriculum_Guidelines.pdf",
  project_application: "01_Major_Project_Topic_Approval_Application.pdf",
  project_synopsis: "02_Major_Project_Official_Synopsis.pdf",
  project_thesis: "03_Major_Project_Final_Thesis_Report.pdf",
  project_slides: "04_Major_Project_Presentation_Slides_Speech.pdf",
  project_viva: "05_Major_Project_Viva_Defense_Manual.pdf",
  project_paper: "06_Major_Project_IEEE_Research_Paper.pdf",
  seminar_application: "07_Seminar_Topic_Approval_Application.pdf",
  seminar_report: "08_Seminar_Academic_Report.pdf",
  seminar_slides: "09_Seminar_Oral_Presentation_Slides_Speech.pdf",
  seminar_viva: "10_Seminar_Viva_Discussion_Guide.pdf",
};

// 1-Click Clean PDF Download
function exportPDF() {
  const pdfFileName = DOC_PDF_MAP[currentDocKey] || "Academic_Document.pdf";
  showToast(`Downloading verified academic PDF (${pdfFileName})...`, "success");

  const link = document.createElement("a");
  link.href = `downloads/${pdfFileName}`;
  link.download = pdfFileName;
  link.target = "_blank";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// 📕 1-Click Master PDF Download
function downloadMasterPDF() {
  const masterFile = "00_COMPLETE_MASTER_ACADEMIC_PORTFOLIO_SUMIT_SINGH.pdf";
  showToast(`Downloading Complete Master Academic Portfolio (All 11 Documents)...`, "success");

  const link = document.createElement("a");
  link.href = `downloads/${masterFile}`;
  link.download = masterFile;
  link.target = "_blank";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// =========================================================================
// 🛠️ STUDENT DEVELOPER MODE TOGGLE & IN-PAGE EDIT CONTROLS
// =========================================================================

function toggleDeveloperMode() {
  isDevModeActive = !isDevModeActive;
  localStorage.setItem("msc_dev_mode_active", isDevModeActive ? "true" : "false");
  updateDevModeUI();

  if (isDevModeActive) {
    showToast("Student Developer Mode Activated! Click 'Open Developer Studio' to customize.", "info");
  } else {
    showToast("Developer Mode exited.", "info");
  }
}

function updateDevModeUI() {
  const devBar = document.getElementById("dev-mode-bar");
  const floatingBtn = document.getElementById("floating-dev-btn");
  const devBtn = document.getElementById("btn-toggle-dev");

  if (isDevModeActive) {
    if (devBar) devBar.classList.remove("hidden");
    if (floatingBtn) floatingBtn.classList.remove("hidden");
    if (devBtn) {
      devBtn.classList.add("bg-amber-500", "text-white", "border-amber-600");
      devBtn.classList.remove("bg-slate-100", "text-slate-700");
    }
  } else {
    if (devBar) devBar.classList.add("hidden");
    if (floatingBtn) floatingBtn.classList.add("hidden");
    if (devBtn) {
      devBtn.classList.remove("bg-amber-500", "text-white", "border-amber-600");
      devBtn.classList.add("bg-slate-100", "text-slate-700");
    }
    if (isInlineEditActive) toggleInlineEdit();
  }
}

function toggleInlineEdit() {
  isInlineEditActive = !isInlineEditActive;
  const docContainer = document.getElementById("doc-render-target");
  const statusEl = document.getElementById("inline-edit-status");
  const saveBtn = document.getElementById("btn-save-dev-edits");
  const toggleBtn = document.getElementById("btn-toggle-inline-edit");

  if (isInlineEditActive) {
    if (docContainer) {
      docContainer.contentEditable = "true";
      docContainer.classList.add("ring-2", "ring-amber-400", "p-2", "rounded-lg");
    }
    if (statusEl) statusEl.textContent = "In-Page Edit: ON";
    if (saveBtn) saveBtn.classList.remove("hidden");
    if (toggleBtn) {
      toggleBtn.classList.add("bg-amber-400", "border-amber-500");
      toggleBtn.classList.remove("bg-amber-200");
    }
    showToast("In-Page Edit ON: Click anywhere on document text or tables to edit directly!", "info");
  } else {
    if (docContainer) {
      docContainer.contentEditable = "false";
      docContainer.classList.remove("ring-2", "ring-amber-400", "p-2", "rounded-lg");
    }
    if (statusEl) statusEl.textContent = "In-Page Edit: OFF";
    if (saveBtn) saveBtn.classList.add("hidden");
    if (toggleBtn) {
      toggleBtn.classList.remove("bg-amber-400", "border-amber-500");
      toggleBtn.classList.add("bg-amber-200");
    }
    showToast("In-Page Edit OFF.", "info");
  }
}

function saveInPageEdits() {
  const docContainer = document.getElementById("doc-render-target");
  if (!docContainer) return;

  const editedHtml = docContainer.innerHTML;
  localStorage.setItem(`custom_doc_html_${currentDocKey}`, editedHtml);
  showToast(`In-page changes for "${currentDocKey}" saved to browser storage!`, "success");
}

function resetCurrentDocument() {
  localStorage.removeItem(`custom_doc_html_${currentDocKey}`);
  delete customDocuments[currentDocKey];
  localStorage.setItem("msc_custom_documents", JSON.stringify(customDocuments));
  renderDocument(currentDocKey);
  showToast(`Reset "${currentDocKey}" to official university original!`, "info");
}

// =========================================================================
// 🎛️ STUDENT DEVELOPER STUDIO MODAL CONTROLLER
// =========================================================================

function openDevStudio(targetTab = "tab-dev-docs") {
  const modal = document.getElementById("dev-studio-modal");
  if (!modal) return;

  modal.classList.remove("hidden");
  switchStudioTab(targetTab);
  updateStudioStats();
}

function closeDevStudio() {
  const modal = document.getElementById("dev-studio-modal");
  if (modal) modal.classList.add("hidden");
}

function switchStudioTab(tabId) {
  // Update Tab buttons
  document.querySelectorAll(".dev-tab-btn").forEach(btn => {
    if (btn.getAttribute("data-tab") === tabId) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  // Update Tab panels
  document.querySelectorAll(".dev-tab-content").forEach(panel => {
    if (panel.id === tabId) {
      panel.classList.remove("hidden");
    } else {
      panel.classList.add("hidden");
    }
  });

  // Trigger load for specific tab
  if (tabId === "tab-dev-docs") {
    const sel = document.getElementById("dev-doc-selector");
    loadDocInStudio(sel ? sel.value : currentDocKey);
  } else if (tabId === "tab-dev-viva") {
    renderVivaStudioList();
  } else if (tabId === "tab-dev-slides") {
    renderSlidesStudioList();
  } else if (tabId === "tab-dev-glossary") {
    renderGlossaryStudioList();
  } else if (tabId === "tab-dev-backup") {
    updateStudioStats();
  }
}

function updateStudioStats() {
  const statDocs = document.getElementById("stat-custom-docs");
  const statViva = document.getElementById("stat-custom-viva");
  const statSlides = document.getElementById("stat-custom-slides");
  const statGlossary = document.getElementById("stat-custom-glossary");

  const badgeDocs = document.getElementById("badge-doc-count");
  const badgeViva = document.getElementById("badge-viva-count");
  const badgeSlides = document.getElementById("badge-slides-count");
  const badgeGlossary = document.getElementById("badge-glossary-count");

  const customDocCount = Object.keys(customDocuments).length;
  const vivaTotal = (customViva.project_viva?.length || 0) + (customViva.seminar_viva?.length || 0);
  const slidesTotal = (customSlides.project_slides?.length || 0) + (customSlides.seminar_slides?.length || 0);
  const glossaryTotal = customGlossary?.length || 0;

  if (statDocs) statDocs.textContent = customDocCount;
  if (statViva) statViva.textContent = vivaTotal;
  if (statSlides) statSlides.textContent = slidesTotal;
  if (statGlossary) statGlossary.textContent = glossaryTotal;

  if (badgeDocs) badgeDocs.textContent = "11";
  if (badgeViva) badgeViva.textContent = vivaTotal;
  if (badgeSlides) badgeSlides.textContent = slidesTotal;
  if (badgeGlossary) badgeGlossary.textContent = glossaryTotal;

  const totalGlossaryBadge = document.getElementById("dev-glossary-total-badge");
  if (totalGlossaryBadge) totalGlossaryBadge.textContent = `${glossaryTotal} Terms Active`;
}

// -------------------------------------------------------------------------
// TAB 1: 📝 DOCUMENT & THESIS STUDIO
// -------------------------------------------------------------------------

function loadDocInStudio(docKey) {
  const textarea = document.getElementById("dev-doc-editor-textarea");
  const preview = document.getElementById("dev-doc-live-preview");
  const charCount = document.getElementById("dev-doc-char-count");
  const statusBadge = document.getElementById("dev-doc-status-badge");
  const selector = document.getElementById("dev-doc-selector");

  if (!textarea || !preview) return;
  if (selector && selector.value !== docKey) selector.value = docKey;

  const raw = getCustomDocumentMarkdown(docKey);
  textarea.value = raw;
  if (charCount) charCount.textContent = `${raw.length.toLocaleString()} characters`;

  if (statusBadge) {
    if (customDocuments[docKey]) {
      statusBadge.textContent = "✏️ Custom Modified";
      statusBadge.className = "text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300";
    } else {
      statusBadge.textContent = "Official PSOU Default";
      statusBadge.className = "text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200";
    }
  }

  // Update live preview
  preview.innerHTML = marked.parse(applyProfileToText(raw));
}

function saveDocFromStudio() {
  const selector = document.getElementById("dev-doc-selector");
  const textarea = document.getElementById("dev-doc-editor-textarea");
  if (!selector || !textarea) return;

  const docKey = selector.value;
  customDocuments[docKey] = textarea.value;
  localStorage.setItem("msc_custom_documents", JSON.stringify(customDocuments));

  // If currently active doc, re-render view
  if (currentDocKey === docKey) {
    renderDocument(docKey);
  }

  loadDocInStudio(docKey);
  updateStudioStats();
  showToast(`Document "${docKey}" successfully saved to browser storage!`, "success");
}

function resetDocFromStudio() {
  const selector = document.getElementById("dev-doc-selector");
  if (!selector) return;

  const docKey = selector.value;
  delete customDocuments[docKey];
  localStorage.removeItem(`custom_doc_html_${docKey}`);
  localStorage.setItem("msc_custom_documents", JSON.stringify(customDocuments));

  if (currentDocKey === docKey) {
    renderDocument(docKey);
  }

  loadDocInStudio(docKey);
  updateStudioStats();
  showToast(`Document "${docKey}" reset to university original baseline.`, "info");
}

function copyDocMarkdown() {
  const textarea = document.getElementById("dev-doc-editor-textarea");
  if (textarea) {
    navigator.clipboard.writeText(textarea.value).then(() => {
      showToast("Markdown copied to clipboard!", "success");
    }).catch(() => {
      showToast("Unable to copy to clipboard.", "error");
    });
  }
}

function insertSnippetIntoDoc(snippetType) {
  const textarea = document.getElementById("dev-doc-editor-textarea");
  if (!textarea) return;

  let snippet = "";
  if (snippetType === "objective") {
    snippet = `\n\n### Objective 6 — [Title: Custom Scalability & Performance Objective]\n* **Specific Engineering Activity**: Develop and validate [insert technical feature] utilizing [technology].\n* **Mathematical / Empirical SLA**: Achieve latency < 1.0ms and sustain 1,000 concurrent transactions with zero data loss.\n`;
  } else if (snippetType === "table") {
    snippet = `\n\n| Parameter / Metric | Traditional Cloud Architecture | SSR ONE AI Offline-First | Performance Gain |\n| :--- | :--- | :--- | :---: |\n| Median UI Latency | 142.3 ms | 0.38 ms | 99.7% Faster |\n| Network Outage Operation | 0% (Locks Terminal) | 100% (Continuous Local Writes) | Infinite |\n| Multi-Tenant Leakage Risk | Application-layer WHERE filter | PostgreSQL Kernel RLS | Mathematically Zero |\n`;
  } else if (snippetType === "code") {
    snippet = `\n\n\`\`\`python\n@app.post("/api/v1/pos/orders", status_code=201)\nasync def submit_order(\n    order_payload: OrderCreateSchema,\n    session: AsyncSession = Depends(get_tenant_db_session)\n):\n    """Asynchronous local-first order synchronization endpoint."""\n    # Commits with RFC4122 UUIDv4 idempotency key\n    return {"status": "synchronized", "committed_at": "0.38ms"}\n\`\`\`\n`;
  } else if (snippetType === "note") {
    snippet = `\n\n> [!NOTE]\n> **Examiner Technical Rationale**: This operational invariant enforces Eric Brewer's CAP Theorem AP (Availability & Partition Tolerance) mode during physical network blackouts.\n`;
  }

  const start = textarea.selectionStart || textarea.value.length;
  const end = textarea.selectionEnd || textarea.value.length;
  textarea.value = textarea.value.substring(0, start) + snippet + textarea.value.substring(end);
  textarea.selectionStart = textarea.selectionEnd = start + snippet.length;
  textarea.focus();

  // Trigger live preview update
  const preview = document.getElementById("dev-doc-live-preview");
  if (preview) preview.innerHTML = marked.parse(applyProfileToText(textarea.value));
  showToast(`Inserted ${snippetType} template snippet!`, "info");
}

// -------------------------------------------------------------------------
// TAB 2: ❓ VIVA VOCE Q&A MANAGER
// -------------------------------------------------------------------------

function renderVivaStudioList(query = "") {
  const container = document.getElementById("viva-questions-list");
  if (!container) return;

  const questions = getActiveViva(currentVivaTrack);
  const q = query.toLowerCase().trim();
  const filtered = questions.filter(
    item => item.question.toLowerCase().includes(q) ||
      (item.examinerGoal && item.examinerGoal.toLowerCase().includes(q)) ||
      item.answer.toLowerCase().includes(q) ||
      (item.category && item.category.toLowerCase().includes(q))
  );

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="p-8 text-center bg-white rounded-xl border border-slate-200">
        <span class="text-3xl block mb-2">🔍</span>
        <h4 class="text-sm font-bold text-slate-700">No Viva Questions Found</h4>
        <p class="text-xs text-slate-500 mt-1">Click "+ Add New Viva Question" above to add anticipated questions for this exam track.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map((item, index) => `
    <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-amber-300 transition" data-viva-id="${item.id}">
      <div class="flex items-start justify-between gap-3 mb-2">
        <div class="flex items-start space-x-2.5">
          <span class="px-2 py-0.5 bg-amber-100 text-amber-900 rounded font-mono font-bold text-xs shrink-0 mt-0.5">Q${index + 1}</span>
          <div>
            <h4 class="text-sm font-bold text-blue-950 font-heading">"${item.question}"</h4>
            ${item.category ? `<span class="inline-block mt-1 text-[10px] font-semibold bg-blue-50 text-blue-800 px-2 py-0.2 rounded border border-blue-200">${item.category}</span>` : ''}
          </div>
        </div>

        <div class="flex items-center space-x-1 shrink-0">
          <button class="btn-edit-viva p-1.5 text-blue-700 hover:bg-blue-50 rounded-md transition" data-id="${item.id}" title="Edit Question">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
          </button>
          <button class="btn-move-viva-up p-1.5 text-slate-500 hover:bg-slate-100 rounded-md transition" data-id="${item.id}" data-dir="-1" title="Move Up">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path></svg>
          </button>
          <button class="btn-move-viva-down p-1.5 text-slate-500 hover:bg-slate-100 rounded-md transition" data-id="${item.id}" data-dir="1" title="Move Down">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
          </button>
          <button class="btn-delete-viva p-1.5 text-red-600 hover:bg-red-50 rounded-md transition" data-id="${item.id}" title="Delete Question">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
          </button>
        </div>
      </div>

      ${item.examinerGoal ? `
        <div class="mb-2 bg-amber-50/70 p-2.5 rounded-lg border border-amber-200 text-xs text-amber-950">
          <strong class="text-amber-900 block mb-0.5">🎯 Examiner's Hidden Goal / Conceptual Test:</strong>
          ${item.examinerGoal}
        </div>
      ` : ''}

      <div class="bg-slate-50 p-3 rounded-lg border border-slate-200/80 text-xs text-slate-700 leading-relaxed font-sans">
        <strong class="text-slate-900 block mb-1">🛡️ Candidate's Model Defense Answer:</strong>
        ${item.answer.replace(/^>\s*/gm, '')}
      </div>
    </div>
  `).join("");

  attachVivaCardListeners();
}

function attachVivaCardListeners() {
  document.querySelectorAll(".btn-edit-viva").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      openVivaForm(id);
    });
  });

  document.querySelectorAll(".btn-delete-viva").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      deleteVivaQuestion(id);
    });
  });

  document.querySelectorAll(".btn-move-viva-up, .btn-move-viva-down").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      const dir = parseInt(btn.getAttribute("data-dir"), 10);
      moveVivaQuestion(id, dir);
    });
  });
}

function openVivaForm(id = null) {
  const container = document.getElementById("viva-form-container");
  const title = document.getElementById("viva-form-title");
  const editIdInput = document.getElementById("viva-form-edit-id");
  const qInput = document.getElementById("viva-form-question");
  const catInput = document.getElementById("viva-form-category");
  const goalInput = document.getElementById("viva-form-goal");
  const ansInput = document.getElementById("viva-form-answer");

  if (!container) return;
  container.classList.remove("hidden");

  if (id) {
    const list = getActiveViva(currentVivaTrack);
    const item = list.find(q => q.id === id);
    if (item) {
      if (title) title.textContent = "Edit Viva Question";
      if (editIdInput) editIdInput.value = item.id;
      if (qInput) qInput.value = item.question;
      if (catInput) catInput.value = item.category || "";
      if (goalInput) goalInput.value = item.examinerGoal || "";
      if (ansInput) ansInput.value = item.answer.replace(/^>\s*/gm, '');
    }
  } else {
    if (title) title.textContent = "Add New Viva Question";
    if (editIdInput) editIdInput.value = "";
    if (qInput) qInput.value = "";
    if (catInput) catInput.value = "";
    if (goalInput) goalInput.value = "";
    if (ansInput) ansInput.value = "";
  }
  qInput?.focus();
}

function closeVivaForm() {
  const container = document.getElementById("viva-form-container");
  if (container) container.classList.add("hidden");
}

function saveVivaItem() {
  const editId = document.getElementById("viva-form-edit-id")?.value;
  const question = document.getElementById("viva-form-question")?.value.trim();
  const category = document.getElementById("viva-form-category")?.value.trim();
  const examinerGoal = document.getElementById("viva-form-goal")?.value.trim();
  const answer = document.getElementById("viva-form-answer")?.value.trim();

  if (!question || !answer) {
    showToast("Please provide both Question and Defending Answer.", "error");
    return;
  }

  const list = customViva[currentVivaTrack] || [];

  if (editId) {
    const idx = list.findIndex(q => q.id === editId);
    if (idx !== -1) {
      list[idx] = { ...list[idx], question, category, examinerGoal, answer };
    }
  } else {
    list.push({
      id: `viva_${Date.now()}`,
      question,
      category,
      examinerGoal,
      answer
    });
  }

  customViva[currentVivaTrack] = list;
  localStorage.setItem("msc_custom_viva", JSON.stringify(customViva));

  // Rebuild viva markdown and save into customDocuments
  const regeneratedMd = generateVivaMarkdown(currentVivaTrack, list);
  customDocuments[currentVivaTrack] = regeneratedMd;
  localStorage.setItem("msc_custom_documents", JSON.stringify(customDocuments));

  if (currentDocKey === currentVivaTrack) {
    renderDocument(currentDocKey);
  }

  closeVivaForm();
  renderVivaStudioList();
  updateStudioStats();
  showToast("Viva question saved & synced with live manual!", "success");
}

function deleteVivaQuestion(id) {
  const list = customViva[currentVivaTrack] || [];
  const idx = list.findIndex(q => q.id === id);
  if (idx === -1) return;

  if (!confirm(`Are you sure you want to delete Question ${idx + 1}?`)) return;

  list.splice(idx, 1);
  customViva[currentVivaTrack] = list;
  localStorage.setItem("msc_custom_viva", JSON.stringify(customViva));

  const regeneratedMd = generateVivaMarkdown(currentVivaTrack, list);
  customDocuments[currentVivaTrack] = regeneratedMd;
  localStorage.setItem("msc_custom_documents", JSON.stringify(customDocuments));

  if (currentDocKey === currentVivaTrack) {
    renderDocument(currentDocKey);
  }

  renderVivaStudioList();
  updateStudioStats();
  showToast("Question deleted from defense guide.", "info");
}

function moveVivaQuestion(id, direction) {
  const list = customViva[currentVivaTrack] || [];
  const idx = list.findIndex(q => q.id === id);
  if (idx === -1) return;

  const targetIdx = idx + direction;
  if (targetIdx < 0 || targetIdx >= list.length) return;

  const temp = list[idx];
  list[idx] = list[targetIdx];
  list[targetIdx] = temp;

  customViva[currentVivaTrack] = list;
  localStorage.setItem("msc_custom_viva", JSON.stringify(customViva));

  const regeneratedMd = generateVivaMarkdown(currentVivaTrack, list);
  customDocuments[currentVivaTrack] = regeneratedMd;
  localStorage.setItem("msc_custom_documents", JSON.stringify(customDocuments));

  if (currentDocKey === currentVivaTrack) renderDocument(currentDocKey);

  renderVivaStudioList();
}

// -------------------------------------------------------------------------
// TAB 3: 🎤 SLIDE DECKS & SPEECH SCRIPT STUDIO
// -------------------------------------------------------------------------

function renderSlidesStudioList() {
  const container = document.getElementById("slides-cards-list");
  if (!container) return;

  const slides = getActiveSlides(currentSlidesDeck);

  if (slides.length === 0) {
    container.innerHTML = `
      <div class="p-8 text-center bg-white rounded-xl border border-slate-200">
        <span class="text-3xl block mb-2">🎤</span>
        <h4 class="text-sm font-bold text-slate-700">No Slides Found</h4>
        <p class="text-xs text-slate-500 mt-1">Click "+ Add New Slide" to add slides to this presentation deck.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = slides.map((slide, index) => `
    <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-purple-300 transition" data-slide-idx="${index}">
      <div class="flex items-start justify-between gap-3 mb-2">
        <div class="flex items-start space-x-2.5">
          <span class="px-2 py-0.5 bg-purple-100 text-purple-900 rounded font-mono font-bold text-xs shrink-0 mt-0.5">Slide ${index + 1}</span>
          <h4 class="text-sm font-bold text-blue-950 font-heading">${cleanBulletText(slide.title)}</h4>
        </div>

        <div class="flex items-center space-x-1 shrink-0">
          <button class="btn-test-single-slide p-1.5 text-amber-600 hover:bg-amber-50 rounded-md transition" data-idx="${index}" title="View in Slide Player">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </button>
          <button class="btn-edit-slide p-1.5 text-blue-700 hover:bg-blue-50 rounded-md transition" data-idx="${index}" title="Edit Slide">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
          </button>
          <button class="btn-move-slide-up p-1.5 text-slate-500 hover:bg-slate-100 rounded-md transition" data-idx="${index}" data-dir="-1" title="Move Up">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path></svg>
          </button>
          <button class="btn-move-slide-down p-1.5 text-slate-500 hover:bg-slate-100 rounded-md transition" data-idx="${index}" data-dir="1" title="Move Down">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
          </button>
          <button class="btn-delete-slide p-1.5 text-red-600 hover:bg-red-50 rounded-md transition" data-idx="${index}" title="Delete Slide">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
          </button>
        </div>
      </div>

      <!-- Bullets List -->
      <div class="mb-3 space-y-1">
        ${(slide.bullets || []).map(b => `
          <div class="text-xs text-slate-700 flex items-start space-x-1.5">
            <span class="text-amber-500 font-bold">•</span>
            <span>${cleanBulletText(b)}</span>
          </div>
        `).join("")}
      </div>

      <!-- Speech Script -->
      ${slide.speech ? `
        <div class="bg-amber-50/70 p-2.5 rounded-lg border border-amber-200 text-xs text-slate-800 leading-relaxed italic">
          <strong class="text-amber-900 not-italic block mb-0.5">🎤 What to say to Examiners (Speech Script):</strong>
          "${cleanBulletText(slide.speech.replace(/^"|"$/g, ''))}"
        </div>
      ` : ''}
    </div>
  `).join("");

  attachSlideCardListeners();
}

function attachSlideCardListeners() {
  document.querySelectorAll(".btn-edit-slide").forEach(btn => {
    btn.addEventListener("click", () => {
      const idx = parseInt(btn.getAttribute("data-idx"), 10);
      openSlideForm(idx);
    });
  });

  document.querySelectorAll(".btn-delete-slide").forEach(btn => {
    btn.addEventListener("click", () => {
      const idx = parseInt(btn.getAttribute("data-idx"), 10);
      deleteSlide(idx);
    });
  });

  document.querySelectorAll(".btn-move-slide-up, .btn-move-slide-down").forEach(btn => {
    btn.addEventListener("click", () => {
      const idx = parseInt(btn.getAttribute("data-idx"), 10);
      const dir = parseInt(btn.getAttribute("data-dir"), 10);
      moveSlide(idx, dir);
    });
  });

  document.querySelectorAll(".btn-test-single-slide").forEach(btn => {
    btn.addEventListener("click", () => {
      const idx = parseInt(btn.getAttribute("data-idx"), 10);
      closeDevStudio();
      currentDocKey = currentSlidesDeck;
      renderDocument(currentDocKey);
      openPresentationMode();
      currentSlideIndex = idx;
      renderCurrentSlide();
    });
  });
}

function openSlideForm(index = null) {
  const container = document.getElementById("slide-form-container");
  const title = document.getElementById("slide-form-title");
  const editIdxInput = document.getElementById("slide-form-edit-index");
  const titleInput = document.getElementById("slide-form-title-input");
  const bulletsInput = document.getElementById("slide-form-bullets");
  const speechInput = document.getElementById("slide-form-speech");

  if (!container) return;
  container.classList.remove("hidden");

  if (index !== null && index >= 0) {
    const slides = getActiveSlides(currentSlidesDeck);
    const slide = slides[index];
    if (slide) {
      if (title) title.textContent = `Edit Slide ${index + 1}`;
      if (editIdxInput) editIdxInput.value = index;
      if (titleInput) titleInput.value = slide.title;
      if (bulletsInput) bulletsInput.value = (slide.bullets || []).join("\n");
      if (speechInput) speechInput.value = (slide.speech || "").replace(/^"|"$/g, '');
    }
  } else {
    if (title) title.textContent = "Add New Presentation Slide";
    if (editIdxInput) editIdxInput.value = "-1";
    if (titleInput) titleInput.value = "";
    if (bulletsInput) bulletsInput.value = "";
    if (speechInput) speechInput.value = "";
  }
  titleInput?.focus();
}

function closeSlideForm() {
  const container = document.getElementById("slide-form-container");
  if (container) container.classList.add("hidden");
}

function saveSlideItem() {
  const editIdx = parseInt(document.getElementById("slide-form-edit-index")?.value || "-1", 10);
  const title = document.getElementById("slide-form-title-input")?.value.trim();
  const bulletsText = document.getElementById("slide-form-bullets")?.value.trim();
  const speech = document.getElementById("slide-form-speech")?.value.trim();

  if (!title) {
    showToast("Please enter a slide title.", "error");
    return;
  }

  const bullets = bulletsText ? bulletsText.split("\n").map(b => b.trim()).filter(Boolean) : [];
  const list = customSlides[currentSlidesDeck] || [];

  const slideObj = { title, bullets, speech };

  if (editIdx >= 0 && editIdx < list.length) {
    list[editIdx] = slideObj;
  } else {
    list.push(slideObj);
  }

  customSlides[currentSlidesDeck] = list;
  localStorage.setItem("msc_custom_slides", JSON.stringify(customSlides));

  if (window.ACADEMIC_DATA && window.ACADEMIC_DATA[currentSlidesDeck]) {
    window.ACADEMIC_DATA[currentSlidesDeck].parsed_slides = list;
  }

  // Regenerate slide document markdown
  const regeneratedMd = generateSlidesMarkdown(currentSlidesDeck, list);
  customDocuments[currentSlidesDeck] = regeneratedMd;
  localStorage.setItem("msc_custom_documents", JSON.stringify(customDocuments));

  if (currentDocKey === currentSlidesDeck) {
    renderDocument(currentDocKey);
    // If presentation modal is active, update
    const presModal = document.getElementById("presentation-modal");
    if (presModal && !presModal.classList.contains("hidden")) {
      currentSlidesData = list;
      renderCurrentSlide();
    }
  }

  closeSlideForm();
  renderSlidesStudioList();
  updateStudioStats();
  showToast("Slide deck updated successfully!", "success");
}

function deleteSlide(index) {
  const list = customSlides[currentSlidesDeck] || [];
  if (index < 0 || index >= list.length) return;

  if (!confirm(`Are you sure you want to delete Slide ${index + 1}?`)) return;

  list.splice(index, 1);
  customSlides[currentSlidesDeck] = list;
  localStorage.setItem("msc_custom_slides", JSON.stringify(customSlides));

  if (window.ACADEMIC_DATA && window.ACADEMIC_DATA[currentSlidesDeck]) {
    window.ACADEMIC_DATA[currentSlidesDeck].parsed_slides = list;
  }

  const regeneratedMd = generateSlidesMarkdown(currentSlidesDeck, list);
  customDocuments[currentSlidesDeck] = regeneratedMd;
  localStorage.setItem("msc_custom_documents", JSON.stringify(customDocuments));

  if (currentDocKey === currentSlidesDeck) renderDocument(currentDocKey);

  renderSlidesStudioList();
  updateStudioStats();
  showToast("Slide removed from presentation.", "info");
}

function moveSlide(index, direction) {
  const list = customSlides[currentSlidesDeck] || [];
  const targetIdx = index + direction;
  if (targetIdx < 0 || targetIdx >= list.length) return;

  const temp = list[index];
  list[index] = list[targetIdx];
  list[targetIdx] = temp;

  customSlides[currentSlidesDeck] = list;
  localStorage.setItem("msc_custom_slides", JSON.stringify(customSlides));

  if (window.ACADEMIC_DATA && window.ACADEMIC_DATA[currentSlidesDeck]) {
    window.ACADEMIC_DATA[currentSlidesDeck].parsed_slides = list;
  }

  const regeneratedMd = generateSlidesMarkdown(currentSlidesDeck, list);
  customDocuments[currentSlidesDeck] = regeneratedMd;
  localStorage.setItem("msc_custom_documents", JSON.stringify(customDocuments));

  if (currentDocKey === currentSlidesDeck) renderDocument(currentDocKey);

  renderSlidesStudioList();
}

// -------------------------------------------------------------------------
// TAB 4: 📖 कठिन शब्दार्थ (GLOSSARY) MANAGER
// -------------------------------------------------------------------------

function renderGlossaryStudioList(query = "") {
  const container = document.getElementById("glossary-cards-list");
  if (!container) return;

  const terms = getActiveGlossary();
  const q = query.toLowerCase().trim();
  const filtered = terms.filter(item =>
    item.term.toLowerCase().includes(q) ||
    item.definition.toLowerCase().includes(q) ||
    item.hindiMeaning.toLowerCase().includes(q) ||
    (item.pronounce && item.pronounce.toLowerCase().includes(q))
  );

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="p-8 text-center bg-white rounded-xl border border-slate-200">
        <span class="text-3xl block mb-2">📖</span>
        <h4 class="text-sm font-bold text-slate-700">No Hard Words Found</h4>
        <p class="text-xs text-slate-500 mt-1">Click "+ Add New Hard Word" to add technical vocabulary with Hindi meaning.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map((item) => `
    <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-amber-300 transition">
      <div class="flex items-start justify-between gap-3 mb-2">
        <div>
          <div class="flex items-center space-x-2">
            <h4 class="text-sm font-bold text-blue-950 font-heading">${item.term}</h4>
            <span class="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-blue-50 text-blue-800 border border-blue-200">${item.category || 'General'}</span>
          </div>
          ${item.pronounce ? `<span class="text-xs text-amber-700 font-semibold font-mono">उच्चारण: ${item.pronounce}</span>` : ''}
        </div>

        <div class="flex items-center space-x-1 shrink-0">
          <button class="btn-edit-glossary p-1.5 text-blue-700 hover:bg-blue-50 rounded-md transition" data-id="${item.id}" title="Edit Term">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
          </button>
          <button class="btn-delete-glossary p-1.5 text-red-600 hover:bg-red-50 rounded-md transition" data-id="${item.id}" title="Delete Term">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
          </button>
        </div>
      </div>

      <div class="mb-2 text-xs text-slate-600 leading-relaxed">
        <strong class="text-slate-800">English Definition:</strong> ${item.definition}
      </div>

      <div class="bg-amber-50/70 p-2.5 rounded-lg border border-amber-200 text-xs text-amber-950 mb-2">
        <strong class="text-amber-900 block mb-0.5">🇮🇳 सरल हिंदी अर्थ:</strong>
        ${item.hindiMeaning}
      </div>

      ${item.example ? `
        <div class="bg-slate-50 p-2 rounded text-[11px] text-slate-600 border border-slate-200">
          <strong class="text-slate-800">💡 असली दुनिया का उदाहरण:</strong> ${item.example}
        </div>
      ` : ''}
    </div>
  `).join("");

  attachGlossaryCardListeners();
}

function attachGlossaryCardListeners() {
  document.querySelectorAll(".btn-edit-glossary").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      openGlossaryForm(id);
    });
  });

  document.querySelectorAll(".btn-delete-glossary").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      deleteGlossaryItem(id);
    });
  });
}

function openGlossaryForm(id = null) {
  const container = document.getElementById("glossary-form-container");
  const title = document.getElementById("glossary-form-title");
  const editId = document.getElementById("glossary-form-edit-id");
  const termInput = document.getElementById("glossary-form-term");
  const pronInput = document.getElementById("glossary-form-pronounce");
  const catInput = document.getElementById("glossary-form-category");
  const defInput = document.getElementById("glossary-form-def");
  const hindiInput = document.getElementById("glossary-form-hindi");
  const exInput = document.getElementById("glossary-form-example");

  if (!container) return;
  container.classList.remove("hidden");

  if (id) {
    const item = customGlossary.find(g => g.id === id);
    if (item) {
      if (title) title.textContent = "Edit Technical Term";
      if (editId) editId.value = item.id;
      if (termInput) termInput.value = item.term;
      if (pronInput) pronInput.value = item.pronounce || "";
      if (catInput) catInput.value = item.category || "";
      if (defInput) defInput.value = item.definition || "";
      if (hindiInput) hindiInput.value = item.hindiMeaning || "";
      if (exInput) exInput.value = item.example || "";
    }
  } else {
    if (title) title.textContent = "Add New Technical Hard Word";
    if (editId) editId.value = "";
    if (termInput) termInput.value = "";
    if (pronInput) pronInput.value = "";
    if (catInput) catInput.value = "";
    if (defInput) defInput.value = "";
    if (hindiInput) hindiInput.value = "";
    if (exInput) exInput.value = "";
  }
  termInput?.focus();
}

function closeGlossaryForm() {
  const container = document.getElementById("glossary-form-container");
  if (container) container.classList.add("hidden");
}

function saveGlossaryItem() {
  const editId = document.getElementById("glossary-form-edit-id")?.value;
  const term = document.getElementById("glossary-form-term")?.value.trim();
  const pronounce = document.getElementById("glossary-form-pronounce")?.value.trim();
  const category = document.getElementById("glossary-form-category")?.value.trim() || "Computer Science";
  const definition = document.getElementById("glossary-form-def")?.value.trim();
  const hindiMeaning = document.getElementById("glossary-form-hindi")?.value.trim();
  const example = document.getElementById("glossary-form-example")?.value.trim();

  if (!term || !definition || !hindiMeaning) {
    showToast("Please provide Term, English Definition, and Hindi Meaning.", "error");
    return;
  }

  if (editId) {
    const idx = customGlossary.findIndex(g => g.id === editId);
    if (idx !== -1) {
      customGlossary[idx] = { id: editId, term, pronounce, category, definition, hindiMeaning, example };
    }
  } else {
    customGlossary.unshift({
      id: `glossary_${Date.now()}`,
      term,
      pronounce,
      category,
      definition,
      hindiMeaning,
      example
    });
  }

  localStorage.setItem("msc_custom_glossary", JSON.stringify(customGlossary));

  closeGlossaryForm();
  renderGlossaryStudioList();
  updateStudioStats();
  showToast("Technical word added to viva dictionary!", "success");
}

function deleteGlossaryItem(id) {
  const idx = customGlossary.findIndex(g => g.id === id);
  if (idx === -1) return;

  if (!confirm(`Are you sure you want to delete "${customGlossary[idx].term}"?`)) return;

  customGlossary.splice(idx, 1);
  localStorage.setItem("msc_custom_glossary", JSON.stringify(customGlossary));

  renderGlossaryStudioList();
  updateStudioStats();
  showToast("Word removed from dictionary.", "info");
}

// -------------------------------------------------------------------------
// TAB 5: 💾 BACKUP, RESTORE & FACTORY RESET
// -------------------------------------------------------------------------

function exportProjectBackup() {
  const backupData = {
    app: "SSR ONE AI Academic Portfolio Studio",
    university: "Jagat Guru Nanak Dev Punjab State Open University (JGND PSOU), Patiala",
    student: currentProfile,
    exportedAt: new Date().toISOString(),
    version: "2.0.0",
    customDocuments,
    customViva,
    customSlides,
    customGlossary
  };

  const jsonString = JSON.stringify(backupData, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const cleanName = currentProfile.studentName.replace(/\s+/g, '_');
  const fileName = `${cleanName}_MSCCS_Academic_Studio_Backup.json`;

  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  showToast(`Backup exported successfully as ${fileName}!`, "success");
}

function importProjectBackup(file) {
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      if (!data || typeof data !== "object") throw new Error("Invalid backup JSON.");

      if (data.student) {
        currentProfile = { ...DEFAULT_PROFILE, ...data.student };
        localStorage.setItem("msc_cs_profile", JSON.stringify(currentProfile));
        updateProfileBadges();
      }

      if (data.customDocuments) {
        customDocuments = data.customDocuments;
        localStorage.setItem("msc_custom_documents", JSON.stringify(customDocuments));
      }

      if (data.customViva) {
        customViva = data.customViva;
        localStorage.setItem("msc_custom_viva", JSON.stringify(customViva));
      }

      if (data.customSlides) {
        customSlides = data.customSlides;
        localStorage.setItem("msc_custom_slides", JSON.stringify(customSlides));
        if (window.ACADEMIC_DATA) {
          if (customSlides.project_slides) window.ACADEMIC_DATA.project_slides.parsed_slides = customSlides.project_slides;
          if (customSlides.seminar_slides) window.ACADEMIC_DATA.seminar_slides.parsed_slides = customSlides.seminar_slides;
        }
      }

      if (data.customGlossary) {
        customGlossary = data.customGlossary;
        localStorage.setItem("msc_custom_glossary", JSON.stringify(customGlossary));
      }

      renderDocument(currentDocKey);
      updateStudioStats();
      showToast("Backup restored successfully! All customizations loaded.", "success");
    } catch (err) {
      showToast("Failed to parse backup file: " + err.message, "error");
    }
  };
  reader.readAsText(file);
}

function factoryResetAll() {
  const confirmed = confirm(
    "⚠️ DANGER ZONE: FACTORY RESET\n\nThis will erase all custom changes made in Developer Mode and restore the pristine original JGND PSOU university text, slides, and viva Q&A.\n\nAre you sure you want to reset everything to baseline?"
  );

  if (!confirmed) return;

  localStorage.removeItem("msc_custom_documents");
  localStorage.removeItem("msc_custom_viva");
  localStorage.removeItem("msc_custom_slides");
  localStorage.removeItem("msc_custom_glossary");

  // Remove any in-page html keys
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith("custom_doc_html_")) {
      localStorage.removeItem(key);
    }
  });

  loadCustomStores();
  renderDocument(currentDocKey);
  updateStudioStats();
  showToast("All academic deliverables reset to university original baseline!", "info");
}

// =========================================================================
// 🎤 FULLSCREEN PRESENTATION MODE CONTROLLER
// =========================================================================

function openPresentationMode() {
  const slides = getActiveSlides(currentDocKey);
  if (!slides || slides.length === 0) {
    showToast("No presentation slides available for this document.", "error");
    return;
  }

  currentSlidesData = slides;
  currentSlideIndex = 0;

  const modal = document.getElementById("presentation-modal");
  if (modal) {
    modal.classList.remove("hidden");
    renderCurrentSlide();
  }
}

function closePresentationMode() {
  const modal = document.getElementById("presentation-modal");
  if (modal) modal.classList.add("hidden");
}

function renderCurrentSlide() {
  const slide = currentSlidesData[currentSlideIndex];
  if (!slide) return;

  const titleEl = document.getElementById("pres-slide-title");
  const contentEl = document.getElementById("pres-slide-content");
  const speechEl = document.getElementById("pres-slide-speech");
  const counterEl = document.getElementById("pres-slide-counter");
  const progressEl = document.getElementById("pres-slide-progress");

  if (titleEl) titleEl.textContent = cleanBulletText(slide.title);
  if (counterEl) counterEl.textContent = `Slide ${currentSlideIndex + 1} of ${currentSlidesData.length}`;

  if (progressEl) {
    const pct = ((currentSlideIndex + 1) / currentSlidesData.length) * 100;
    progressEl.style.width = `${pct}%`;
  }

  // Slide 1: University Title Card Layout
  if (currentSlideIndex === 0) {
    contentEl.innerHTML = `
      <div class="h-full flex flex-col items-center justify-center text-center p-4">
        <span class="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
          Jagat Guru Nanak Dev Punjab State Open University, Patiala
        </span>
        <h1 class="text-xl md:text-2xl font-extrabold text-blue-950 max-w-2xl leading-tight mb-4 font-heading">
          ${currentDocKey === "project_slides"
            ? "Design and Implementation of a High-Throughput, Offline-First, Multi-Tenant SaaS Enterprise POS Architecture with Integrated AI Copilot and Computer Vision OCR"
            : "Architectural Patterns for Offline-First Distributed Web Applications: Balancing Zero-Latency User Experience with Eventual Consistency"}
        </h1>
        <div class="grid grid-cols-2 gap-4 w-full max-w-xl text-left mt-2">
          <div class="bg-blue-50/80 p-3 rounded-xl border border-blue-100">
            <span class="text-[10px] font-bold uppercase text-blue-800 tracking-wider block">Candidate Particulars</span>
            <span class="text-sm font-bold text-blue-950 block mt-0.5">${currentProfile.studentName}</span>
            <span class="text-xs text-slate-600 font-mono block">Roll: ${currentProfile.rollNumber}</span>
          </div>
          <div class="bg-amber-50/80 p-3 rounded-xl border border-amber-200">
            <span class="text-[10px] font-bold uppercase text-amber-800 tracking-wider block">Faculty Guide</span>
            <span class="text-sm font-bold text-slate-900 block mt-0.5">${currentProfile.guideName}</span>
            <span class="text-xs text-slate-600 block">Dept. of Computer Science</span>
          </div>
        </div>
      </div>
    `;
  } else {
    contentEl.innerHTML = (slide.bullets || [])
      .map((b) => {
        let clean = cleanBulletText(b);
        let parts = clean.split(/:\s*(.+)/);
        if (parts.length > 1 && parts[0].length < 30) {
          return `
            <div class="flex items-start space-x-2.5 mb-3 bg-slate-50/80 p-2.5 rounded-lg border border-slate-200/80">
              <span class="px-2 py-0.5 bg-blue-100 text-blue-900 rounded text-xs font-bold shrink-0 mt-0.5">${parts[0]}:</span>
              <span class="text-slate-800 text-sm leading-relaxed">${parts[1]}</span>
            </div>
          `;
        }
        return `
          <div class="flex items-start space-x-2.5 mb-2.5 p-1.5">
            <span class="text-amber-500 font-bold text-base mt-0.5">•</span>
            <span class="text-slate-800 text-sm md:text-base leading-relaxed">${clean}</span>
          </div>
        `;
      })
      .join("");
  }

  // Spoken Speech Script
  if (speechEl) {
    speechEl.innerHTML = slide.speech
      ? `<p class="italic text-slate-800 text-sm leading-relaxed font-serif bg-amber-50/90 p-4 rounded-xl border border-amber-200 shadow-sm">"${cleanBulletText(slide.speech)}"</p>`
      : `<p class="text-slate-400 italic text-sm p-4">No spoken notes attached for this slide.</p>`;
  }
}

function nextSlide() {
  if (currentSlideIndex < currentSlidesData.length - 1) {
    currentSlideIndex++;
    renderCurrentSlide();
  }
}

function prevSlide() {
  if (currentSlideIndex > 0) {
    currentSlideIndex--;
    renderCurrentSlide();
  }
}

// =========================================================================
// 📖 GLOSSARY MODAL SETUP
// =========================================================================

function setupGlossaryModal() {
  const modal = document.getElementById("glossary-modal");
  const listEl = document.getElementById("glossary-list-target");
  const searchInput = document.getElementById("glossary-search");
  const countEl = document.getElementById("glossary-count");

  function renderList(query = "") {
    if (!listEl) return;
    const q = query.toLowerCase().trim();
    const glossary = getActiveGlossary();
    const filtered = glossary.filter(
      (item) =>
        item.term.toLowerCase().includes(q) ||
        item.definition.toLowerCase().includes(q) ||
        item.hindiMeaning.toLowerCase().includes(q)
    );

    if (countEl) countEl.textContent = `${filtered.length} terms found`;

    listEl.innerHTML = filtered
      .map(
        (item) => `
      <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-blue-300 transition">
        <div class="flex items-start justify-between gap-2 mb-2">
          <div>
            <h4 class="text-base font-bold text-blue-950 font-heading">${item.term}</h4>
            ${item.pronounce ? `<span class="text-xs text-amber-600 font-semibold font-mono">उच्चारण: ${item.pronounce}</span>` : ''}
          </div>
          <span class="px-2 py-0.5 bg-blue-50 text-blue-800 border border-blue-200 text-[10px] font-bold rounded-full">${item.category || 'CS'}</span>
        </div>
        
        <div class="bg-amber-50/70 p-3 rounded-lg border border-amber-200/80 mb-2">
          <span class="text-[11px] font-bold uppercase tracking-wider text-amber-900 block mb-0.5">🇮🇳 सरल हिंदी अर्थ:</span>
          <p class="text-xs text-slate-800 leading-relaxed font-sans">${item.hindiMeaning}</p>
        </div>

        ${item.example ? `
          <div class="text-xs text-slate-600 bg-slate-50 p-2 rounded border border-slate-100">
            <span class="font-semibold text-slate-800">💡 असली दुनिया का उदाहरण:</span> ${item.example}
          </div>
        ` : ''}
      </div>
    `
      )
      .join("");
  }

  document.getElementById("btn-open-glossary")?.addEventListener("click", () => {
    if (modal) {
      modal.classList.remove("hidden");
      renderList();
    }
  });

  document.getElementById("btn-close-glossary")?.addEventListener("click", () => {
    if (modal) modal.classList.add("hidden");
  });

  document.getElementById("glossary-btn-add-word")?.addEventListener("click", () => {
    if (modal) modal.classList.add("hidden");
    openDevStudio("tab-dev-glossary");
    openGlossaryForm();
  });

  searchInput?.addEventListener("input", (e) => {
    renderList(e.target.value);
  });
}

// Global App Toast Notification
function showToast(msg, type = "info") {
  const toast = document.getElementById("app-toast");
  if (!toast) return;

  toast.textContent = msg;
  toast.classList.remove("hidden", "bg-emerald-600", "bg-blue-600", "bg-red-600", "bg-amber-600");

  if (type === "success") toast.classList.add("bg-emerald-600");
  else if (type === "error") toast.classList.add("bg-red-600");
  else if (type === "warning") toast.classList.add("bg-amber-600");
  else toast.classList.add("bg-blue-600");

  setTimeout(() => {
    toast.classList.add("hidden");
  }, 3500);
}

// =========================================================================
// 🎛️ DEVELOPER STUDIO EVENT WIRING
// =========================================================================

function setupDeveloperStudioEvents() {
  // Top Navbar & Dev Bar Triggers
  document.getElementById("btn-open-dev-studio")?.addEventListener("click", () => openDevStudio());
  document.getElementById("floating-dev-btn")?.addEventListener("click", () => openDevStudio());
  document.getElementById("btn-close-dev-studio")?.addEventListener("click", closeDevStudio);

  // Tab switching
  document.querySelectorAll("#dev-studio-tabs .dev-tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const tabId = btn.getAttribute("data-tab");
      switchStudioTab(tabId);
    });
  });

  // Tab 1: Document Studio Events
  const docSelector = document.getElementById("dev-doc-selector");
  docSelector?.addEventListener("change", (e) => {
    loadDocInStudio(e.target.value);
  });

  const textarea = document.getElementById("dev-doc-editor-textarea");
  textarea?.addEventListener("input", (e) => {
    const val = e.target.value;
    const charCount = document.getElementById("dev-doc-char-count");
    if (charCount) charCount.textContent = `${val.length.toLocaleString()} characters`;
    const preview = document.getElementById("dev-doc-live-preview");
    if (preview) preview.innerHTML = marked.parse(applyProfileToText(val));
  });

  document.getElementById("btn-save-doc-studio")?.addEventListener("click", saveDocFromStudio);
  document.getElementById("btn-reset-doc-studio")?.addEventListener("click", resetDocFromStudio);
  document.getElementById("btn-copy-doc-md")?.addEventListener("click", copyDocMarkdown);

  document.querySelectorAll(".btn-snippet").forEach(btn => {
    btn.addEventListener("click", () => {
      const snippet = btn.getAttribute("data-snippet");
      insertSnippetIntoDoc(snippet);
    });
  });

  // Tab 2: Viva Events
  document.getElementById("btn-viva-track-project")?.addEventListener("click", (e) => {
    currentVivaTrack = "project_viva";
    e.target.className = "px-3 py-1 rounded-md bg-white text-blue-950 shadow-xs font-bold";
    document.getElementById("btn-viva-track-seminar").className = "px-3 py-1 rounded-md text-slate-600 hover:text-slate-900";
    closeVivaForm();
    renderVivaStudioList();
  });

  document.getElementById("btn-viva-track-seminar")?.addEventListener("click", (e) => {
    currentVivaTrack = "seminar_viva";
    e.target.className = "px-3 py-1 rounded-md bg-white text-blue-950 shadow-xs font-bold";
    document.getElementById("btn-viva-track-project").className = "px-3 py-1 rounded-md text-slate-600 hover:text-slate-900";
    closeVivaForm();
    renderVivaStudioList();
  });

  document.getElementById("btn-show-add-viva")?.addEventListener("click", () => openVivaForm());
  document.getElementById("btn-cancel-viva-form")?.addEventListener("click", closeVivaForm);
  document.getElementById("btn-save-viva-item")?.addEventListener("click", saveVivaItem);
  document.getElementById("dev-viva-search")?.addEventListener("input", (e) => {
    renderVivaStudioList(e.target.value);
  });

  // Tab 3: Slides Events
  document.getElementById("btn-slides-track-project")?.addEventListener("click", (e) => {
    currentSlidesDeck = "project_slides";
    e.target.className = "px-3 py-1 rounded-md bg-white text-blue-950 shadow-xs font-bold";
    document.getElementById("btn-slides-track-seminar").className = "px-3 py-1 rounded-md text-slate-600 hover:text-slate-900";
    closeSlideForm();
    renderSlidesStudioList();
  });

  document.getElementById("btn-slides-track-seminar")?.addEventListener("click", (e) => {
    currentSlidesDeck = "seminar_slides";
    e.target.className = "px-3 py-1 rounded-md bg-white text-blue-950 shadow-xs font-bold";
    document.getElementById("btn-slides-track-project").className = "px-3 py-1 rounded-md text-slate-600 hover:text-slate-900";
    closeSlideForm();
    renderSlidesStudioList();
  });

  document.getElementById("btn-show-add-slide")?.addEventListener("click", () => openSlideForm());
  document.getElementById("btn-cancel-slide-form")?.addEventListener("click", closeSlideForm);
  document.getElementById("btn-save-slide-item")?.addEventListener("click", saveSlideItem);
  document.getElementById("btn-launch-presentation-from-studio")?.addEventListener("click", () => {
    closeDevStudio();
    currentDocKey = currentSlidesDeck;
    renderDocument(currentDocKey);
    openPresentationMode();
  });

  // Edit slide button from presentation modal
  document.getElementById("pres-btn-edit-slide")?.addEventListener("click", () => {
    closePresentationMode();
    openDevStudio("tab-dev-slides");
    openSlideForm(currentSlideIndex);
  });

  // Tab 4: Glossary Events
  document.getElementById("btn-show-add-glossary")?.addEventListener("click", () => openGlossaryForm());
  document.getElementById("btn-cancel-glossary-form")?.addEventListener("click", closeGlossaryForm);
  document.getElementById("btn-save-glossary-item")?.addEventListener("click", saveGlossaryItem);
  document.getElementById("dev-glossary-search")?.addEventListener("input", (e) => {
    renderGlossaryStudioList(e.target.value);
  });

  // Tab 5: Backup & Reset Events
  document.getElementById("btn-export-backup-json")?.addEventListener("click", exportProjectBackup);

  const importFileInput = document.getElementById("input-import-backup-file");
  document.getElementById("btn-trigger-import-json")?.addEventListener("click", () => {
    importFileInput?.click();
  });

  importFileInput?.addEventListener("change", (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) importProjectBackup(file);
    e.target.value = "";
  });

  document.getElementById("btn-factory-reset-all")?.addEventListener("click", factoryResetAll);
}

// =========================================================================
// 🌐 SETUP EVENT LISTENERS
// =========================================================================

function setupEventListeners() {
  // Navigation sidebar clicks
  document.querySelectorAll(".nav-item").forEach((item) => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      const key = item.getAttribute("data-key");
      if (key) renderDocument(key);
    });
  });

  // Action Bar & Master PDF Buttons
  document.getElementById("btn-download-pdf")?.addEventListener("click", exportPDF);
  document.getElementById("btn-master-pdf")?.addEventListener("click", downloadMasterPDF);
  document.getElementById("btn-download-pptx")?.addEventListener("click", downloadPPTX);
  document.getElementById("btn-present-slides")?.addEventListener("click", openPresentationMode);
  document.getElementById("btn-print-doc")?.addEventListener("click", () => window.print());

  // Developer Mode Toolbar Listeners
  document.getElementById("btn-toggle-dev")?.addEventListener("click", toggleDeveloperMode);
  document.getElementById("btn-close-dev-bar")?.addEventListener("click", toggleDeveloperMode);
  document.getElementById("btn-toggle-inline-edit")?.addEventListener("click", toggleInlineEdit);
  document.getElementById("btn-save-dev-edits")?.addEventListener("click", saveInPageEdits);
  document.getElementById("btn-reset-dev-edits")?.addEventListener("click", resetCurrentDocument);

  // Presentation Mode Navigation
  document.getElementById("pres-btn-next")?.addEventListener("click", nextSlide);
  document.getElementById("pres-btn-prev")?.addEventListener("click", prevSlide);
  document.getElementById("pres-btn-close")?.addEventListener("click", closePresentationMode);

  // Toggle Speaker Notes Panel
  document.getElementById("btn-toggle-notes")?.addEventListener("click", () => {
    const sidePanel = document.getElementById("pres-speech-sidepanel");
    if (sidePanel) {
      isScriptPanelOpen = !isScriptPanelOpen;
      if (isScriptPanelOpen) {
        sidePanel.classList.remove("hidden");
      } else {
        sidePanel.classList.add("hidden");
      }
    }
  });

  // Keyboard Navigation
  document.addEventListener("keydown", (e) => {
    const presModal = document.getElementById("presentation-modal");
    if (presModal && !presModal.classList.contains("hidden")) {
      if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") {
        e.preventDefault();
        nextSlide();
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        prevSlide();
      } else if (e.key === "Escape") {
        closePresentationMode();
      }
      return;
    }

    const studioModal = document.getElementById("dev-studio-modal");
    if (studioModal && !studioModal.classList.contains("hidden")) {
      if (e.key === "Escape") {
        closeDevStudio();
      }
    }
  });

  // Profile Modal Setup
  const profileModal = document.getElementById("profile-modal");
  document.getElementById("btn-open-profile")?.addEventListener("click", () => {
    document.getElementById("input-student-name").value = currentProfile.studentName;
    document.getElementById("input-roll-number").value = currentProfile.rollNumber;
    document.getElementById("input-admission-cycle").value = currentProfile.admissionCycle;
    document.getElementById("input-study-centre").value = currentProfile.studyCentre;
    document.getElementById("input-guide-name").value = currentProfile.guideName;
    profileModal.classList.remove("hidden");
  });

  document.getElementById("btn-close-profile")?.addEventListener("click", () => {
    profileModal.classList.add("hidden");
  });

  document.getElementById("form-student-profile")?.addEventListener("submit", (e) => {
    e.preventDefault();
    saveProfile({
      studentName: document.getElementById("input-student-name").value.trim(),
      rollNumber: document.getElementById("input-roll-number").value.trim(),
      admissionCycle: document.getElementById("input-admission-cycle").value.trim(),
      studyCentre: document.getElementById("input-study-centre").value.trim(),
      guideName: document.getElementById("input-guide-name").value.trim(),
    });
    profileModal.classList.add("hidden");
    showToast("Profile details updated across all documents!", "success");
  });
}
