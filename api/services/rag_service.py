import logging
from typing import List, Dict

from qdrant_client import QdrantClient, models
from openai import AsyncOpenAI

from api.config import settings

# Initialize Qdrant Client
# QdrantClient handles connection pooling internally
qdrant = QdrantClient(
    url=settings.QDRANT_HOST,
    api_key=settings.QDRANT_API_KEY,
)

# Initialize OpenAI Client for Embeddings (Gemini)
ai_client = AsyncOpenAI(
    api_key=settings.GEMINI_API_KEY,
    base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
)

async def get_embedding(text: str) -> List[float]:
    """
    Generates an embedding vector for the given text using Gemini.
    """
    try:
        response = await ai_client.embeddings.create(
            model="text-embedding-004",
            input=text
        )
        return response.data[0].embedding
    except Exception as e:
        logging.error(f"Embedding Generation Error: {e}")
        raise

async def search_knowledge_base(query: str, top_k: int = 3) -> List[Dict]:
    """
    Searches Qdrant for relevant context chunks.
    """
    try:
        # 1. Get Query Embedding
        vector = await get_embedding(query)
        
        # 2. Search Qdrant
        results = qdrant.search(
            collection_name=settings.QDRANT_COLLECTION_NAME,
            query_vector=vector,
            limit=top_k,
        )
        
        # 3. Format Results
        chunks = []
        for res in results:
            chunks.append({
                "content": res.payload.get("content", ""),
                "score": res.score,
                "metadata": res.payload # Include other metadata if available
            })
            
        return chunks
        
    except Exception as e:
        logging.error(f"RAG Search Error: {e}")
        # Return empty list on error to allow graceful degradation (chat without context)
        return []

async def generate_rag_response(query: str, context_chunks: List[Dict]) -> str:
    """
    Generates a chat response using the retrieved context.
    """
    # Construct Context String
    context_text = "\n\n".join([f"- {c['content']}" for c in context_chunks])
    
    system_prompt = (
        "You are an advanced AI Assistant for a Robotics Documentation Platform (The Drone). "
        "Use the following context chunks from the knowledge base to answer the user's question. "
        "If the answer is not in the context, say 'I cannot find that information in the database' "
        "but try to be helpful based on general robotics knowledge if applicable, while noting it's external info. "
        "Keep answers concise, technical, and in a 'Robotic Assistant' tone.\n\n"
        f"CONTEXT DATA:\n{context_text}"
    )
    
    try:
        response = await ai_client.chat.completions.create(
            model="gemini-2.0-flash",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": query}
            ],
            temperature=0.7
        )
        return response.choices[0].message.content
    except Exception as e:
        logging.error(f"RAG Generation Error: {e}")
        return "Error generating response. Communications Systems Offline."
