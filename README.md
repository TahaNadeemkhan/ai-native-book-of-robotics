# Cybernetic HUD Documentation Platform

**Project Codename:** AI Native Book Platform  
**Status:** Beta / MVP  
**Aesthetic:** Industrial / Cyberpunk Interface

![Status](https://img.shields.io/badge/Status-Active-success)
![Stack](https://img.shields.io/badge/Stack-FastAPI%20%7C%20Docusaurus%20%7C%20Neon%20%7C%20Qdrant-blueviolet)

## 🔗 Overview

The **Cybernetic HUD Documentation Platform** is an immersive, AI-adaptive documentation system designed for field Operators working with Physical AI and Humanoid Robotics. Unlike static wikis, this platform "calibrates" to the user's specific hardware (e.g., NVIDIA Jetson Orin, Raspberry Pi) and coding proficiency, rewriting technical content in real-time to match their operational context.

It features a "Support Drone" (Agentic RAG) that follows the user, providing instant answers and contextual scanning of technical manuals.

## ✨ Key Features

### 1. Neural Calibration (Onboarding)
*   **System Link:** Secure authentication via GitHub (Better-Auth).
*   **Profile Calibration:** Users input their hardware specs and AI/Coding proficiency.
*   **Persistence:** Data is stored in a JSONB-enabled PostgreSQL schema for flexible profile management.

### 2. The Lesson Matrix (Multi-View Content)
Every documentation page offers four distinct views:
*   **📄 Original:** The standard, static technical documentation.
*   **⚡ Summarized:** AI-generated bullet points for rapid information intake.
*   **🧠 Personalized:** Content dynamically rewritten to match the user's hardware (e.g., changing install commands from `apt-get` to `pacman` or adjusting CUDA versions).
*   **🌐 Urdu Uplink:** Full technical translation maintaining domain-specific terminology.

### 3. Support Drone (Agentic RAG)
*   **Persistent Assistant:** A floating AI widget available on all pages.
*   **Contextual Scanning:** (Phase 5) Ability to highlight text and "Scan" it for deeper context using the RAG pipeline.
*   **Vector Memory:** Uses **Qdrant** to index documentation for high-accuracy retrieval.

## 🛠️ Technical Architecture

The project follows a **Skill-First Architecture**, separating AI logic from the core application.

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | Docusaurus v3 + Tailwind CSS | The "HUD" interface. Static site generator with dynamic React components. |
| **Backend** | FastAPI (Python 3.12) | API for Auth, User Management, and AI Skills orchestration. |
| **Database** | Neon (Serverless Postgres) | Stores user data and RLS (Row-Level Security) policies. |
| **Vector DB** | Qdrant | Stores content embeddings for RAG. |
| **Auth** | Better-Auth | Handles GitHub OAuth and session management. |
| **AI Engine** | OpenAI (GPT-4o) | Powers the "Skills" (Summarizer, Personalizer, Translator). |

## 🚀 Getting Started

### Prerequisites
*   **Python** 3.12+
*   **Node.js** 18+
*   **Neon DB** Account (Postgres)
*   **Qdrant** Cloud Cluster
*   **OpenAI** API Key
*   **GitHub** OAuth App Credentials

### Installation

#### 1. Clone the Repository
```bash
git clone <repository-url>
cd robotics-book
```

#### 2. Backend Setup
```bash
cd api
python -m venv .venv
source .venv/bin/activate  # or .venv\Scripts\activate on Windows
pip install -r pyproject.toml  # or use `uv sync` if using uv
```

Create a `.env` file in the root (or `api/`) with the following:
```env
DATABASE_URL="postgres://<user>:<pass>@<host>/<dbname>?sslmode=require"
OPENAI_API_KEY="sk-..."
QDRANT_URL="https://..."
QDRANT_API_KEY="..."
BETTER_AUTH_SECRET="..."
GITHUB_CLIENT_ID="..."
GITHUB_CLIENT_SECRET="..."
```

Run Migrations:
```bash
python -m scripts.migrate
```

Start the Server:
```bash
fastapi dev main.py
```

#### 3. Frontend Setup
```bash
cd docusaurus
npm install
```

Start the Development Server:
```bash
npm start
```

The HUD should now be accessible at `http://localhost:3000`.

## 📂 Project Structure

```
/
├── api/                 # FastAPI Backend
│   ├── routes/          # API Endpoints (users, drone, auth)
│   ├── services/        # Business Logic (AI Skills, RAG)
│   └── models/          # Pydantic & SQLAlchemy Models
├── docusaurus/          # Frontend Application
│   ├── src/components/  # React Components (DroneWidget, AuthToggle)
│   └── docs/            # Markdown Documentation Content
├── .claude/skills/      # AI Prompts & Logic (The "Brain")
└── specs/               # Project Specifications & ADRs
```

## 🛡️ Security

*   **Row-Level Security (RLS):** Enforced at the database level ensures users can only access their own personalized data.
*   **Authentication:** OAuth flow handles secure access; "Guest" users are restricted from advanced AI features.

## 📜 License

[MIT](LICENSE)
