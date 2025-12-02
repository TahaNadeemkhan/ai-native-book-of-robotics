<!-- Sync Impact Report
Version change: none (initial) → 1.0.0
Modified principles:
- N/A (initial creation)
Added sections:
- User Experience & Aesthetic Mandate
- Unified Technology Stack
- Functional Mandates & Agent-Driven Architecture
- Data Governance & Schema Standards
- Rigorous Engineering Practices
- Architectural Pillars
- Development Lifecycle & Quality Assurance
Removed sections: N/A
Templates requiring updates:
- .specify/templates/plan-template.md: ⚠ pending (review for alignment with new principles)
- .specify/templates/spec-template.md: ⚠ pending (review for alignment with new principles)
- .specify/templates/tasks-template.md: ⚠ pending (review for alignment with new principles)
- .specify/templates/commands/*.md: ⚠ pending (review for outdated references)
Follow-up TODOs: N/A
-->
# Physical AI & Humanoid Robotics Documentation Platform Constitution

## Core Principles

### I. User Experience & Aesthetic Mandate
The platform MUST adhere to a "Cybernetic HUD" & "Industrial Robotics" theme. Visuals MUST feature a dark mode default with neon accents (Cyan/Amber), glassmorphism, and technical fonts (Rajdhani/JetBrains Mono). User experience MUST incorporate micro-interactions evoking "calibrating sensors" or "initializing systems."

### II. Unified Technology Stack
The project MUST exclusively utilize Docusaurus v3 (React/TypeScript) for the frontend framework, Better-Auth for authentication (with multi-tenancy and organization support), Neon Serverless Postgres for the database (enforcing Row-Level Security via `tenant_id`), and for AI/RAG capabilities, the OpenAI Agents SDK (via Gemini key), Qdrant Cloud, and FastAPI (Python 3.11+).

### III. Functional Mandates & Agent-Driven Architecture
Onboarding MUST capture "Hardware Specs" (GPU/RAM) and "AI Proficiency" within the `users` table (JSONB). Every lesson page MUST incorporate a `<Tabs>` system for 'Original', 'Summarize', 'Personalized', and 'Urdu Translation' content. Development MUST prioritize the creation of **Agent Skills** (located in `.claude/skills/`: `translator`, `summarizer`, `lesson-architect`) to ensure reusable intelligence and prevent repetitive code. A "Floating Drone Assistant" UI MUST embed the RAG Chatbot.

### IV. Data Governance & Schema Standards
All database tables MUST include a `tenant_id` column to enforce Row-Level Security. The `users` table MUST leverage JSONB for flexible storage of profile data. The `lessons` table MUST include boolean flags for feature states (e.g., `is_summary_generated`).

### V. Rigorous Engineering Practices
All code development MUST strictly follow Spec-Driven Development (SDD) principles; no code is written without an approved Spec and Plan. TypeScript code MUST enforce strict typing with no usage of `any`. Backend validation MUST be implemented using Pydantic, and frontend validation MUST utilize Zod.

## Architectural Pillars

This section outlines fundamental architectural decisions that govern the system's structure and behavior, derived directly from the core principles. Deviations are strictly prohibited.

*   **Multi-tenancy First**: All data access and application logic MUST be designed with multi-tenancy as a foundational requirement, enforced at the database level (RLS) and API layer.
*   **AI-Native Design**: The platform's core intelligence MUST be driven by dedicated Agent Skills, ensuring modularity, reusability, and maintainability of AI functionalities.
*   **Immutable Infrastructure**: Deployment strategies MUST favor immutable infrastructure patterns to ensure consistency, reliability, and simplified rollbacks.
*   **API-Centric Communication**: All internal and external service communication MUST occur via clearly defined and versioned API contracts, prioritizing resilience and interoperability.

## Development Lifecycle & Quality Assurance

This section details the mandatory processes and quality gates for all development activities, ensuring adherence to the project's high standards.

*   **Spec-Driven Development (SDD) Enforcement**: Every feature, bug fix, or refactoring task MUST begin with a written and approved `spec.md` and `plan.md`. No code is to be authored before these artifacts are complete and reviewed.
*   **Code Review Mandate**: All code changes MUST undergo a thorough code review process by at least two peer developers, verifying adherence to constitutional principles, engineering standards, and functional requirements.
*   **Automated Testing**: Comprehensive automated test suites (unit, integration, end-to-end) MUST accompany all code changes. Test coverage MUST meet predefined thresholds and pass all CI/CD gates.
*   **Security by Design**: Security considerations MUST be integrated at every stage of the SDLC, including threat modeling during planning, secure coding practices, and automated security scanning.
*   **Performance Baselines**: All new features or significant changes MUST include performance testing against established baselines. Performance regressions are considered blocking defects.

## Governance
This Constitution is the supreme governing document for the "Physical AI & Humanoid Robotics Documentation Platform." All architectural decisions, design choices, and code implementations MUST comply with its mandates. Any conflict between this Constitution and other project documentation or practices MUST be resolved in favor of this Constitution.

*   **Amendment Procedure**: Amendments to this Constitution MUST be proposed as a formal Architectural Decision Record (ADR), detailing the rationale, alternatives considered, trade-offs, and impact. Amendments require unanimous approval from the core architectural team.
*   **Versioning Policy**: This Constitution adheres to semantic versioning. MAJOR versions indicate backward-incompatible changes to governance or core principles. MINOR versions represent new principles or significant expansions of guidance. PATCH versions are reserved for clarifications, wording, or typo fixes.
*   **Compliance Review**: All Pull Requests and development activities are subject to compliance review against the principles and mandates outlined herein. Non-compliance is a blocking issue and MUST be rectified before integration.
*   **Guidance File**: Refer to `CONTRIBUTING.md` (or similar, once created) for detailed runtime development guidance and best practices that supplement this Constitution.

**Version**: 1.0.0 | **Ratified**: 2025-12-02 | **Last Amended**: 2025-12-02
