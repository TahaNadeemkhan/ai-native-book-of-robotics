from typing import Optional
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field


class UserBase(BaseModel):
    email: EmailStr
    display_name: Optional[str] = None
    additional_info: Optional[dict] = Field(default_factory=dict) # JSONB field


class UserCreate(UserBase):
    github_id: Optional[str] = None


class UserInDB(UserBase):
    id: UUID
    tenant_id: UUID
    github_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
