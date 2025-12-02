from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base

from api.config import settings

engine = create_async_engine(
    settings.DATABASE_URL,
    echo=True, # Set to True to see SQL queries for debugging
    connect_args={"ssl": "require"}
)

AsyncSessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False, # Important for keeping objects accessible after commit
)

Base = declarative_base()
