import os
import logging
from typing import Optional

from agents import Agent, Runner, AsyncOpenAI, OpenAIChatCompletionsModel
from api.config import settings

# Configure Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configure the Provider (Gemini via OpenAI Interface)
api_key = settings.GEMINI_API_KEY or os.environ.get("GEMINI_API_KEY")

if not api_key:
    logger.warning("GEMINI_API_KEY is not set in settings or env. AI features will fail.")

# Initialize Provider - handle missing key gracefully for build time
if api_key:
    provider = AsyncOpenAI(
        api_key=api_key,
        base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
    )
    model = OpenAIChatCompletionsModel(
        openai_client=provider,
        model="gemini-2.0-flash",
    )
else:
    model = None # Will fail at runtime if used

def load_skill_instructions(skill_name: str) -> str:
    """
    Loads the reusable skill definition from the api/skills directory.
    Parses SKILL.md to extract the system prompt (content after frontmatter).
    """
    # Look for skills in api/skills/ directory (works on Vercel)
    api_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    skill_path = os.path.join(api_dir, "skills", skill_name, "SKILL.md")
    
    logger.info(f"Attempting to load skill '{skill_name}' from: {skill_path}")

    # Fallback to .claude/skills/ for local development if api/skills not found
    if not os.path.exists(skill_path):
        logger.info(f"Skill not found at primary path. Checking local fallback...")
        base_dir = os.path.dirname(api_dir)
        skill_path = os.path.join(base_dir, ".claude", "skills", skill_name, "SKILL.md")
        logger.info(f"Fallback path: {skill_path}")
    
    if not os.path.exists(skill_path):
        logger.error(f"Skill definition not found at: {skill_path}")
        raise FileNotFoundError(f"Skill '{skill_name}' not defined in specs.")

    try:
        with open(skill_path, "r", encoding="utf-8") as f:
            content = f.read()
            
        # Simple Frontmatter Parsing: Split by '---'
        parts = content.split("---", 2)
        if len(parts) >= 3:
            return parts[2].strip()
        else:
            return content.strip()
            
    except Exception as e:
        logger.error(f"Failed to load skill '{skill_name}': {e}")
        raise

async def generate_skill_response(skill_name: str, input_text: str, context: Optional[str] = None) -> str:
    """
    Generates a response using a dynamically loaded AI skill (Agent).
    """
    if not model:
        logger.error("AI Model not initialized. Missing API Key.")
        return "System Error: AI Service Unavailable (Configuration Error)."

    try:
        instructions = load_skill_instructions(skill_name)
    except FileNotFoundError:
        return f"System Error: Skill '{skill_name}' not found."

    # If context is provided (e.g. for personalization), append it to instructions
    if context:
        instructions += f"\n\n**Context/User Preference**: {context}"

    agent_name = skill_name.replace("-", " ").title()
    
    agent = Agent(
        name=agent_name,
        instructions=instructions,
        model=model
    )
    
    logger.info(f"Running Agent '{agent_name}'...")
    
    try:
        result = await Runner.run(agent, input=input_text)
        logger.info(f"Agent '{agent_name}' finished successfully.")
        return str(result.final_output)
    except Exception as e:
        logger.error(f"AI Agent Execution Error ({skill_name}): {e}", exc_info=True)
        return f"Error executing {skill_name}. Detailed Error: {str(e)}"