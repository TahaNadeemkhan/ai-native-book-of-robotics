from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from uuid import UUID

from api.database import AsyncSessionLocal
from api.services.auth_service import get_current_tenant_id as auth_service_get_tenant_id

oauth2_scheme = HTTPBearer()

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
