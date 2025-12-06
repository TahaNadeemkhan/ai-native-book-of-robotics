# 🚀 Mission Critical Deployment Guide: Cybernetic HUD

**Status:** Classified
**Objective:** Deploy the full "Cybernetic HUD" platform (Frontend + Backend + AI) to the live internet.
**Constraint:** 100% Free Tier usage.
**Reliability Target:** 99.9% (Mitigating "Cold Starts").

---

## ⚠️ The "People's Problems" (Common Pitfalls)

Our deep reconnaissance has identified why most deployments fail. **Read this before doing anything.**

1.  **The "CORS" Block:** The #1 error. Your Frontend (Vercel) tries to talk to Backend (Render), but the browser blocks it because the Backend doesn't explicitly trust the Frontend's URL.
    *   *Solution:* We will update `api/main.py` with the exact Vercel URL *after* we deploy the frontend.
2.  **The "Cold Start" Freeze:** Free hosting providers (Render) put your app to sleep after 15 minutes of inactivity. The next user waits 60+ seconds for it to wake up. They think it's broken.
    *   *Solution:* We will use a free "Heartbeat" monitor (UptimeRobot) to ping the API every 5 minutes, keeping it awake.
3.  **The "Auth Callback" Mismatch:** GitHub OAuth sends users back to `localhost:3000` by default. In production, this breaks.
    *   *Solution:* We will create a **separate** GitHub App specifically for Production.
4.  **The "Missing Secret" Crash:** Forgetting to copy `.env` variables to the cloud dashboard.
    *   *Solution:* A checklist of required variables for both Vercel and Render.

---

## 🗺️ The Battle Plan

1.  **Database & AI:** Ensure Neon and Qdrant are accessible from the cloud.
2.  **Backend (The Brain):** Deploy FastAPI to **Render** (Free).
3.  **Frontend (The Face):** Deploy Docusaurus to **Vercel** (Free).
4.  **Wiring:** Connect them securely (CORS & Auth).
5.  **Life Support:** Set up UptimeRobot.

---

# 🚀 Mission Critical Deployment Guide: Cybernetic HUD (Vercel Edition)

**Status:** Classified
**Objective:** Deploy the full "Cybernetic HUD" platform (Frontend + Backend) to Vercel.
**Constraint:** 100% Free Tier usage. No Credit Card.

---

## 🗺️ The Strategy: Unified Deployment

We are using a **Monorepo Deployment** strategy on Vercel. This means Vercel will build and host both your Python Backend and Docusaurus Frontend from the same repository at the same time.

*   **Frontend:** Served at `https://<your-app>.vercel.app`
*   **Backend:** Served at `https://<your-app>.vercel.app/api/...`

You do **NOT** need to deploy them separately. One push does it all.

---

## Phase 1: Preparation (Local)

1.  **Push Code to GitHub:**
    *   Ensure your `master` branch is up to date.
    ```bash
    git add .
    git commit -m "chore: ready for deployment"
    git push origin master
    ```

## Phase 2: The Launch (Vercel)

