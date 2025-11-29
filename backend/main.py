from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from sse_starlette.sse import EventSourceResponse
from datetime import datetime
from typing import Dict
import uuid
import json

from models import (
    Message,
    ChatRequest,
    Conversation,
    ConversationCreate,
    ConversationResponse
)
from lm_studio_client import LMStudioClient

app = FastAPI(title="Chat Client API")

# CORS middleware for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage
conversations: Dict[str, Conversation] = {}

# Initialize LM Studio client
lm_client = LMStudioClient()

@app.get("/")
def read_root():
    return {"status": "Chat API is running", "lm_studio_url": "http://localhost:1234/v1"}

@app.get("/api/conversations", response_model=list[ConversationResponse])
def get_conversations():
    """Get all conversations"""
    return [
        ConversationResponse(
            id=conv.id,
            title=conv.title,
            created_at=conv.created_at,
            message_count=len(conv.messages)
        )
        for conv in conversations.values()
    ]

@app.post("/api/conversations", response_model=ConversationResponse)
def create_conversation(data: ConversationCreate):
    """Create a new conversation"""
    conversation_id = str(uuid.uuid4())
    conversation = Conversation(
        id=conversation_id,
        title=data.title or f"Chat {len(conversations) + 1}",
        created_at=datetime.now(),
        messages=[]
    )
    conversations[conversation_id] = conversation
    
    return ConversationResponse(
        id=conversation.id,
        title=conversation.title,
        created_at=conversation.created_at,
        message_count=0
    )

@app.delete("/api/conversations/{conversation_id}")
def delete_conversation(conversation_id: str):
    """Delete a conversation"""
    if conversation_id not in conversations:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    del conversations[conversation_id]
    return {"status": "deleted", "id": conversation_id}

@app.get("/api/conversations/{conversation_id}/messages")
def get_messages(conversation_id: str):
    """Get all messages in a conversation"""
    if conversation_id not in conversations:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    return conversations[conversation_id].messages

@app.post("/api/chat/stream")
async def stream_chat(request: ChatRequest):
    """Stream chat completion from LM Studio"""
    if request.conversation_id not in conversations:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    conversation = conversations[request.conversation_id]
    
    # Add user message to conversation
    user_message = Message(
        role="user",
        content=request.message,
        timestamp=datetime.now()
    )
    conversation.messages.append(user_message)
    
    # Update conversation title if it's the first message
    if len(conversation.messages) == 1:
        # Use first 50 chars of first message as title
        conversation.title = request.message[:50] + ("..." if len(request.message) > 50 else "")
    
    # Prepare messages for LM Studio
    messages_for_lm = [
        {"role": msg.role, "content": msg.content}
        for msg in conversation.messages
    ]
    
    # Stream response
    async def event_generator():
        assistant_message_content = ""
        
        try:
            async for chunk in lm_client.stream_chat_completion(messages_for_lm):
                assistant_message_content += chunk
                yield {
                    "event": "message",
                    "data": json.dumps({"content": chunk})
                }
            
            # Add assistant message to conversation
            assistant_message = Message(
                role="assistant",
                content=assistant_message_content,
                timestamp=datetime.now()
            )
            conversation.messages.append(assistant_message)
            
            # Send completion event
            yield {
                "event": "done",
                "data": json.dumps({"status": "completed"})
            }
            
        except Exception as e:
            yield {
                "event": "error",
                "data": json.dumps({"error": str(e)})
            }
    
    return EventSourceResponse(event_generator())

@app.get("/api/models")
def get_models():
    """Get available models from LM Studio"""
    models = lm_client.get_available_models()
    return {"models": models}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

