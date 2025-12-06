# Feature Tasks: AI Native Book Platform

**Plan**: [specs/001-ai-native-book-platform/plan.md](/mnt/d/piaic/cli-practice/robotics-book/specs/001-ai-native-book-platform/plan.md)
**Spec**: [specs/001-ai-native-book-platform/spec.md](/mnt/d/piaic/cli-practice/robotics-book/specs/001-ai-native-book-platform/spec.md)

## 10. Execution Roadmap (Strict Sequence)

### Phase 1: The Intelligence Layer (Skills First)
*   **Goal:** Build the "Brain" before the Body.
*   **Deliverables:**
    1.  `urdu-translator` Skill (verified via CLI).
    2.  `lesson-summarizer` Skill (verified via CLI).
    3.  `content-personalizer` Skill (verified via CLI).
*   **Validation:** All 3 skills must return valid text output from a CLI prompt before Phase 2 begins.

- [ ] T001 [Skill] Create directory for Urdu Translator skill: `.claude/skills/urdu-translator/`
- [ ] T002 [Skill] Create `SKILL.md` for Urdu Translator with initial system prompt in `.claude/skills/urdu-translator/SKILL.md`
- [ ] T003 [Skill] Implement Urdu translation logic within `.claude/skills/urdu-translator/`
- [ ] T004 [Skill] **Verification:** Run `claude "Translate 'Hello World' to Urdu"` and verify output matches "Cybernetic" tone.
- [ ] T005 [Skill] Create directory for Lesson Summarizer skill: `.claude/skills/lesson-summarizer/`
- [ ] T006 [Skill] Create `SKILL.md` for Lesson Summarizer with initial system prompt in `.claude/skills/lesson-summarizer/SKILL.md`
- [ ] T007 [Skill] Implement lesson summarization logic within `.claude/skills/lesson-summarizer/`
- [ ] T008 [Skill] **Verification:** Run `claude "Summarize this text: The robot autonomously navigated the terrain."` and verify output is a concise summary in "Robotics" tone.
- [ ] T009 [Skill] Create directory for Content Personalizer skill: `.claude/skills/content-personalizer/`
- [ ] T010 [Skill] Create `SKILL.md` for Content Personalizer with initial system prompt in `.claude/skills/content-personalizer/SKILL.md`
- [ ] T011 [Skill] Implement content personalization logic within `.claude/skills/content-personalizer/`
- [ ] T012 [Skill] **Verification:** Run `claude "Personalize this text for NVIDIA Jetson Orin: Introduction to Robotics"` and verify output references "NVIDIA Jetson Orin" specifically.

## CHECKPOINT 1: The Intelligence Layer (Skills First)
- [ ] Manual Verification: All 3 skills (Urdu, Summarizer, Personalizer) return valid, tone-appropriate output via CLI.
- [ ] Git Commit: "feat: complete phase 1 - intelligence layer (skills)"

### Phase 2: The Core Systems (Backend & Auth)
*   **Goal:** Build the "Spine" (Data & Security).
*   **Deliverables:**
    1.  Neon DB setup with `tenant_id` RLS policies.
    2.  FastAPI CRUD endpoints for `users` (with JSONB profile).
    3.  Better-Auth implementation with GitHub Provider.
    4.  **Critical:** The "Sign-In Toggle" logic (Backend state).

- [ ] T013 [Backend] Initialize FastAPI project structure in `api/`
- [ ] T014 [Backend] Configure Neon DB connection in `api/config.py`
- [ ] T015 [Backend] Create `users` table migration with `id`, `tenant_id`, `github_id`, `email`, `display_name`, `additional_info` (JSONB), `created_at`, `updated_at` in `api/migrations/`
- [ ] T016 [Backend] **Verification:** Run DB migration and confirm `users` table schema in Neon DB.
- [ ] T017 [Backend] Implement Row-Level Security (RLS) policies for `tenant_id` on `users` table in Neon DB.
- [ ] T018 [Backend] **Verification:** Attempt to insert a row without `tenant_id` and confirm it fails; attempt to query data for another `tenant_id` and confirm it is unauthorized.
- [ ] T019 [Backend] Implement FastAPI model for `User` with Pydantic in `api/models/user.py`
- [ ] T020 [Backend] Implement FastAPI CRUD endpoints for `users` (get, create, update, delete) in `api/routes/users.py`
- [ ] T021 [Backend] **Verification:** Use `curl` to verify CRUD operations for `users` endpoints.
- [ ] T022 [Backend] Integrate Better-Auth (GitHub Provider) into FastAPI in `api/auth.py`
- [ ] T023 [Backend] Implement authentication routes (`/auth/login/github`, `/auth/callback/github`, `/auth/logout`) in `api/routes/auth.py`
- [x] T024 [Backend] **Verification:** Successfully log in and out via GitHub OAuth flow.
- [x] T025 [Backend] Implement backend logic for "Sign-In Toggle" state management (e.g., session handling or token validation) in `api/services/auth_service.py`
- [x] T026 [Backend] **Verification:** Verify backend correctly identifies authenticated vs. unauthenticated requests based on toggle logic. (Authenticated check passed)

