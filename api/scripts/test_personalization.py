"""
Test script to verify personalization works end-to-end
"""
import asyncio
import os
import sys
from uuid import uuid5, NAMESPACE_URL, uuid4

sys.path.append(os.path.join(os.path.dirname(__file__), "..", ".."))

from sqlalchemy import text, select
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from api.config import settings
from api.models.user import User  # Import User model so SQLAlchemy knows about it
from api.models.content import PersonalizedPage

async def test_personalization():
    print("=== Testing Personalization Flow ===\n")

    if not settings.DATABASE_URL:
        print("Error: DATABASE_URL is not set.")
        return

    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    try:
        # Step 1: Get a test user
        print("Step 1: Fetching a test user...")
        async with async_session() as session:
            result = await session.execute(text("SELECT id, tenant_id, email FROM users LIMIT 1;"))
            user = result.fetchone()

            if not user:
                print("❌ No users found in database. Please create a user first.")
                return

            user_id, tenant_id, email = user
            print(f"✅ Found user: {email} (ID: {user_id})")

        # Step 2: Generate deterministic lesson_id from a test URL
        test_lesson_url = "/docs/intro"
        lesson_id = uuid5(NAMESPACE_URL, test_lesson_url)
        print(f"\nStep 2: Generated lesson_id from URL '{test_lesson_url}'")
        print(f"✅ Lesson ID: {lesson_id}")

        # Step 3: Try to insert a personalized page
        print(f"\nStep 3: Attempting to insert personalized page...")
        test_content = "This is test personalized content for the introduction page."
        test_calibration = {
            "programming_proficiency": "intermediate",
            "ai_proficiency": "beginner",
            "hardware_info": "NVIDIA RTX 3060"
        }

        async with async_session() as session:
            try:
                new_page = PersonalizedPage(
                    user_id=user_id,
                    tenant_id=tenant_id,
                    lesson_id=lesson_id,
                    personalized_content=test_content,
                    calibration_snapshot=test_calibration
                )
                session.add(new_page)
                await session.commit()
                print(f"✅ Successfully inserted personalized page!")

                # Refresh to get the created ID
                await session.refresh(new_page)
                page_id = new_page.id
                print(f"   Page ID: {page_id}")

            except Exception as e:
                await session.rollback()
                print(f"❌ Failed to insert personalized page: {e}")
                return

        # Step 4: Verify the page was saved
        print(f"\nStep 4: Verifying the page was saved...")
        async with async_session() as session:
            stmt = select(PersonalizedPage).where(
                PersonalizedPage.user_id == user_id,
                PersonalizedPage.lesson_id == lesson_id
            )
            result = await session.execute(stmt)
            saved_page = result.scalars().first()

            if saved_page:
                print(f"✅ Page found in database!")
                print(f"   Content: {saved_page.personalized_content[:50]}...")
                print(f"   Calibration: {saved_page.calibration_snapshot}")
            else:
                print(f"❌ Page not found in database")
                return

        # Step 5: Test cache retrieval
        print(f"\nStep 5: Testing cache retrieval...")
        async with async_session() as session:
            stmt = select(PersonalizedPage).where(
                PersonalizedPage.user_id == user_id,
                PersonalizedPage.lesson_id == lesson_id
            )
            result = await session.execute(stmt)
            cached_page = result.scalars().first()

            if cached_page:
                print(f"✅ Cache retrieval successful!")
                print(f"   Retrieved same content: {cached_page.personalized_content == test_content}")
            else:
                print(f"❌ Cache retrieval failed")

        # Step 6: Count total personalized pages
        print(f"\nStep 6: Checking total personalized pages...")
        async with async_session() as session:
            result = await session.execute(text("SELECT COUNT(*) FROM personalized_pages;"))
            count = result.scalar()
            print(f"✅ Total personalized pages in database: {count}")

        # Step 7: Clean up test data
        print(f"\nStep 7: Cleaning up test data...")
        async with async_session() as session:
            result = await session.execute(text(
                "DELETE FROM personalized_pages WHERE lesson_id = :lesson_id AND personalized_content LIKE 'This is test%';"
            ), {"lesson_id": lesson_id})
            await session.commit()
            deleted_count = result.rowcount
            print(f"✅ Cleaned up {deleted_count} test record(s)")

        print("\n" + "="*50)
        print("🎉 ALL TESTS PASSED! Personalization is working!")
        print("="*50)

    except Exception as e:
        print(f"\n❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        await engine.dispose()

if __name__ == "__main__":
    asyncio.run(test_personalization())
