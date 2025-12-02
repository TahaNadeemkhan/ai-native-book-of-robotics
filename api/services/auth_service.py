import os
from datetime import datetime, timedelta
from typing import Optional, Dict
from uuid import UUID, uuid4

import jwt
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from api.models.user import User, UserCreate, UserInDB
from api.config import settings

# Configuration for JWT
ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES
ALGORITHM = settings.ALGORITHM
SECRET_KEY = settings.SECRET_KEY


async def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


async def authenticate_github_user_and_create_token(
    db: AsyncSession, github_id: str, email: str, display_name: Optional[str] = None
) -> str:
    """
    Authenticates a GitHub user, creates or updates their record in the DB,
    and generates an application-specific JWT.
    """
    # Try to find an existing user by GitHub ID
    result = await db.execute(select(User).where(User.github_id == github_id))
    user = result.scalars().first()

    if not user:
        # If user doesn't exist, create a new one.
        # For now, tenant_id is generated uniquely for each new user.
        # In a real multi-tenant app, this might come from an invitation or organization.
        user_data = UserCreate(email=email, display_name=display_name, github_id=github_id)
        user = User(**user_data.dict(), tenant_id=uuid4()) # Assign a new unique tenant_id
        db.add(user)
        await db.commit()
        await db.refresh(user)
    else:
        # User exists, update details if necessary
        # For simplicity, we'll just update display name and email if they changed
        if user.email != email:
            user.email = email
        if user.display_name != display_name:
            user.display_name = display_name
        # Note: tenant_id and github_id should not change after initial creation
        await db.commit()
        await db.refresh(user)

    # Generate JWT token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = await create_access_token(
        data={"sub": str(user.id), "tenant_id": str(user.tenant_id)},
        expires_delta=access_token_expires,
    )
    return access_token


async def get_current_auth_context(token: Optional[str] = None) -> Optional[Dict]:
    """
    Validates a JWT token and returns the user_id and tenant_id from it.
    Replaces the dummy token logic.
    """
    if token:
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            user_id: str = payload.get("sub")
            tenant_id: str = payload.get("tenant_id")
            if user_id is None or tenant_id is None:
                return None
            return {"user_id": UUID(user_id), "tenant_id": UUID(tenant_id)}
        except jwt.PyJWTError:
            return None
    return None


async def is_authenticated(token: Optional[str] = None) -> bool:
    return await get_current_auth_context(token) is not None


async def get_current_user_id(token: Optional[str] = None) -> Optional[UUID]:
    context = await get_current_auth_context(token)
    return context.get("user_id") if context else None


async def get_current_tenant_id(token: Optional[str] = None) -> Optional[UUID]:
    context = await get_current_auth_context(token)
    return context.get("tenant_id") if context else None