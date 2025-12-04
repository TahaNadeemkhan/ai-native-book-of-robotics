from uuid import UUID
from datetime import datetime
from pydantic import BaseModel
from sqlalchemy import Column, String, DateTime, text, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from api.database import Base

class PersonalizedPageBase(BaseModel):
    page_path: str
    personalized_content: str

class PersonalizedPageCreate(PersonalizedPageBase):
    pass

class PersonalizedPageInDB(PersonalizedPageBase):
    id: UUID
    user_id: UUID
    tenant_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True

class PersonalizedPage(Base):
    __tablename__ = "personalized_pages"

    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=text("gen_random_uuid()"))
    user_id = Column(PG_UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    tenant_id = Column(PG_UUID(as_uuid=True), nullable=False)
    page_path = Column(String, nullable=False)
    personalized_content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=text("now()"))
