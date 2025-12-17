import json
import logging
from typing import Dict, List, Optional

from agents import (
    Agent,
    OpenAIChatCompletionsModel,
    Runner,
    function_tool,
    set_tracing_disabled,
)
from api.config import settings
from openai import AsyncOpenAI
from qdrant_client import QdrantClient

set_tracing_disabled(disabled=True)

# Lazy initialization to prevent crashes if env vars missing
_qdrant_client: Optional[QdrantClient] = None
_ai_client: Optional[AsyncOpenAI] = None

def get_qdrant_client() -> Optional[QdrantClient]:
    """Lazy initialization of Qdrant client."""
    global _qdrant_client
    if _qdrant_client is None:
        if settings.QDRANT_HOST and settings.QDRANT_API_KEY:
            try:
                _qdrant_client = QdrantClient(
                    url=settings.QDRANT_HOST,
                    api_key=settings.QDRANT_API_KEY,
                )
                logging.info("Qdrant client initialized successfully")
            except Exception as e:
                logging.error(f"Failed to initialize Qdrant client: {e}")
                return None
        else:
            logging.warning("QDRANT_HOST or QDRANT_API_KEY not set")
            return None
    return _qdrant_client

def get_ai_client() -> Optional[AsyncOpenAI]:
    """Lazy initialization of AI client."""
    global _ai_client
    if _ai_client is None:
        if settings.GEMINI_API_KEY:
            _ai_client = AsyncOpenAI(
                api_key=settings.GEMINI_API_KEY,
                base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
            )
            logging.info("AI client initialized successfully")
        else:
            logging.warning("GEMINI_API_KEY not set")
            return None
    return _ai_client


async def get_embedding(text: str) -> List[float]:
    """
    Generates an embedding vector for the given text using Gemini.
    """
    ai_client = get_ai_client()
    if not ai_client:
        raise ValueError("AI client not initialized - check GEMINI_API_KEY")

    try:
        response = await ai_client.embeddings.create(
            model="text-embedding-004", input=text
        )
        return response.data[0].embedding
    except Exception as e:
        logging.error(f"Embedding Generation Error: {e}")
        raise


async def search_knowledge_base(query: str, top_k: int = 3) -> List[Dict]:
    """
    Searches Qdrant for relevant context chunks.
    """
    qdrant = get_qdrant_client()
    if not qdrant:
        logging.warning("Qdrant client not available - skipping RAG search")
        return []

    try:
        # 1. Get Query Embedding
        vector = await get_embedding(query)

        # 2. Search Qdrant
        response = qdrant.query_points(
            collection_name=settings.QDRANT_COLLECTION_NAME,
            query=vector,
            limit=top_k,
        )
        results = response.points

        # 3. Format Results
        chunks = []
        for res in results:
            chunks.append(
                {
                    "content": res.payload.get("content", ""),
                    "score": res.score,
                    "metadata": res.payload,
                }
            )

        return chunks

    except Exception as e:
        logging.error(f"RAG Search Error: {e}")
        return []


# --- AGENT SETUP ---

@function_tool
async def retrieve_robotics_context(query: str) -> str:
    """
    Searches the internal robotics knowledge base (Qdrant) for relevant technical documentation,
    specs, and manuals. Use this to answer user questions about the robotics platform.
    """
    chunks = await search_knowledge_base(query)
    if not chunks:
        return "No relevant data found in the knowledge base."

    result_text = "Found the following context from the Knowledge Base:\n"
    for i, chunk in enumerate(chunks):
        result_text += f"--- SOURCE {i + 1} ---\n{chunk['content']}\n"
    return result_text


# Lazy agent initialization
_drone_agent: Optional[Agent] = None

def get_drone_agent() -> Optional[Agent]:
    """Lazy initialization of drone agent."""
    global _drone_agent
    if _drone_agent is None:
        ai_client = get_ai_client()
        if not ai_client:
            logging.error("Cannot create drone agent - AI client not available")
            return None

        try:
            chat_model = OpenAIChatCompletionsModel(
                openai_client=ai_client,
                model="gemini-2.5-flash",
            )

            _drone_agent = Agent(
                name="Support Drone",
                instructions=(
                    "You are a Cybernetic Support Drone for the 'Physical AI & Humanoid Robotics' platform. "
                    "Your tone is robotic, precise, and helpful. "
                    "\n\nCORE PROTOCOLS:\n"
                    "1. KNOWLEDGE RETRIEVAL: For technical queries, ALWAYS use `retrieve_robotics_context` first. "
                    "   - If context is found: Use it to answer."
                    "   - If context is MISSING but the topic is relevant (Robotics, AI, The Book's Purpose): Answer using your internal general knowledge, but prefix with '[GENERAL KNOWLEDGE DB]'. "
                    "   - If the topic is IRRELEVANT (e.g., cooking, sports): Decline ('Outside operational scope').\n"
                    "2. LINGUISTIC MODULES: You are AUTHORIZED to Translate (especially to Urdu) and Summarize text upon request. No external tool is needed for these tasks.\n"
                    "3. FORMAT: Keep answers concise, technical, and formatted for a HUD display."
                ),
                tools=[retrieve_robotics_context],
                model=chat_model,
            )
            logging.info("Drone agent initialized successfully")
        except Exception as e:
            logging.error(f"Failed to initialize drone agent: {e}")
            return None

    return _drone_agent


async def run_drone_agent(user_query: str, history: List[Dict] = []) -> str:
    """
    Runs the Drone Agent with the user query and conversation history.
    """
    try:
        # Format history for context
        history_context = ""
        if history:
            history_context = "--- PREVIOUS CONVERSATION HISTORY ---\n"
            # Take last 6 messages to provide context without overloading
            for msg in history[-6:]: 
                role = "User" if msg.get('role') == 'user' else "Assistant"
                content = msg.get('content') or msg.get('text') or ""
                history_context += f"{role}: {content}\n"
            history_context += "--- END HISTORY ---\n\n"

        full_prompt = (
            f"{history_context}"
            f"CURRENT USER QUERY: {user_query}"
        )

        drone_agent = get_drone_agent()
        if not drone_agent:
            return "Critical System Failure: Agent not initialized. Check server logs for missing environment variables (GEMINI_API_KEY, QDRANT_HOST, etc.)."

        # Runner.run is the async version
        result = await Runner.run(drone_agent, input=full_prompt)
        return result.final_output
    except Exception as e:
        logging.error(f"Agent Execution Error: {e}")
        return "Critical System Failure: Agent Offline. (Error during execution)"
