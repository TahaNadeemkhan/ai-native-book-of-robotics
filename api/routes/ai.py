from typing import Optional
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from uuid import UUID, uuid5, NAMESPACE_URL
import hashlib

from api.services.ai_service import generate_skill_response
from api.dependencies import get_current_user, get_db
from api.models.user import User
from api.models.content import PersonalizedPage, Summary, Translation

router = APIRouter()

class AIRequest(BaseModel):
    content: str
    context: Optional[str] = None
    lesson_url: Optional[str] = None  # Changed from lesson_id to lesson_url

class AIResponse(BaseModel):
    output: str

@router.post("/summarize", response_model=AIResponse)
async def summarize_content(
    request: AIRequest,
    user_ctx: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    user_id = user_ctx.get("user_id")
    tenant_id = user_ctx.get("tenant_id")

    if not user_id:
        raise HTTPException(status_code=401, detail="User context missing")

    # Generate deterministic lesson_id from URL
    lesson_id = None
    if request.lesson_url:
        lesson_id = uuid5(NAMESPACE_URL, request.lesson_url)

        # Check Cache
        stmt = select(Summary).where(
            Summary.user_id == user_id,
            Summary.lesson_id == lesson_id
        )
        result = await db.execute(stmt)
        existing_summary = result.scalars().first()

        if existing_summary:
            print(f"[INFO] Returning cached summary for lesson {lesson_id}")
            return {"output": existing_summary.summary_content}

    # Generate Content
    print(f"[INFO] Generating summary for user {user_id}")
    output = await generate_skill_response("lesson-summarizer", request.content)

    # Save to Cache
    if lesson_id:
        try:
            new_summary = Summary(
                user_id=user_id,
                tenant_id=tenant_id,
                lesson_id=lesson_id,
                summary_content=output
            )
            db.add(new_summary)
            await db.commit()
            print(f"[INFO] Cached summary for lesson {lesson_id}")
        except Exception as e:
            await db.rollback()
            print(f"[ERROR] Failed to cache summary: {e}")

    return {"output": output}

@router.post("/translate", response_model=AIResponse)
async def translate_content(
    request: AIRequest,
    user_ctx: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    user_id = user_ctx.get("user_id")
    tenant_id = user_ctx.get("tenant_id")

    if not user_id:
        raise HTTPException(status_code=401, detail="User context missing")

    # Generate deterministic lesson_id from URL
    lesson_id = None
    target_language = "ur"  # Urdu

    if request.lesson_url:
        lesson_id = uuid5(NAMESPACE_URL, request.lesson_url)

        # Check Cache
        stmt = select(Translation).where(
            Translation.user_id == user_id,
            Translation.lesson_id == lesson_id,
            Translation.target_language == target_language
        )
        result = await db.execute(stmt)
        existing_translation = result.scalars().first()

        if existing_translation:
            print(f"[INFO] Returning cached translation for lesson {lesson_id}")
            return {"output": existing_translation.translated_content}

    # Generate Content
    print(f"[INFO] Generating Urdu translation for user {user_id}")
    output = await generate_skill_response("urdu-translator", request.content)

    # Save to Cache
    if lesson_id:
        try:
            new_translation = Translation(
                user_id=user_id,
                tenant_id=tenant_id,
                lesson_id=lesson_id,
                translated_content=output,
                target_language=target_language
            )
            db.add(new_translation)
            await db.commit()
            print(f"[INFO] Cached translation for lesson {lesson_id}")
        except Exception as e:
            await db.rollback()
            print(f"[ERROR] Failed to cache translation: {e}")

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

    # Fetch User Profile
    user_obj = await db.get(User, user_id)
    if not user_obj:
        raise HTTPException(status_code=404, detail="User not found")

    profile_data = user_obj.additional_info or {}

    # Generate deterministic lesson_id from URL
    lesson_id = None
    if request.lesson_url:
        # Create deterministic UUID from lesson URL
        lesson_id = uuid5(NAMESPACE_URL, request.lesson_url)

        # Check Cache
        stmt = select(PersonalizedPage).where(
            PersonalizedPage.user_id == user_id,
            PersonalizedPage.lesson_id == lesson_id
        )
        result = await db.execute(stmt)
        existing_page = result.scalars().first()

        # Verify calibration snapshot matches current profile
        if existing_page:
            # Check if profile has changed
            cached_profile = existing_page.calibration_snapshot or {}
            profile_changed = (
                cached_profile.get("programming_proficiency") != profile_data.get("programming_proficiency") or
                cached_profile.get("ai_proficiency") != profile_data.get("ai_proficiency") or
                cached_profile.get("hardware_info") != profile_data.get("hardware_info")
            )

            if profile_changed:
                # Profile changed - delete old cache
                await db.delete(existing_page)
                await db.commit()
                print(f"[INFO] Profile changed for user {user_id}, invalidated cache for lesson {lesson_id}")
            else:
                # Return cached content
                print(f"[INFO] Returning cached content for lesson {lesson_id}")
                return {"output": existing_page.personalized_content}

    # Build context string
    context_str = "General Engineering"
    if profile_data:
        programming_proficiency = profile_data.get("programming_proficiency", "N/A")
        ai_proficiency = profile_data.get("ai_proficiency", "N/A")
        hardware_info = profile_data.get("hardware_info", "N/A")

        context_str = (
            f"User Profile:\n"
            f"- Programming Level: {programming_proficiency}\n"
            f"- AI Knowledge: {ai_proficiency}\n"
            f"- Hardware: {hardware_info}"
        )

    if request.context:
        context_str += f"\nAdditional Context: {request.context}"

    # Generate Content
    print(f"[INFO] Generating personalized content for user {user_id}")
    output = await generate_skill_response("content-personalizer", request.content, context_str)

    # Save to Cache
    if lesson_id:
        try:
            new_page = PersonalizedPage(
                user_id=user_id,
                tenant_id=tenant_id,
                lesson_id=lesson_id,
                personalized_content=output,
                calibration_snapshot=profile_data
            )
            db.add(new_page)
            await db.commit()
            print(f"[INFO] Cached personalized content for lesson {lesson_id}")
        except Exception as e:
            await db.rollback()
            print(f"[ERROR] Failed to cache personalized content: {e}")
            # Continue anyway - return the generated content even if caching fails
            print(f"[INFO] Returning non-cached personalized content")

    return {"output": output}