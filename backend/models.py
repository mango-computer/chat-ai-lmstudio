from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class Message(BaseModel):
    role: str  # "user" or "assistant"
    content: str
    timestamp: Optional[datetime] = None

class ChatRequest(BaseModel):
    conversation_id: str
    message: str

class Conversation(BaseModel):
    id: str
    title: str
    created_at: datetime
    messages: List[Message] = []

class ConversationCreate(BaseModel):
    title: Optional[str] = "New Conversation"

class ConversationResponse(BaseModel):
    id: str
    title: str
    created_at: datetime
    message_count: int

