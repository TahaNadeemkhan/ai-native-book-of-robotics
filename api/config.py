import os

class Settings:
    DATABASE_URL: str = os.environ.get("DATABASE_URL", "postgresql://user:password@host:port/dbname")
    # Add other configuration settings as needed

settings = Settings()