1.  **Sign up/Log in:** Go to [vercel.com](https://vercel.com).
2.  **Add New Project:**
    *   Click "Add New..." -> "Project".
    *   Select your GitHub repository (`ai-native-book-of-robotics`).
3.  **Configure Project:**
    *   **Framework Preset:** Select **"Other"**. (Do NOT select Docusaurus).
    *   **Root Directory:** Keep it as `.` (The default Root).
    *   **Build/Output Settings:** Leave them empty/default. Our `vercel.json` handles this.
4.  **Environment Variables:**
    *   Add these **Key-Value pairs** (copy values from your `.env` or generate new secrets):
        *   `DATABASE_URL`: (Your Neon DB URL)
        *   `SECRET_KEY`: (Random string for security)
        *   `BETTER_AUTH_SECRET`: (Random string for security)
        *   `QDRANT_HOST`: (Your Qdrant Host URL)
        *   `QDRANT_API_KEY`: (Your Qdrant API Key)
        *   `QDRANT_COLLECTION_NAME`: `ai_native_book_platform`
        *   `OPENAI_API_KEY`: (Your OpenAI Key)
        *   `GITHUB_CLIENT_ID`: (Production GitHub App Client ID)
        *   `GITHUB_CLIENT_SECRET`: (Production GitHub App Client Secret)
        *   `GITHUB_REDIRECT_URI`: `https://<your-project-name>.vercel.app/api/auth/callback/github` (**Crucial:** Must match your Vercel domain)
        *   `ALGORITHM`: `HS256`
        *   `ACCESS_TOKEN_EXPIRE_MINUTES`: `30`
        *   `PYTHON_VERSION`: `3.12`

5.  **Deploy:** Click "Deploy".

## Phase 3: Final Wiring (GitHub OAuth)

1.  **Get Your URL:**
    *   Once Vercel finishes, copy your new domain (e.g., `https://ai-native-book-123.vercel.app`).
2.  **Update GitHub App:**
    *   Go to your **GitHub OAuth App** settings (on github.com).
    *   **Homepage URL:** `https://ai-native-book-123.vercel.app`
    *   **Callback URL:** `https://ai-native-book-123.vercel.app/api/auth/callback/github`
3.  **Verify Vercel Env Var:**
    *   If you guessed the URL wrong in Step 2, go back to Vercel -> Settings -> Environment Variables.
    *   Update `GITHUB_REDIRECT_URI` to match the actual URL.
    *   Redeploy (Project -> Deployments -> Redeploy) if you changed variables.

## 🛑 Verification Checklist

- [ ] **Frontend:** Open `https://<your-app>.vercel.app`. Does the Docusaurus site load?
- [ ] **Backend:** Open `https://<your-app>.vercel.app/api/`. Do you see `{"message": "Welcome..."}`?
- [ ] **Login:** Click "System Link" (Login). Does it redirect to GitHub and back successfully?
- [ ] **AI:** Does the Drone widget answer questions?

---
**Mission Complete.** 🚀


## Phase 2: Frontend Deployment (Vercel)

**Goal:** Get the HUD running at `https://<your-app>.vercel.app`.

1.  **Sign up for Vercel:** Go to [vercel.com](https://vercel.com).
2.  **Import Project:**
    *   Click "Add New..." -> "Project".
    *   Select your GitHub repo.
3.  **Configure Project:**
    *   **Framework Preset:** Docusaurus (Vercel usually detects this).
    *   **Root Directory:** Click "Edit" and select `docusaurus` folder. **Crucial!**
4.  **Environment Variables:**
    *   `BETTER_AUTH_URL`: `https://<your-backend-url>.onrender.com` (The URL from Phase 1)
    *   `NEXT_PUBLIC_API_URL`: `https://<your-backend-url>.onrender.com`
5.  **Deploy:** Click "Deploy".
    *   Wait for the confetti. You now have a Frontend URL!

## Phase 3: The Wiring (CORS & Auth)

**Goal:** Stop the browser from blocking requests and fix Login.

1.  **Fix CORS (Backend):**
    *   Open `api/main.py`.
    *   Find `origins = [...]`.
    *   Add your **Vercel URL** (e.g., `https://robotics-hud.vercel.app`) to this list.
    *   Commit and Push. Render will auto-redeploy.
2.  **Fix Auth (GitHub):**
    *   Go to GitHub Developer Settings -> OAuth Apps.
    *   **Create New OAuth App:** "Cybernetic HUD (Prod)".
    *   **Homepage URL:** `https://<your-frontend>.vercel.app`
    *   **Callback URL:** `https://<your-backend>.onrender.com/api/auth/callback/github` (**Important:** Backend URL, not Frontend!)
    *   **Copy ID & Secret.**
3.  **Update Secrets (Render):**
    *   Go to Render Dashboard -> Environment.
    *   Update `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` with the new *Production* keys.
    *   Render will restart.

## Phase 4: Life Support (Anti-Cold Start)

**Goal:** Prevent the 60s delay.

1.  Sign up for [UptimeRobot](https://uptimerobot.com/) (Free).
2.  Add New Monitor.
3.  **Type:** HTTP(s).
4.  **URL:** `https://<your-backend>.onrender.com/health` (or just `/` if no health route).
5.  **Interval:** 5 minutes.
6.  **Start.**
    *   *Result:* Render will think your app is always busy and won't put it to sleep.

---

## 🛑 Final Checklist (The "1000% Working" Verification)

- [ ] **HTTPS:** Both Vercel and Render sites load with the padlock icon.
- [ ] **Login:** Clicking "System Link" redirects to GitHub and back without error.
- [ ] **Persistence:** "Calibration" data saves and persists after refresh.
- [ ] **Drone:** The chat widget replies (means OpenAI & Qdrant are connected).
- [ ] **Console:** Press F12. No red "CORS" errors in the console.
