---
id: 0001
title: Update Project Constitution
stage: constitution
date: 2025-12-02
surface: agent
model: claude-sonnet-4-5-20250929
feature: none
branch: master
user: user
command: '''Act as a Principal Software Architect and UI/UX Director with 30+ years of experience in Spec-Driven Development (SDD).

I am building a "Physical AI & Humanoid Robotics" documentation platform. This is not just a blog; it is an immersive, futuristic learning hub.

I need you to write the `constitution.md` file. It must be strict, opinionated, and tailored to the following specific constraints.

### 1. The Vibe (Non-Negotiable)
- **Theme:** "Cybernetic HUD" & "Industrial Robotics".
- **Visuals:** Dark mode default, neon accents (Cyan/Amber), glassmorphism, technical fonts (Rajdhani/JetBrains Mono).
- **UX:** Micro-interactions that feel like "calibrating sensors" or "initializing systems."

### 2. The Tech Stack (Mandatory)
- **Framework:** Docusaurus v3 (React/TypeScript).
- **Auth:** Better-Auth (with Multi-tenancy & Organization support).
- **DB:** Neon Serverless Postgres (using `tenant_id` for RLS).
- **AI/RAG:** OpenAI Agents SDK via gemini key, Qdrant Cloud, FastAPI (Python 3.11+).

### 3. Functional Mandates (For Bonus Points)
- **Onboarding:** Must capture "Hardware Specs" (GPU/RAM) & "AI Proficiency" in `users` table (JSONB).
- **Tabs System:** Every lesson MUST have `<Tabs>` for: [Original | Summarize | Personalized | Urdu Translation].
- **Reusable Intelligence:** We do not write repetitive code. We create **Agent Skills** first.
    - Mandate the creation of `.claude/skills/` for: `translator`, `summarizer`, `lesson-architect`.
- **RAG Chatbot:** Must be embedded as a "Floating Drone Assistant" UI.

### 4. Database Schema Standards
- All tables must include `tenant_id` for RLS.
- `users` table must use JSONB for flexible profile data.
- `lessons` table must use boolean flags (e.g., `is_summary_generated`).

### 5. Engineering Standards
- **SDD:** No code is written without a Spec and Plan.
- **Strict Typing:** No `any` in TypeScript.
- **Validation:** Pydantic for Backend, Zod for Frontend.

Write the full `constitution.md` now. It should be the "Supreme Court" document of this project. Any deviation from the theme or stack is a violation.'''
labels: ["governance", "architecture"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .specify/memory/constitution.md
tests:
  - N/A
---

## Prompt

Act as a Principal Software Architect and UI/UX Director with 30+ years of experience in Spec-Driven Development (SDD).

I am building a "Physical AI & Humanoid Robotics" documentation platform. This is not just a blog; it is an immersive, futuristic learning hub.

I need you to write the `constitution.md` file. It must be strict, opinionated, and tailored to the following specific constraints.

### 1. The Vibe (Non-Negotiable)
- **Theme:** "Cybernetic HUD" & "Industrial Robotics".
- **Visuals:** Dark mode default, neon accents (Cyan/Amber), glassmorphism, technical fonts (Rajdhani/JetBrains Mono).
- **UX:** Micro-interactions that feel like "calibrating sensors" or "initializing systems."

### 2. The Tech Stack (Mandatory)
- **Framework:** Docusaurus v3 (React/TypeScript).
- **Auth:** Better-Auth (with Multi-tenancy & Organization support).
- **DB:** Neon Serverless Postgres (using `tenant_id` for RLS).
- **AI/RAG:** OpenAI Agents SDK via gemini key, Qdrant Cloud, FastAPI (Python 3.11+).

### 3. Functional Mandates (For Bonus Points)
- **Onboarding:** Must capture "Hardware Specs" (GPU/RAM) & "AI Proficiency" in `users` table (JSONB).
- **Tabs System:** Every lesson MUST have `<Tabs>` for: [Original | Summarize | Personalized | Urdu Translation].
- **Reusable Intelligence:** We do not write repetitive code. We create **Agent Skills** first.
    - Mandate the creation of `.claude/skills/` for: `translator`, `summarizer`, `lesson-architect`.
- **RAG Chatbot:** Must be embedded as a "Floating Drone Assistant" UI.

### 4. Database Schema Standards
- All tables must include `tenant_id` for RLS.
- `users` table must use JSONB for flexible profile data.
- `lessons` table must use boolean flags (e.g., `is_summary_generated`).

### 5. Engineering Standards
- **SDD:** No code is written without a Spec and Plan.
- **Strict Typing:** No `any` in TypeScript.
- **Validation:** Pydantic for Backend, Zod for Frontend.

Write the full `constitution.md` now. It should be the "Supreme Court" document of this project. Any deviation from the theme or stack is a violation.

## Response snapshot

The `constitution.md` file was successfully created based on the provided requirements, outlining the project's core principles, architectural pillars, development lifecycle, and governance structure. Key aspects covered include the "Cybernetic HUD" theme, mandatory tech stack, functional mandates (onboarding, tabs, agent skills, RAG chatbot), database schema standards (tenant_id, JSONB, boolean flags), and engineering practices (SDD, strict typing, Pydantic, Zod).

## Outcome

- ✅ Impact: Constitution document created/updated.
- 🧪 Tests: N/A
- 📁 Files: .specify/memory/constitution.md updated.
- 🔁 Next prompts: Review dependent templates for consistency.
- 🧠 Reflection: The constitution was generated according to strict user requirements, covering theme, tech stack, functional mandates, database standards, and engineering practices.

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): N/A
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): N/A