## CHECKPOINT 2: The Core Systems (Backend & Auth)
- [x] Manual Verification: Database is correctly set up with RLS, user CRUD operations work, and GitHub authentication is functional. Backend toggle logic correctly differentiates authenticated states.
- [ ] Git Commit: "feat: complete phase 2 - core systems (backend & auth)"

### Phase 3: The Cybernetic Frontend (UI)
* **Goal:** Build the "Face" (HUD Interface).
* **Deliverables:**
    1.  Docusaurus v3 + Tailwind v3 installation.
    2.  **Critical:** Better-Auth Client SDK setup.
    3.  `AuthToggle.tsx` component (Red/Green states).
    4.  `LessonMatrix.tsx` component (The 4-Tab interface).
    5.  Logic to Lock specific tabs for Guests.

- [x] T027 [Frontend] Initialize Docusaurus v3 project in `docusaurus/` (Already exists)
- [x] T028 [Frontend] Integrate Tailwind CSS v3 into Docusaurus project in `docusaurus/tailwind.config.js` and `docusaurus/src/css/custom.css`
- [x] T029 [Frontend] **Verification:** Run Docusaurus dev server and confirm Tailwind styles are applied correctly.
- [x] T030 [Frontend] Install Better-Auth Client SDK: Run `npm install better-auth` in `docusaurus/` directory.
- [x] T031 [Frontend] Configure Better-Auth Client and ensure FastAPI allows requests from localhost:3000 (via CORSMiddleware) or set up a dev proxy in docusaurus.config.js.
- [x] T032 [Frontend] Create `AuthToggle.tsx` component and register it in the Navbar via Swizzle or as a custom navbarItem in docusaurus.config.js.
- [x] T033 [Frontend] Implement Red/Green visual states for `AuthToggle.tsx` using the `authClient.useSession` hook (from T031) to detect real-time login status.
- [x] T034 [Frontend] **Verification:** Toggle authentication state (mock or real) and verify `AuthToggle` component changes visually from Red (Offline/Guest) to Green (Online/Auth).
- [x] T035 [Frontend] Create `LessonMatrix.tsx` component with tabs for "Original", "Summarize", "Personalized", and "Urdu Uplink" in `docusaurus/src/components/LessonMatrix.tsx`
- [x] T036 [Frontend] Implement logic to lock "Summarize", "Personalized", and "Urdu Uplink" tabs for unauthenticated Guests (using `useSession`), displaying a "Security Clearance Required" overlay.
- [x] T037 [Frontend] **Verification:** As an unauthenticated user, attempt to click on locked tabs and verify the "Security Clearance Required" overlay appears.

## CHECKPOINT 3: The Cybernetic Frontend (UI)
- [ ] Manual Verification: Docusaurus/Tailwind working, Better-Auth Client connected, AuthToggle reflects real status, and LessonMatrix locks tabs.
- [ ] Git Commit: "feat: complete phase 3 - cybernetic frontend (UI)"


### Phase 4: Advanced Onboarding & Cyberpunk Polish
* **Goal:** Implement the deep personalization flows and strict Cyberpunk aesthetic (Google Auth, Onboarding Form, Neural Trigger).
* **Deliverables:**
    1.  Extended Auth (Google, Email/Pass).
    2.  `OnboardingForm.tsx` (Proficiency & Hardware capture).
    3.  `NeuralPersonalizeButton.tsx` (The AI Trigger).
    4.  Advanced CSS (Neon glow, fonts, animations).

