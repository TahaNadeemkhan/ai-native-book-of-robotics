from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import List, Optional, Dict

from api.services.rag_service import run_drone_agent
from api.dependencies import get_current_user # Drone requires login

router = APIRouter()

class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    query: str
    history: Optional[List[Message]] = []

class ChatResponse(BaseModel):
    answer: str
    sources: Optional[List[str]] = []

@router.post("/chat", response_model=ChatResponse)
async def drone_chat(
    request: ChatRequest,
    user: dict = Depends(get_current_user)
):
    """
    RAG Chat Endpoint using OpenAI Agents SDK + Gemini.
    """
    # Run the Agent with history
    answer = await run_drone_agent(request.query, [m.model_dump() for m in request.history])
    
    # Return
    return {
        "answer": answer,
        "sources": [] 
    }
