# Chat Backend API

FastAPI backend that connects to LM Studio for chat completions.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Make sure LM Studio is running on `http://localhost:1234` with a model loaded

3. Start the server:
```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`

## API Documentation

Once running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Endpoints

- `GET /api/conversations` - List all conversations
- `POST /api/conversations` - Create new conversation
- `DELETE /api/conversations/{id}` - Delete conversation
- `GET /api/conversations/{id}/messages` - Get messages
- `POST /api/chat/stream` - Stream chat completion (SSE)
- `GET /api/models` - Get available models

