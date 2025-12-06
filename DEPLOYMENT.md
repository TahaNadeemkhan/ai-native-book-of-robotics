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

## 🗺️ The Battle Plan

1.  **Unified Config:** We have created `vercel.json` to tell Vercel how to handle both Python (Backend) and React (Frontend) in one repo.
2.  **Database:** Ensure Neon (Postgres) and Qdrant (Vector DB) are ready.
3.  **Deploy:** Push to GitHub -> Connect to Vercel -> Boom. 💥

---

## Phase 1: Preparation

1.  **Push Code to GitHub:**
    *   Ensure `api/index.py` and `vercel.json` are pushed to your `master` branch.
    ```bash
    git add .
    git commit -m "chore: prepare for vercel deployment"
    git push origin master
    ```

## Phase 2: Vercel Deployment

**Goal:** Get the HUD running at `https://<your-app>.vercel.app`.

1.  **Sign up/Log in:** Go to [vercel.com](https://vercel.com).
2.  **Add New Project:**
    *   Click "Add New..." -> "Project".
    *   Select your GitHub repository (`ai-native-book-of-robotics`).
3.  **Configure Project:**
    *   **Framework Preset:** Vercel might detect "Other" or "Docusaurus". It's fine. Our `vercel.json` handles the heavy lifting.
    *   **Root Directory:** Keep it as `.` (Root). **Do NOT change this to docusaurus or api.**
4.  **Environment Variables:**
    *   Copy these strictly from your `.env` (and adjust for production):
        *   `DATABASE_URL`: (Your Neon DB URL - ensure `sslmode=require`)
        *   `SECRET_KEY`: (Generate a strong random string)
        *   `BETTER_AUTH_SECRET`: (Generate a strong random string)
        *   `QDRANT_HOST`: (Your Qdrant Host URL)
        *   `QDRANT_API_KEY`: (Your Qdrant API Key)
        *   `QDRANT_COLLECTION_NAME`: `ai_native_book_platform`
        *   `OPENAI_API_KEY`: (Your OpenAI Key)
        *   `GITHUB_CLIENT_ID`: (Production GitHub App Client ID)
        *   `GITHUB_CLIENT_SECRET`: (Production GitHub App Client Secret)
        *   `GITHUB_REDIRECT_URI`: `https://<your-vercel-url>.vercel.app/api/auth/callback/github` **(Wait for the URL after first deploy if needed, or guess it: project-name.vercel.app)**
        *   `ALGORITHM`: `HS256`
        *   `ACCESS_TOKEN_EXPIRE_MINUTES`: `30`
        *   `PYTHON_VERSION`: `3.12`

5.  **Deploy:** Click "Deploy".

## Phase 3: Post-Deployment Wiring

1.  **GitHub OAuth Update:**
    *   Once deployed, you'll get a domain like `https://ai-native-book.vercel.app`.
    *   Go to your **GitHub OAuth App** settings.
    *   **Homepage URL:** `https://ai-native-book.vercel.app`
    *   **Callback URL:** `https://ai-native-book.vercel.app/api/auth/callback/github`
    *   Update the `GITHUB_REDIRECT_URI` in Vercel Environment Variables if you guessed wrong initially. (Redeploy if changed).

2.  **CORS (Optional but Good):**
    *   Since Backend and Frontend are on the *same domain* now, CORS issues are mostly eliminated! 🚀
    *   However, if you access `/api` from elsewhere, update `api/main.py` origins.

## 🛑 Verification Checklist

- [ ] **Frontend:** `https://<your-app>.vercel.app` loads the Docusaurus site.
- [ ] **Backend:** `https://<your-app>.vercel.app/api/docs` loads the FastAPI Swagger UI.
- [ ] **Auth:** Clicking "System Link" logs you in via GitHub.
- [ ] **Search:** The Drone widget responds to queries.


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
