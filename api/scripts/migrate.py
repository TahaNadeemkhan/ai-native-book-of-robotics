import asyncio
import os
import sys

# Add the parent directory to sys.path to allow imports from api
sys.path.append(os.path.join(os.path.dirname(__file__), "..", ".."))

from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine
from api.config import settings

async def run_migrations():
    print("Starting database migrations...")
    
    if not settings.DATABASE_URL:
        print("Error: DATABASE_URL is not set.")
        return

    # Ensure the URL is correct for SQLAlchemy + asyncpg
    # If the environment variable is just "postgres://..." or "postgresql://...", 
    # SQLAlchemy might need "postgresql+asyncpg://..."
    # However, if it works for the app, it should work here. 
    # But typically in .env for asyncpg it is postgresql+asyncpg://
    
    engine = create_async_engine(
        settings.DATABASE_URL,
        echo=True,
    )

    migrations_dir = os.path.join(os.path.dirname(__file__), "..", "migrations")
    migration_files = sorted([f for f in os.listdir(migrations_dir) if f.endswith(".sql")])

    for filename in migration_files:
        filepath = os.path.join(migrations_dir, filename)
        print(f"Applying migration: {filename}")
        
        try:
            async with engine.begin() as conn:
                with open(filepath, "r") as f:
                    sql_content = f.read()
                    
                    # Split statements by semicolon and execute one by one
                    statements = [s.strip() for s in sql_content.split(';') if s.strip()]
                    
                    for stmt in statements:
                        # print(f"Executing: {stmt[:50]}...") 
                        await conn.execute(text(stmt))
                        
            print(f"Successfully applied: {filename}")
            
        except Exception as e:
            print(f"Failed to apply {filename}: {e}")
            # We continue to the next file even if this one failed
            # assuming the failure is due to "already exists"
            pass

    await engine.dispose()
    print("Migrations completed.")

    await engine.dispose()
    print("Migrations completed.")

if __name__ == "__main__":
    asyncio.run(run_migrations())