- [ ] T038 [Auth] Extend Better-Auth in Backend (`api/auth.py`) to support Google OAuth and Email/Password. Update User model to handle `google_id`.
- [ ] T039 [Frontend] Update `AuthToggle.tsx` to include "Login with Google" and "Sign Up with Email" buttons using the updated Better-Auth client.
- [ ] T040 [Backend] Create `POST /users/onboarding` endpoint to update `additional_info` (Programming Level, AI Level, Hardware) in `users` table.
- [ ] T041 [Frontend] Create `/onboarding` page with `OnboardingForm.tsx`. Include inputs for Proficiency (Radio) and Hardware (Datalist with "Nvidia Jetson", etc.).
- [ ] T042 [Frontend] **Verification:** Complete the Onboarding form and verify the data is saved in the Neon DB `users` table JSONB column.
- [ ] T043 [UI] Implement "Deep Cyberpunk Theme" in `custom.css`. Define variables: `--cb-neon-green`, `--cb-background`, `--cb-cyan-accent`. Apply `text-shadow` glows to headings.
- [ ] T044 [Frontend] Create `NeuralPersonalizeButton.tsx`. Logic: If Authenticated -> Call Personalization API. If Guest -> Show "Security Clearance" Overlay.
- [ ] T045 [Backend] Create `POST /ai/personalize-chapter` endpoint. It receives `chapter_content` + `user_onboarding_data` and calls the `content-personalizer` Skill.
- [ ] T046 [Frontend] **Verification:** Log in, complete onboarding, go to a chapter, click "Personalize Content", and verify the content changes to match your Hardware/Proficiency. (completed)

## CHECKPOINT 4: Advanced Onboarding & Polish
- [ ] Manual Verification: Google Login works, Onboarding Form saves data, and the Neural Personalize button actually changes content based on that data. The UI looks "Cyberpunk" (Dark/Neon).
- [ ] Git Commit: "feat: complete phase 4 - advanced onboarding and cyberpunk polish" (completed)

### Phase 5: The Drone Integration (RAG)
* **Goal:** Build the "Assistant" (The Chatbot) connecting to **Existing Qdrant Data**.
* **Deliverables:**
    1.  Qdrant Client Configuration (Connecting to existing Cloud Cluster).
    2.  OpenAI Agent SDK setup.
    3.  `DroneWidget.tsx` floating component.
    4.  Context Menu "Scan" implementation.

- [x] T038 [RAG] Configure Qdrant client in `api/services/rag_service.py` (merged service) to connect to your specific **Collection Name** where data already exists.
- [x] T039 [RAG] **Verification:** Create a temp script `api/scripts/test_drone_agent.py` to simply fetch 1 vector from your existing collection. Confirm the data matches your book content.
- [x] T040 [RAG] Configure OpenAI Agent with access to Qdrant for RAG capabilities in `api/services/rag_service.py`.
- [x] T041 [RAG] Implement `/drone/chat` (chatbot) API endpoint for general RAG Q&A in `api/routes/drone.py`.
- [x] T042 [RAG] **Verification:** Send a test query to `/drone/chat` and verify the answer is based on the **existing book content** inside Qdrant.
- [x] T043 [RAG] Create `DroneWidget.tsx` floating component in `docusaurus/src/components/DroneWidget.tsx`.
- [x] T044 [RAG] Implement context menu integration for "Scan with Drone" functionality in Docusaurus (via `docusaurus/src/theme/Root.js` or global wrapper).
- [x] T045 [RAG] Implement `/drone/scan` API endpoint for contextual scanning of highlighted text in `api/routes/drone.py`.
- [x] T046 [RAG] **Verification:** Highlight text on a Docusaurus page, select "Scan with Drone", and verify a contextual RAG answer is displayed in `DroneWidget.tsx`.

## CHECKPOINT 5: The Drone Integration (RAG)
- [x] Manual Verification: Application successfully connects to the pre-indexed Qdrant collection, OpenAI Agent retrieves correct info, and the Drone Widget works.
- [x] Git Commit: "feat: complete phase 5 - drone integration (existing RAG data)"
