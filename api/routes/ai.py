from typing import Optional
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import uuid4

from api.services.ai_service import generate_skill_response
from api.dependencies import get_current_user, get_db
from api.models.user import User
from api.models.profile import UserProfile
from api.models.content import PersonalizedPage

router = APIRouter()

class AIRequest(BaseModel):
    content: str
    context: Optional[str] = None
    path: Optional[str] = None

class AIResponse(BaseModel):
    output: str

@router.post("/summarize", response_model=AIResponse)
async def summarize_content(
    request: AIRequest,
    user: dict = Depends(get_current_user)
):
    output = await generate_skill_response("lesson-summarizer", request.content)
    return {"output": output}

@router.post("/translate", response_model=AIResponse)
async def translate_content(
    request: AIRequest,
    user: dict = Depends(get_current_user)
):
    output = await generate_skill_response("urdu-translator", request.content)
    return {"output": output}

@router.post("/personalize-chapter", response_model=AIResponse)
async def personalize_content(
    request: AIRequest,
    user_ctx: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    user_id = user_ctx.get("user_id")
    tenant_id = user_ctx.get("tenant_id")
    
    if not user_id:
        raise HTTPException(status_code=401, detail="User context missing")

    # 1. Check Cache if path is provided
    if request.path:
        stmt = select(PersonalizedPage).where(
            PersonalizedPage.user_id == user_id,
            PersonalizedPage.page_path == request.path
        )
        result = await db.execute(stmt)
        existing_page = result.scalars().first()
        
        if existing_page:
            return {"output": existing_page.personalized_content}

    # 2. Fetch Profile for Context
    result = await db.execute(select(UserProfile).where(UserProfile.user_id == user_id))
    profile = result.scalars().first()
    
    context_str = "General Engineering"
    if profile:
        context_str = (
            f"User Profile:\n"
            f"- Programming Level: {profile.programming_proficiency}\n"
            f"- AI Knowledge: {profile.ai_proficiency}\n"
            f"- Hardware: {profile.hardware_info}"
        )

    if request.context:
        context_str += f"\nAdditional Context: {request.context}"

    # 3. Generate Content
    output = await generate_skill_response("content-personalizer", request.content, context_str)
    
    # 4. Save to Cache if path is provided
    if request.path:
        new_page = PersonalizedPage(
            user_id=user_id,
            tenant_id=tenant_id,
            page_path=request.path,
            personalized_content=output
        )
        db.add(new_page)
        await db.commit()

    return {"output": output}