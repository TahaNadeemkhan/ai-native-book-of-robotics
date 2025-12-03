from fastapi import APIRouter, Depends
from pydantic import BaseModel

from api.services.rag_service import search_knowledge_base, generate_rag_response
from api.dependencies import get_current_user # Drone requires login

router = APIRouter()

class ChatRequest(BaseModel):
    query: str

class ChatResponse(BaseModel):
    answer: str
    sources: list

@router.post("/chat", response_model=ChatResponse)
async def drone_chat(
    request: ChatRequest,
    user: dict = Depends(get_current_user)
):
    """
    RAG Chat Endpoint.
    1. Searches Knowledge Base.
    2. Generates Response.
    """
    # 1. Search
    chunks = await search_knowledge_base(request.query)
    
    # 2. Generate
    answer = await generate_rag_response(request.query, chunks)
    
    # 3. Return
    return {
        "answer": answer,
        "sources": [c['content'][:100] + "..." for c in chunks] # Return snippets as sources
    }
