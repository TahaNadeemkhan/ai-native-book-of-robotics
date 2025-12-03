import os
from typing import Optional

from dotenv import load_dotenv
from pydantic_settings import BaseSettings, SettingsConfigDict

load_dotenv()


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(__file__), "..", ".env"), extra="ignore"
    )

    DATABASE_URL: Optional[str] = None
    SECRET_KEY: Optional[str] = None
    FRONTEND_URL: Optional[str] = None
    GITHUB_CLIENT_ID: Optional[str] = None
    GITHUB_CLIENT_SECRET: Optional[str] = None
    GITHUB_REDIRECT_URI: Optional[str] = None
    GEMINI_API_KEY: Optional[str] = None
    QDRANT_HOST: Optional[str] = None
    QDRANT_API_KEY: Optional[str] = None
    QDRANT_COLLECTION_NAME: str = "ai_native_book_platform"
    ALGORITHM: str = "HS256" # Default algorithm for JWT
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30 # Default token expiration time

    # Add other configuration settings as needed


settings = Settings()