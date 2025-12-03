from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from uuid import UUID

from api.database import AsyncSessionLocal
from api.services.auth_service import get_current_auth_context, get_current_tenant_id as auth_service_get_tenant_id

oauth2_scheme = HTTPBearer()

# We use a custom dependency for better-auth style cookie support
async def get_db() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        yield session

async def get_current_tenant_id(credentials: HTTPAuthorizationCredentials = Depends(oauth2_scheme)) -> UUID:
    tenant_id = await auth_service_get_tenant_id(credentials.credentials)
    if not tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Not authenticated or tenant ID missing"
        )
    return tenant_id

async def get_current_user(request: Request) -> dict:
    """
    Extracts user from Session Cookie or Bearer Token.
    Returns user context dict {user_id, tenant_id} or raises 401.
    """
    token = request.cookies.get("session_token")
    
    # Fallback to Bearer header
    if not token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Authentication required (No token found)"
        )

    context = await get_current_auth_context(token)
    if not context:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Invalid authentication token"
        )
        
    return context