from typing import Optional
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel
from sqlalchemy import Column, String, DateTime, text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from api.database import Base

class UserProfileBase(BaseModel):
    programming_proficiency: Optional[str] = None
    ai_proficiency: Optional[str] = None
    hardware_info: Optional[str] = None

class UserProfileCreate(UserProfileBase):
    pass

class UserProfileInDB(UserProfileBase):
    id: UUID
    user_id: UUID
    tenant_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=text("gen_random_uuid()"))
    user_id = Column(PG_UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)
    tenant_id = Column(PG_UUID(as_uuid=True), nullable=False)
    programming_proficiency = Column(String, nullable=True)
    ai_proficiency = Column(String, nullable=True)
    hardware_info = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=text("now()"))
    updated_at = Column(DateTime(timezone=True), server_default=text("now()"), onupdate=text("now()"))
