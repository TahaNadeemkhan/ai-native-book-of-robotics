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


### Phase 4: Implementation Plan

 1. Authentication

 Current State Analysis:
 Based on the git status, it appears there are existing authentication routes and components, including api/routes/auth.py and
 docusaurus/src/components/AuthToggle.tsx. The goal is to enhance this with Email/Password, Google OAuth (via Better-Auth), and ensure
 GitHub OAuth is working.

 Backend (FastAPI - Better-Auth Integration):
 - Dependencies: Integrate Better-Auth library into the FastAPI backend. This will likely involve installing the library and configuring it.
 - User Model Extension:
   - Modify the existing User model to accommodate additional fields required by Better-Auth (e.g., hashed_password, email_verified).
   - Add fields for Google OAuth provider information (e.g., google_id).
 - New API Endpoints in api/routes/auth.py:
   - /auth/signup (POST): For Email + Password registration. Takes email and password.
   - /auth/login (POST): For Email + Password login. Takes email and password.
   - /auth/google-oauth (GET): Initiates Google OAuth flow.
   - /auth/google-oauth/callback (GET): Callback endpoint for Google OAuth to process the token and log in/register the user.
   - Ensure existing /auth/github-oauth and /auth/github-oauth/callback endpoints are correctly configured and functional using
 Better-Auth's GitHub provider.
 - Authentication Logic:
   - Implement user creation, password hashing, and JWT token generation using Better-Auth utilities for Email + Password.
   - For Google and GitHub OAuth, implement logic to either link existing accounts or create new ones based on the provider's ID.
   - Securely store access tokens and refresh tokens.

 Client-side (Docusaurus):
 - AuthToggle Component (docusaurus/src/components/AuthToggle.tsx):
   - Update this component to include buttons for "Sign Up with Email", "Login with Email", and "Login with Google".
   - Integrate with the new FastAPI authentication endpoints.
 - Authentication Context/Provider:
   - Create a React Context or similar provider to manage authentication state (e.g., isLoggedIn, user, token).
   - This context will handle API calls to the backend, store JWTs (e.g., in localStorage or sessionStorage), and provide methods for
 logging in, logging out, and checking authentication status.
 - Redirection:
   - After successful login or signup, redirect the user as per the onboarding flow.
   - Implement route guards to protect authenticated routes.

 2. Onboarding Flow

 Redirection Logic:
 - After successful authentication (login or signup), the client-side authentication handler will check if the user has completed
 onboarding.
 - If additional_info in the users table is null or empty, redirect the user to a new dedicated onboarding route (e.g., /onboarding).

 React/Docusaurus Component Structure (docusaurus/src/pages/OnboardingForm.tsx - new file):
 - Parent Component: OnboardingForm.tsx will be a new Docusaurus page component.
 - Input Fields:
   - Programming Proficiency Level:
       - Component: ProficiencySelect (new component in docusaurus/src/components/).
     - Input Type: Radio buttons or a dropdown with options: "Beginner", "Intermediate", "Expert".
   - AI Proficiency Level:
       - Component: ProficiencySelect (re-use).
     - Input Type: Radio buttons or a dropdown with options: "Beginner", "Intermediate", "Expert".
   - Hardware Info:
       - Component: HardwareInput (new component in docusaurus/src/components/).
     - Input Type: Text input with auto-suggestions based on a predefined list of top companies (e.g., "Nvidia Jetson", "Raspberry Pi",
 "Intel NUC"). This can be a simple datalist with <option> tags or a more advanced autocomplete component.
 - State Management: Use React's useState hooks to manage the form input values.
 - Submission:
   - On form submission, gather all input data.
   - Call a new backend API endpoint (e.g., POST /users/onboarding) to save this data.

 Data Storage (Backend - users table):
 - additional_info JSONB Column:
   - The backend API endpoint (POST /users/onboarding) will receive the onboarding data.
   - It will update the authenticated user's additional_info JSONB column in the users table.
   - Example additional_info JSON structure:
   {
   "programming_proficiency": "Intermediate",
   "ai_proficiency": "Beginner",
   "hardware_info": "Nvidia Jetson"
 }
 - Validation: Implement backend validation for the submitted data.

 Redirection after Onboarding:
 - Upon successful saving of onboarding data, the backend will return a success response.
 - The client-side OnboardingForm component will then redirect the user to the main site (e.g., /).

 3. Personalization Trigger

 "NEURAL PERSONALIZE" Button:
 - Location: The button will be placed on Docusaurus chapter pages. This means modifying the Docusaurus theme layout for document pages.
 - Component: Create a new React component, NeuralPersonalizeButton.tsx, to encapsulate the button logic.
 - Logic:
   a. Authentication Check: The button will only be visible and active for authenticated users. Guests will see the "Security Clearance
 Required" overlay.
   b. Fetch Onboarding Data: When an authenticated user clicks the button, the client-side will make an API call to a new backend endpoint
 (e.g., GET /users/me/onboarding) to retrieve the user's additional_info.
   c. Generate Personalized Content:
       - The client will send the current chapter's content (or ID) and the user's onboarding data to a new backend API endpoint (e.g., POST
  /ai/personalize-chapter).
     - This endpoint will interact with api/services/ai_service.py to process the content, potentially using a RAG (Retrieval-Augmented
 Generation) service (api/services/rag_service.py) and the user's proficiency levels and hardware info to tailor the explanation, examples,
 or suggestions.
   d. Update UI: The personalized content returned from the backend will be dynamically injected into the chapter page UI, replacing or
 augmenting the original content. This might involve rendering a new component with the personalized text.

 "Security Clearance Required" Overlay:
 - Component: Create a SecurityClearanceOverlay.tsx component.
 - Display Logic: If a guest user attempts to click the "NEURAL PERSONALIZE" button or tries to access a personalized feature, this overlay
 will appear, prompting them to log in or sign up.
 - Styling: Implement the Cyberpunk HUD theme for this overlay.

 4. UI/UX Cyberpunk HUD Theme

 Styling Approach:
 - Utilize Tailwind CSS for utility-first styling.
 - Implement custom CSS for specific effects that are hard to achieve with Tailwind alone (e.g., neon glow, scanline effects).

 Color Palette:
 - Tailwind Config (docusaurus/tailwind.config.js): Extend the Tailwind theme to include custom colors.
 module.exports = {
   theme: {
     extend: {
       colors: {
         'cb-background': '#0c0f12',
         'cb-neon-green': '#00f7a3',
         'cb-cyan-accent': '#00eaff',
         'cb-soft-mint': '#c4fff9',
         'cb-muted-grey': '#9aa5b1',
       },
     },
   },
 }
 - Custom CSS (docusaurus/src/css/custom.css):
 :root {
   --cb-background: #0c0f12;
   --cb-neon-green: #00f7a3;
   --cb-cyan-accent: #00eaff;
   --cb-soft-mint: #c4fff9;
   --cb-muted-grey: #9aa5b1;
 }
 body {
   background-color: var(--cb-background);
   color: var(--cb-soft-mint); /* Default text color */
 }

 Typography:
 - Font Import: Find a suitable "wide-letter futuristic font" from Google Fonts or similar, and import it into
 docusaurus/src/css/custom.css.
 - Tailwind Config: Configure font families in tailwind.config.js.
 - Custom CSS: Apply slight neon glow using text-shadow for headings.
 h1, h2, h3 {
   font-family: 'CyberpunkFont', sans-serif; /* Example font */
   color: var(--cb-neon-green);
   text-shadow: 0 0 5px var(--cb-neon-green), 0 0 10px var(--cb-neon-green);
 }
 .text-body {
   color: var(--cb-muted-grey);
 }

 Component Styling:
 - Glowing Neon Borders: Use custom utility classes or apply directly.
 .neon-border-green {
   border: 1px solid var(--cb-neon-green);
   box-shadow: 0 0 8px var(--cb-neon-green);
 }
 - Animated Cyberpunk Input Fields:
 .cyber-input {
   background-color: transparent;
   border: 1px solid var(--cb-muted-grey);
   color: var(--cb-soft-mint);
   padding: 0.75rem 1rem;
   transition: all 0.3s ease-in-out;
 }
 .cyber-input:focus {
   outline: none;
   border-color: var(--cb-cyan-accent);
   box-shadow: 0 0 10px var(--cb-cyan-accent);
 }
 - Hover Flicker Effects: CSS animations.
 .flicker-hover:hover {
   animation: flicker 0.1s infinite alternate;
 }
 @keyframes flicker {
   0%, 100% { opacity: 1; }
   50% { opacity: 0.8; }
 }
 - Terminal-style Labels: Use font-mono with muted colors.
 - Subtle Grid Background / Scanline Effect: Apply as a background-image in body or a dedicated full-screen div using CSS gradients or small
  repeating patterns.
 - AI-core Loading Animation: Custom CSS animation for a loading spinner/indicator.

 Micro-Interactions:
 - Button Hover Pulse Neon:
 .btn-neon-pulse {
   background-color: var(--cb-neon-green);
   color: var(--cb-background);
   transition: all 0.3s ease-in-out;
 }
 .btn-neon-pulse:hover {
   box-shadow: 0 0 15px var(--cb-neon-green), 0 0 25px var(--cb-neon-green);
   transform: scale(1.05);
 }
 - Input Glow: Achieved with the .cyber-input:focus style.
 - Screen-like Page Transitions: Docusaurus router transitions might need to be customized. This could involve CSS transitions on page
 mount/unmount or using a library like Framer Motion.

 5. Database Schema Considerations

 Backend API Changes:
 - User Management:
   - GET /users/me/onboarding: Retrieve the additional_info JSONB column for the authenticated user.
   - POST /users/onboarding: Update the additional_info JSONB column for the authenticated user with the onboarding data.
 - AI Personalization:
   - POST /ai/personalize-chapter: Takes chapter_id and user_onboarding_data (or fetches it internally based on authenticated user). Returns
  personalized_content (text).

 Database Organization and Readability:
 - Ensure that the users table's additional_info column is properly indexed for querying if needed (though for a single JSONB column, direct
  access is often fine).
 - Use Pydantic models in FastAPI to define clear input and output schemas for all new API endpoints, ensuring data integrity and
 readability.

 6. Docusaurus Configuration (docusaurus/docusaurus.config.ts)

 - New Routes:
   - Add a new route for the onboarding form: /onboarding.
 - Navbar Items:
   - Potentially add a "Login" or "Sign Up" link to the navbar.
   - Consider a "Profile" or "Dashboard" link for authenticated users, which could also serve as an entry point to update onboarding info.
 - Global Components:
   - Integrate the AuthToggle component into the Docusaurus theme layout (e.g., in the navbar).
   - Register new theme components if necessary (e.g., custom DocItem wrappers for personalization features).
 - Tailwind CSS Integration: Ensure Tailwind CSS is correctly configured as a PostCSS plugin for Docusaurus.
 - Custom CSS: Ensure custom.css is correctly imported.

 Critical Files for Implementation

 - /mnt/d/piaic/cli-practice/robotics-book/api/routes/auth.py - Core logic for integrating Better-Auth, new signup/login, and Google OAuth
 endpoints.
 - /mnt/d/piaic/cli-practice/robotics-book/api/database.py - Database schema modifications for the users table, including updates to the
 additional_info JSONB column.
 - /mnt/d/piaic/cli-practice/robotics-book/docusaurus/src/css/custom.css - Custom CSS for defining the cyberpunk HUD theme, including
 colors, typography, and component styling.
 - /mnt/d/piaic/cli-practice/robotics-book/docusaurus/docusaurus.config.ts - Docusaurus configuration for new routes, navbar items, and
 global component integration.
 - /mnt/d/piaic/cli-practice/robotics-book/docusaurus/src/components/AuthToggle.tsx - Client-side component for handling different
 authentication methods and integrating with the backend.

