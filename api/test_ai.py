#!/usr/bin/env python3
"""
Quick test script to verify AI service is working
"""
import asyncio
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from api.services.ai_service import generate_skill_response

async def test_skills():
    print("Testing AI Skills...")
    print("=" * 60)

    # Test 1: Lesson Summarizer
    print("\n1. Testing lesson-summarizer...")
    try:
        result = await generate_skill_response(
            "lesson-summarizer",
            "In this tutorial, we will learn about FastAPI. FastAPI is a modern web framework for building APIs with Python. It's fast, easy to use, and provides automatic documentation."
        )
        print("✓ Summarizer Result:")
        print(result)
    except Exception as e:
        print(f"✗ Summarizer Error: {e}")

    # Test 2: Content Personalizer
    print("\n2. Testing content-personalizer...")
    try:
        context = """User Profile:
- Programming Level: Beginner
- AI Knowledge: Beginner
- Hardware: NVIDIA Jetson Orin"""

        result = await generate_skill_response(
            "content-personalizer",
            "To train a neural network, we use gradient descent to minimize the loss function.",
            context
        )
        print("✓ Personalizer Result:")
        print(result)
    except Exception as e:
        print(f"✗ Personalizer Error: {e}")

    # Test 3: Urdu Translator
    print("\n3. Testing urdu-translator...")
    try:
        result = await generate_skill_response(
            "urdu-translator",
            "To create a new user, we use the signUp function provided by better-auth."
        )
        print("✓ Translator Result:")
        print(result)
    except Exception as e:
        print(f"✗ Translator Error: {e}")

    print("\n" + "=" * 60)
    print("Tests completed!")

if __name__ == "__main__":
    asyncio.run(test_skills())
