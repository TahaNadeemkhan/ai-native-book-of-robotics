from typing import Optional
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel

from api.services.ai_service import generate_skill_response
from api.dependencies import get_current_user # Correct import path

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

@router.post("/personalize", response_model=AIResponse)
async def personalize_content(
    request: AIRequest,
    user: dict = Depends(get_current_user) # Require Login
):
    """
    Personalizes content using the 'content-personalizer' skill.
    """
    # In a real app, we might fetch user preferences from DB (user['additional_info'])
    context = request.context or "General Engineering"
    output = await generate_skill_response("content-personalizer", request.content, context)
    return {"output": output}
