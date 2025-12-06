import asyncio
import sys
import os

# Add parent directory to path so we can import api modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from api.services.rag_service import run_drone_agent

async def main():
    print("Initiating Drone Agent Test Sequence...")
    try:
        # Test a simple query that might trigger the tool or just general chat
        query = "Who are you?" 
        print(f"Query: {query}")
        response = await run_drone_agent(query)
        print(f"\nResponse received:\n{response}")
        
        print("\n--------------------------------\n")
        
        # Test a query that requires context (assuming Qdrant has data or handles empty gracefully)
        query_tech = "Tell me about the hardware requirements."
        print(f"Query: {query_tech}")
        response_tech = await run_drone_agent(query_tech)
        print(f"\nResponse received:\n{response_tech}")
        
    except Exception as e:
        print(f"\n[ERROR] Test Failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())

