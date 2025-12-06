from uuid import UUID
from datetime import datetime
from pydantic import BaseModel
from sqlalchemy import Column, String, DateTime, text, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID as PG_UUID, JSONB
from api.database import Base

class PersonalizedPageBase(BaseModel):
    lesson_id: UUID
    personalized_content: str
    calibration_snapshot: dict # JSONB type will be handled by SQLAlchemy

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
    # lesson_id is a deterministic UUID5 from lesson URL, not a real FK to lessons table
    lesson_id = Column(PG_UUID(as_uuid=True), nullable=False, index=True)
    personalized_content = Column(Text, nullable=False)
    calibration_snapshot = Column(JSONB, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=text("now()"))

# Summary Model
class SummaryBase(BaseModel):
    lesson_id: UUID
    summary_content: str

class SummaryCreate(SummaryBase):
    pass

class SummaryInDB(SummaryBase):
    id: UUID
    user_id: UUID
    tenant_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class Summary(Base):
    __tablename__ = "summaries"

    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=text("gen_random_uuid()"))
    user_id = Column(PG_UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    tenant_id = Column(PG_UUID(as_uuid=True), nullable=False)
    # lesson_id is a deterministic UUID5 from lesson URL, not a real FK to lessons table
    lesson_id = Column(PG_UUID(as_uuid=True), nullable=False, index=True)
    summary_content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=text("now()"))
    updated_at = Column(DateTime(timezone=True), server_default=text("now()"), onupdate=text("now()"))

# Translation Model
class TranslationBase(BaseModel):
    lesson_id: UUID
    translated_content: str
    target_language: str = "ur"

class TranslationCreate(TranslationBase):
    pass

class TranslationInDB(TranslationBase):
    id: UUID
    user_id: UUID
    tenant_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class Translation(Base):
    __tablename__ = "translations"

    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=text("gen_random_uuid()"))
    user_id = Column(PG_UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    tenant_id = Column(PG_UUID(as_uuid=True), nullable=False)
    # lesson_id is a deterministic UUID5 from lesson URL, not a real FK to lessons table
    lesson_id = Column(PG_UUID(as_uuid=True), nullable=False, index=True)
    translated_content = Column(Text, nullable=False)
    target_language = Column(String(10), default="ur", nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=text("now()"))
    updated_at = Column(DateTime(timezone=True), server_default=text("now()"), onupdate=text("now()"))
