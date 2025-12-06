import asyncio
import os
import sys

# Add the parent directory to sys.path
sys.path.append(os.path.join(os.path.dirname(__file__), "..", ".."))

from sqlalchemy import text, inspect
from sqlalchemy.ext.asyncio import create_async_engine
from api.config import settings

async def check_tables():
    print("Checking database tables...")

    if not settings.DATABASE_URL:
        print("Error: DATABASE_URL is not set.")
        return

    engine = create_async_engine(settings.DATABASE_URL, echo=False)

    try:
        async with engine.begin() as conn:
            # Check lessons table schema
            print("\n=== LESSONS TABLE SCHEMA ===")
            result = await conn.execute(text("""
                SELECT column_name, data_type, is_nullable
                FROM information_schema.columns
                WHERE table_name = 'lessons'
                ORDER BY ordinal_position;
            """))
            columns = result.fetchall()
            for col in columns:
                print(f"  {col[0]}: {col[1]} (nullable: {col[2]})")

            # Count lessons
            result = await conn.execute(text("SELECT COUNT(*) FROM lessons;"))
            count = result.scalar()
            print(f"\n  Total lessons: {count}")

            # Check personalized_pages table schema
            print("\n=== PERSONALIZED_PAGES TABLE SCHEMA ===")
            result = await conn.execute(text("""
                SELECT column_name, data_type, is_nullable
                FROM information_schema.columns
                WHERE table_name = 'personalized_pages'
                ORDER BY ordinal_position;
            """))
            columns = result.fetchall()
            for col in columns:
                print(f"  {col[0]}: {col[1]} (nullable: {col[2]})")

            # Count personalized pages
            result = await conn.execute(text("SELECT COUNT(*) FROM personalized_pages;"))
            count = result.scalar()
            print(f"\n  Total personalized pages: {count}")

            # Sample personalized pages
            if count > 0:
                print("\n  Sample personalized pages:")
                result = await conn.execute(text("""
                    SELECT id, user_id, lesson_id,
                           LENGTH(personalized_content) as content_length,
                           created_at
                    FROM personalized_pages
                    LIMIT 5;
                """))
                pages = result.fetchall()
                for page in pages:
                    print(f"    ID: {page[0]}")
                    print(f"    User ID: {page[1]}")
                    print(f"    Lesson ID: {page[2]}")
                    print(f"    Content length: {page[3]} chars")
                    print(f"    Created: {page[4]}")
                    print()

            # Check users table
            print("\n=== USERS TABLE ===")
            result = await conn.execute(text("SELECT COUNT(*) FROM users;"))
            count = result.scalar()
            print(f"  Total users: {count}")

    except Exception as e:
        print(f"Error: {e}")
    finally:
        await engine.dispose()

if __name__ == "__main__":
    asyncio.run(check_tables())