### Phase 5: The Drone Integration (RAG)
* **Goal:** Build the "Assistant" (The Chatbot) connecting to **Existing Qdrant Data**.
* **Deliverables:**
    1.  Qdrant Client Configuration (Connecting to existing Cloud Cluster).
    2.  OpenAI Agent setup.
    3.  `DroneWidget.tsx` floating component.
    4.  Context Menu "Scan" implementation.

- [ ] T038 [RAG] Configure Qdrant client in `api/services/qdrant_service.py` to connect to your specific **Collection Name** where data already exists.
- [ ] T039 [RAG] **Verification:** Create a temp script `api/scripts/test_qdrant.py` to simply fetch 1 vector from your existing collection. Confirm the data matches your book content.
- [ ] T040 [RAG] Configure OpenAI Agent with access to Qdrant for RAG capabilities in `api/services/openai_agent.py`.
- [ ] T041 [RAG] Implement `/drone/chat` (chatbot) API endpoint for general RAG Q&A in `api/routes/drone.py`.
- [ ] T042 [RAG] **Verification:** Send a test query to `/drone/chat` and verify the answer is based on the **existing book content** inside Qdrant.
- [ ] T043 [RAG] Create `DroneWidget.tsx` floating component in `docusaurus/src/components/DroneWidget.tsx`.
- [ ] T044 [RAG] Implement context menu integration for "Scan with Drone" functionality in Docusaurus (via `docusaurus/src/theme/Root.js` or global wrapper).
- [ ] T045 [RAG] Implement `/drone/scan` API endpoint for contextual scanning of highlighted text in `api/routes/drone.py`.
- [ ] T046 [RAG] **Verification:** Highlight text on a Docusaurus page, select "Scan with Drone", and verify a contextual RAG answer is displayed in `DroneWidget.tsx`.

## CHECKPOINT 5: The Drone Integration (RAG)
- [ ] Manual Verification: Application successfully connects to the pre-indexed Qdrant collection, OpenAI Agent retrieves correct info, and the Drone Widget works.
- [ ] Git Commit: "feat: complete phase 5 - drone integration (existing RAG data)"
