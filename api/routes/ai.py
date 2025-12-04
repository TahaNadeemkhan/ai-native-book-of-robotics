from typing import Optional
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from api.services.ai_service import generate_skill_response
from api.dependencies import get_current_user, get_db
from api.models.user import User

router = APIRouter()

class AIRequest(BaseModel):
    content: str
    context: Optional[str] = None

class AIResponse(BaseModel):
    output: str

@router.post("/summarize", response_model=AIResponse)
async def summarize_content(
    request: AIRequest,
    user: dict = Depends(get_current_user) # Require Login
):
    """
    Generates a summary using the 'lesson-summarizer' skill.
    """
    output = await generate_skill_response("lesson-summarizer", request.content)
    return {"output": output}

@router.post("/translate", response_model=AIResponse)
async def translate_content(
    request: AIRequest,
    user: dict = Depends(get_current_user) # Require Login
):
    """
    Translates content using the 'urdu-translator' skill.
    """
    output = await generate_skill_response("urdu-translator", request.content)
    return {"output": output}

@router.post("/personalize-chapter", response_model=AIResponse)
async def personalize_content(
    request: AIRequest,
    user_ctx: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Personalizes content using the 'content-personalizer' skill.
    Fetches user onboarding data to tailor the response.
    """
    user_id = user_ctx.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="User context missing")

    # Fetch user profile
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    
    context_str = "General Engineering"
    if user and user.additional_info:
        info = user.additional_info
        # Construct a rich context string from the JSON
        context_str = (
            f"User Profile:\n"
            f"- Programming Level: {info.get('programming_proficiency', 'Unknown')}\n"
            f"- AI Knowledge: {info.get('ai_proficiency', 'Unknown')}\n"
            f"- Hardware: {info.get('hardware_info', 'Generic')}"
        )

    # If client provided extra context (e.g., specific question), append it
    if request.context:
        context_str += f"\nAdditional Context: {request.context}"

    output = await generate_skill_response("content-personalizer", request.content, context_str)
    return {"output": output}
