from typing import Optional
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import Column, String, DateTime, text, Boolean
from sqlalchemy.dialects.postgresql import JSONB, UUID as PG_UUID
from api.database import Base

class UserBase(BaseModel):
    email: EmailStr
    display_name: Optional[str] = None
    additional_info: Optional[dict] = Field(default_factory=dict) # JSONB field

class UserCreate(UserBase):
    password: Optional[str] = None # For email/password signup
    github_id: Optional[str] = None
    google_id: Optional[str] = None

class UserInDB(UserBase):
    id: UUID
    tenant_id: UUID
    github_id: Optional[str] = None
    google_id: Optional[str] = None
    email_verified: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class User(Base):
    __tablename__ = "users"

    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=text("gen_random_uuid()"))
    tenant_id = Column(PG_UUID(as_uuid=True), nullable=False)
    
    # Provider IDs
    github_id = Column(String, unique=True, index=True, nullable=True)
    google_id = Column(String, unique=True, index=True, nullable=True)

    # Core Credentials
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=True)
    email_verified = Column(Boolean, default=False, nullable=False)
    
    # Profile
    display_name = Column(String, nullable=True)
    additional_info = Column(JSONB, nullable=True, default=lambda: {})
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=text("now()"))
    updated_at = Column(DateTime(timezone=True), server_default=text("now()"), onupdate=text("now()"))