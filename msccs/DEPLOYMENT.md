# How to Deploy M.Sc. Computer Science Portal to Render (render.com)

This guide walks you through deploying your **M.Sc. Computer Science Academic Portal (`msccs`)** to **Render** completely free with automatic SSL (`https://`), global CDN caching, and 100% mobile responsiveness.

---

## 🚀 Option 1: Deploy as a Free Static Site (Recommended & Fastest)

Render offers **Free Static Sites** with unlimited bandwidth, custom domain support, and lightning-fast global CDN delivery.

### Step 1: Push Code to GitHub / GitLab
Ensure your latest `ssr_one_ai` repository is pushed to your GitHub or GitLab account:
```bash
git add .
git commit -m "feat(msccs): add Render deployment and mobile responsive UI"
git push origin main
```

### Step 2: Create a New Static Site on Render
1. Open [Render.com](https://render.com) and log in (or sign up with GitHub).
2. On your Render Dashboard, click the **New +** button in the top right.
3. Select **Static Site**.
4. Connect your GitHub repository (`ssr_one_ai`).

### Step 3: Configure Settings
Fill in the following exact settings:

| Setting Field | Value to Enter | Notes |
| :--- | :--- | :--- |
| **Name** | `msccs-sumit-singh` *(or any unique name)* | Will become `https://msccs-sumit-singh.onrender.com` |
| **Branch** | `main` | Your active git branch |
| **Root Directory** | `msccs/app` | *Important: Tells Render where the web files are* |
| **Build Command** | *(Leave empty)* | Pre-built static assets |
| **Publish Directory** | `.` *(or `./`)* | Points to `msccs/app` where `index.html` lives |

5. Click **Create Static Site**.
6. Render will deploy your portal in under **30 seconds**!
7. You will receive a live URL: `https://msccs-sumit-singh.onrender.com`.

---

## ⚡ Option 2: Deploy using Blueprint (`render.yaml`)

Because we have already created the [`render.yaml`](file:///e:/2026/ssr_one_ai/render.yaml) blueprint:
1. Go to [Render Dashboard](https://dashboard.render.com).
2. Click **New +** ➡️ **Blueprint**.
3. Select your repository.
4. Render will read `render.yaml` automatically and configure the site with 1 click!

---

## 📱 Mobile Access & Features
Once deployed on Render, you can open your live link on any smartphone (Android / iOS):
* **Mobile Quick Switcher**: Tap the top dropdown or hamburger menu `☰` to switch between all 11 deliverables with one thumb tap.
* **1-Click PDF Downloads**: Download any of the 11 PDFs or the complete Master Consolidated Portfolio directly to your phone storage.
* **Viva Voce Oral Defense Player**: Practice your presentation on your mobile with slide view and spoken speech scripts.
* **Technical Vocabulary Dictionary**: Instant search for technical terms with Hindi & English meanings.
