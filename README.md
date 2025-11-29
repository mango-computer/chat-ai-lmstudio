# Chat AI - Modern LM Studio Client

A beautiful, modern chat client that connects to LM Studio for AI-powered conversations. Built with React + Vite + Tailwind CSS (frontend) and FastAPI (backend).

![Chat AI](https://img.shields.io/badge/Status-Ready-success)
![Python](https://img.shields.io/badge/Python-3.9+-blue)
![React](https://img.shields.io/badge/React-18+-61dafb)

## Features

### ✨ Modern UI
- Beautiful dark theme with gradient accents
- Smooth animations and transitions
- Responsive design (mobile & desktop)
- Collapsible sidebar for more space

### 💬 Chat Capabilities
- Real-time streaming responses from AI
- Multiple conversation management
- Automatic conversation titling
- Message history persistence

### 🚀 Performance
- Fast Vite build system
- Efficient state management with React Context
- Server-Sent Events (SSE) for streaming
- Optimized for low latency

## Architecture

```
client-chat/
├── backend/                 # Python FastAPI backend
│   ├── main.py             # FastAPI server
│   ├── models.py           # Pydantic models
│   ├── lm_studio_client.py # LM Studio integration
│   └── requirements.txt    # Python dependencies
│
└── frontend/               # React + Vite frontend
    ├── src/
    │   ├── components/     # React components
    │   ├── contexts/       # Context providers
    │   ├── services/       # API services
    │   └── App.jsx         # Main app
    └── package.json
```

## Prerequisites

1. **LM Studio** - Download and install from [lmstudio.ai](https://lmstudio.ai)
2. **Python 3.9+** - For the backend
3. **Node.js 18+** - For the frontend
4. **npm or yarn** - Package manager

## Quick Start

### 1. Start LM Studio

1. Open LM Studio
2. Download and load a model (e.g., Mistral, Llama, etc.)
3. Start the local server (it should run on `http://localhost:1234`)
4. Make sure the server is using the OpenAI-compatible API format

### 2. Setup and Run Backend

```bash
# Navigate to backend directory
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Start the FastAPI server
uvicorn main:app --reload
```

The backend will run on `http://localhost:8000`

**API Documentation**: Visit `http://localhost:8000/docs` for interactive API documentation

### 3. Setup and Run Frontend

```bash
# Navigate to frontend directory (in a new terminal)
cd frontend

# Install npm dependencies
npm install

# Start the development server
npm run dev
```

The frontend will run on `http://localhost:5173`

### 4. Start Chatting!

Open your browser to `http://localhost:5173` and start chatting with AI!

## Usage

### Creating Conversations
- Click "New Chat" button in the sidebar
- Start typing your message and press Enter

### Managing Conversations
- Click on any conversation in the sidebar to switch
- Hover over a conversation and click the trash icon to delete
- Conversations are automatically titled based on the first message

### Sending Messages
- Type your message in the input box
- Press **Enter** to send
- Press **Shift + Enter** for a new line
- Wait for streaming responses to complete before sending new messages

### Sidebar
- Click the arrow icon to collapse/expand the sidebar
- Collapsed mode shows icons only for more chat space

## Configuration

### Backend Configuration

Edit `backend/main.py` to change:
- CORS origins (line 24-25)
- Server host/port (bottom of file)

Edit `backend/lm_studio_client.py` to change:
- LM Studio URL (default: `http://localhost:1234/v1`)
- Model parameters (temperature, max_tokens)

### Frontend Configuration

Edit `frontend/src/services/api.js` to change:
- Backend URL (default: `http://localhost:8000`)

Edit `frontend/tailwind.config.js` to customize:
- Colors and theme
- Spacing and sizing

## API Endpoints

### Conversations
- `GET /api/conversations` - List all conversations
- `POST /api/conversations` - Create new conversation
- `DELETE /api/conversations/{id}` - Delete conversation
- `GET /api/conversations/{id}/messages` - Get messages

### Chat
- `POST /api/chat/stream` - Stream chat completion (SSE)

### Models
- `GET /api/models` - Get available models from LM Studio

## Development

### Backend Development

```bash
cd backend

# Run with auto-reload
uvicorn main:app --reload --log-level debug

# Run tests (if you add them)
pytest
```

### Frontend Development

```bash
cd frontend

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## Troubleshooting

### Backend Issues

**"Connection refused" errors**
- Make sure LM Studio is running and the local server is started
- Check that LM Studio is running on port 1234
- Verify a model is loaded in LM Studio

**"CORS errors"**
- Check that frontend URL is in the CORS allow_origins list in `backend/main.py`

### Frontend Issues

**"Failed to fetch" errors**
- Make sure the backend is running on port 8000
- Check the API_BASE_URL in `frontend/src/services/api.js`

**Streaming not working**
- Check browser console for SSE connection errors
- Verify the backend is sending proper SSE format

**Styles not loading**
- Run `npm install` again to ensure Tailwind is installed
- Check that `index.css` imports are correct

## Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **OpenAI Python SDK** - For LM Studio integration
- **Pydantic** - Data validation
- **SSE-Starlette** - Server-Sent Events support
- **Uvicorn** - ASGI server

### Frontend
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Context API** - State management
- **Native Fetch API** - HTTP requests

## Project Structure

### Backend Files

```
backend/
├── main.py                 # Main FastAPI application
├── models.py               # Pydantic data models
├── lm_studio_client.py     # LM Studio API client
├── requirements.txt        # Python dependencies
└── README.md              # Backend documentation
```

### Frontend Files

```
frontend/
├── src/
│   ├── components/
│   │   ├── Sidebar.jsx          # Conversation list sidebar
│   │   ├── ChatWindow.jsx       # Main chat area
│   │   ├── Message.jsx          # Message bubble component
│   │   ├── MessageInput.jsx     # Input field with send button
│   │   └── StreamingMessage.jsx # Real-time streaming display
│   ├── contexts/
│   │   └── ChatContext.jsx      # Global state management
│   ├── services/
│   │   └── api.js              # Backend API integration
│   ├── App.jsx                 # Root component
│   ├── main.jsx               # React entry point
│   └── index.css              # Global styles + Tailwind
├── index.html                 # HTML template
├── tailwind.config.js         # Tailwind configuration
├── vite.config.js            # Vite configuration
└── package.json              # npm dependencies
```

## Features in Detail

### Real-time Streaming
The app uses Server-Sent Events (SSE) to stream responses from the AI in real-time, providing a smooth and responsive user experience.

### Conversation Management
- Conversations are stored in-memory on the backend
- Each conversation has a unique ID
- Messages are persisted per conversation
- Automatic title generation from first message

### Beautiful UI
- Dark theme optimized for long reading sessions
- Gradient accents for visual appeal
- Custom scrollbars for consistency
- Smooth animations for better UX
- Responsive design works on all screen sizes

### Error Handling
- Network errors are caught and displayed
- LM Studio connection issues are reported
- Graceful degradation when backend is unavailable

## Future Enhancements

Potential features for future versions:
- [ ] Persistent storage (SQLite/PostgreSQL)
- [ ] User authentication
- [ ] Model selection in UI
- [ ] Export conversations
- [ ] Code syntax highlighting
- [ ] Image support
- [ ] Voice input
- [ ] Dark/Light theme toggle
- [ ] Conversation search
- [ ] Message editing and regeneration

## License

This project is open source and available for educational and personal use.

## Support

For issues, questions, or contributions:
1. Check the troubleshooting section above
2. Review LM Studio documentation
3. Check the API documentation at `http://localhost:8000/docs`

## Credits

Built with modern web technologies and love for AI ❤️

---

**Note**: This is a test project for connecting to LM Studio. For production use, consider adding authentication, persistent storage, and additional security measures.

