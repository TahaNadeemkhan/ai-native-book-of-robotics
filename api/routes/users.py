from typing import List, Dict, Any
from uuid import UUID, uuid4
from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete, update

from api.dependencies import get_db, get_current_tenant_id, get_current_user_id
from api.models.user import User, UserCreate, UserInDB

router = APIRouter()

@router.get("/me", response_model=UserInDB)
async def read_users_me(
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.get("/me/onboarding", response_model=Dict)
async def get_onboarding_info(
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """
    Get onboarding info from user.additional_info.
    """
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")

    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user.additional_info or {}

@router.post("/onboarding")
async def update_onboarding_info(
    info: Dict[str, Any] = Body(...),
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """
    Update onboarding info in user.additional_info.
    """
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")

    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Ensure additional_info is a dictionary
    if user.additional_info is None:
        user.additional_info = {}

    print(f"[DEBUG] Received onboarding info: {info}")

    # Create a new dict to trigger SQLAlchemy's change detection for JSONB
    updated_info = {**user.additional_info, **info}
    user.additional_info = updated_info

    # Explicitly mark the column as modified (required for JSONB columns)
    from sqlalchemy.orm import attributes
    attributes.flag_modified(user, "additional_info")

    print(f"[DEBUG] User additional_info after update: {user.additional_info}")

    await db.commit()
    await db.refresh(user)
    print("[DEBUG] Onboarding data committed and refreshed.")

    return {
        "success": True,
        "additional_info": user.additional_info
    }

@router.post("/", response_model=UserInDB, status_code=status.HTTP_201_CREATED)
async def create_user(
    user: UserCreate,
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    db_user = User(**user.dict(), tenant_id=tenant_id)
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user

@router.get("/{user_id}", response_model=UserInDB)
async def read_user(user_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.id == user_id))
    db_user = result.scalars().first()
    if db_user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return db_user

@router.put("/{user_id}", response_model=UserInDB)
async def update_user(
    user_id: UUID,
    user_update: UserCreate,
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).where(User.id == user_id, User.tenant_id == tenant_id))
    db_user = result.scalars().first()

    if db_user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    update_data = user_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_user, key, value)

    await db.commit()
    await db.refresh(db_user)
    return db_user

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: UUID,
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).where(User.id == user_id, User.tenant_id == tenant_id))
    db_user = result.scalars().first()

    if db_user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    await db.execute(delete(User).where(User.id == user_id))
    await db.commit()
