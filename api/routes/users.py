from typing import List, Dict, Any
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete

from api.dependencies import get_db, get_current_tenant_id, get_current_user_id
from api.models.user import User, UserCreate, UserInDB

router = APIRouter()

@router.get("/me", response_model=UserInDB)
async def read_users_me(
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """
    Get current user.
    """
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")
        
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.get("/me/onboarding")
async def get_onboarding_info(
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """
    Get onboarding info (additional_info).
    """
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")
        
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
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
    Update onboarding info.
    """
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")
        
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    # Update additional_info. Merge or replace? Replace seems safer for this specific flow.
    # But let's merge if it exists to be nice.
    current_info = user.additional_info or {}
    current_info.update(info)
    user.additional_info = current_info
    
    await db.commit()
    await db.refresh(user)
    return {"success": True, "additional_info": user.additional_info}

@router.post("/", response_model=UserInDB, status_code=status.HTTP_201_CREATED)
async def create_user(
    user: UserCreate,
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    """
    Create a new user in the database.
    """
    db_user = User(**user.dict(), tenant_id=tenant_id)
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user


@router.get("/{user_id}", response_model=UserInDB)
async def read_user(user_id: UUID, db: AsyncSession = Depends(get_db)):
    """
    Retrieve a user by their ID.
    """
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
    """
    Update a user's information. RLS in the database ensures that a user can only be updated
    if the request is made with the correct tenant_id.
    """
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
    """
    Delete a user. RLS ensures this can only be done with the correct tenant_id.
    We first check if the user exists to provide a 404, as the DELETE statement
    won't return an error if the row doesn't exist.
    """
    result = await db.execute(select(User).where(User.id == user_id, User.tenant_id == tenant_id))
    db_user = result.scalars().first()

    if db_user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    await db.execute(delete(User).where(User.id == user_id))
    await db.commit()