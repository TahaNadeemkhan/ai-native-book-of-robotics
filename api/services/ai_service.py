import os
import logging
from typing import Optional

from agents import Agent, Runner, AsyncOpenAI, OpenAIChatCompletionsModel
from api.config import settings

# Configure the Provider (Gemini via OpenAI Interface)
api_key = settings.GEMINI_API_KEY
if not api_key:
    logging.warning("GEMINI_API_KEY is not set in settings. AI features will fail.")

provider = AsyncOpenAI(
    api_key=api_key,
    base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
)

# Initialize the Model
model = OpenAIChatCompletionsModel(
    openai_client=provider,
    model="gemini-2.0-flash",
)

def load_skill_instructions(skill_name: str) -> str:
    """
    Loads the reusable skill definition from the .claude/skills directory.
    Parses SKILL.md to extract the system prompt (content after frontmatter).
    """
    # Determine path relative to the project root (assuming api/services/ is where we are)
    # We need to go up from api/services/ to root, then .claude/skills/
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    skill_path = os.path.join(base_dir, ".claude", "skills", skill_name, "SKILL.md")
    
    if not os.path.exists(skill_path):
        logging.error(f"Skill definition not found at: {skill_path}")
        raise FileNotFoundError(f"Skill '{skill_name}' not defined in specs.")

    try:
        with open(skill_path, "r", encoding="utf-8") as f:
            content = f.read()
            
        # Simple Frontmatter Parsing: Split by '---'
        # Expecting:
        # ---
        # metadata
        # ---
        # instructions
        parts = content.split("---", 2)
        if len(parts) >= 3:
            # valid frontmatter, return the content part (index 2)
            return parts[2].strip()
        else:
            # no frontmatter, return all
            return content.strip()
            
    except Exception as e:
        logging.error(f"Failed to load skill '{skill_name}': {e}")
        raise

async def generate_skill_response(skill_name: str, input_text: str, context: Optional[str] = None) -> str:
    """
    Generates a response using a dynamically loaded AI skill (Agent).
    """
    try:
        instructions = load_skill_instructions(skill_name)
    except FileNotFoundError:
        return f"System Error: Skill '{skill_name}' not found."

    # If context is provided (e.g. for personalization), append it to instructions
    if context:
        instructions += f"\n\n**Context/User Preference**: {context}"

    # Create the Agent with Loaded Instructions
    # We title-case the name for display (e.g. 'urdu-translator' -> 'Urdu Translator')
    agent_name = skill_name.replace("-", " ").title()
    
    agent = Agent(
        name=agent_name,
        instructions=instructions,
        model=model
    )
    
    try:
        result = await Runner.run(agent, input=input_text)
        return str(result.final_output)
    except Exception as e:
        logging.error(f"AI Agent Execution Error ({skill_name}): {e}")
        return f"Error executing {skill_name}. Neural Link Unstable."