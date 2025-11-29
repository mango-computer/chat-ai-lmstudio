# 📋 Setup Instructions

Complete step-by-step guide to get your Chat AI client running.

## Prerequisites Checklist

Before you begin, make sure you have:

- [ ] **LM Studio** installed ([Download here](https://lmstudio.ai))
- [ ] **Python 3.9+** installed
- [ ] **Node.js 18+** installed
- [ ] **npm** (comes with Node.js)

## Step 1: Setup LM Studio

1. **Download and Install LM Studio**
   - Visit https://lmstudio.ai
   - Download the version for your OS
   - Install and launch the application

2. **Download a Model**
   - In LM Studio, go to the "Discover" tab
   - Search for a model (recommended: Mistral 7B, Llama 2, or similar)
   - Click download and wait for it to complete

3. **Start the Local Server**
   - Go to the "Local Server" tab in LM Studio
   - Select the model you downloaded
   - Click "Start Server"
   - Verify it says "Server running on http://localhost:1234"
   - Make sure "OpenAI Compatible" mode is enabled

## Step 2: Setup Backend (Python + FastAPI)

### Option A: Using the Startup Script (Recommended)

```bash
# From the client-chat directory
./start-backend.sh
```

The script will:
- Create a virtual environment
- Install all dependencies
- Check LM Studio connection
- Start the FastAPI server

### Option B: Manual Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# On Linux/Mac:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the server
uvicorn main:app --reload
```

### Verify Backend is Running

- Open http://localhost:8000 in your browser
- You should see: `{"status":"Chat API is running",...}`
- Visit http://localhost:8000/docs for API documentation

## Step 3: Setup Frontend (React + Vite)

### Option A: Using the Startup Script (Recommended)

Open a **NEW TERMINAL** (keep the backend running) and run:

```bash
# From the client-chat directory
./start-frontend.sh
```

The script will:
- Install all npm dependencies
- Check backend connection
- Start the Vite dev server

### Option B: Manual Setup

```bash
# Navigate to frontend (in a new terminal)
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

### Access the Application

- Open http://localhost:5173 in your browser
- You should see the Chat AI interface

## Step 4: Start Chatting!

1. **Create a New Conversation**
   - Click the "New Chat" button in the sidebar
   - Or it will create one automatically if none exist

2. **Send Your First Message**
   - Type a message in the input box at the bottom
   - Press Enter to send
   - Watch the AI response stream in real-time!

3. **Manage Conversations**
   - Create multiple conversations with "New Chat"
   - Switch between them by clicking in the sidebar
   - Delete unwanted conversations with the trash icon

## Troubleshooting

### LM Studio Issues

**Problem**: "Connection refused" or "Failed to send message"

**Solutions**:
- Make sure LM Studio is running
- Check that the local server is started (green status)
- Verify it's on port 1234 (default)
- Make sure a model is loaded

**Problem**: Responses are very slow

**Solutions**:
- Close other applications to free up RAM
- Try a smaller model (7B instead of 13B+)
- Check your GPU/CPU usage in LM Studio

### Backend Issues

**Problem**: Backend won't start

**Solutions**:
```bash
# Check Python version
python3 --version  # Should be 3.9 or higher

# Try reinstalling dependencies
cd backend
pip install --upgrade pip
pip install -r requirements.txt
```

**Problem**: Port 8000 already in use

**Solutions**:
```bash
# Find what's using port 8000
lsof -i :8000  # On Mac/Linux
# netstat -ano | findstr :8000  # On Windows

# Kill the process or change the port in main.py
```

### Frontend Issues

**Problem**: Frontend won't start

**Solutions**:
```bash
# Check Node version
node --version  # Should be 18 or higher

# Clear node_modules and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install
```

**Problem**: "Failed to fetch" errors in browser

**Solutions**:
- Make sure backend is running on http://localhost:8000
- Check browser console for CORS errors
- Verify the API_BASE_URL in `frontend/src/services/api.js`

**Problem**: Styles not loading properly

**Solutions**:
```bash
cd frontend
npm install -D tailwindcss postcss autoprefixer
npm run dev
```

### Network/Connection Issues

**Problem**: Can't connect frontend to backend

**Solutions**:
1. Check both servers are running:
   - Backend: http://localhost:8000
   - Frontend: http://localhost:5173

2. Check browser console for errors

3. Try restarting both servers

4. Check firewall settings

## Testing the Complete Stack

Here's a quick test to verify everything works:

1. **Test LM Studio**:
   ```bash
   curl http://localhost:1234/v1/models
   ```
   Should return a list of models

2. **Test Backend**:
   ```bash
   curl http://localhost:8000
   ```
   Should return JSON with status

3. **Test Frontend**:
   - Open http://localhost:5173
   - Open browser DevTools (F12)
   - Check Console for errors

4. **Test Full Flow**:
   - Create a new chat
   - Send a message like "Hello, how are you?"
   - Verify you get a streaming response

## Quick Reference

### Starting the Application

**Terminal 1** (Backend):
```bash
cd /path/to/client-chat
./start-backend.sh
```

**Terminal 2** (Frontend):
```bash
cd /path/to/client-chat
./start-frontend.sh
```

**LM Studio**: Make sure it's running with server started

### Stopping the Application

- Press `Ctrl+C` in each terminal to stop the servers
- Stop LM Studio server in the app

### URLs

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **LM Studio**: http://localhost:1234

## Advanced Configuration

### Changing Ports

**Backend** (`backend/main.py`, bottom of file):
```python
uvicorn.run(app, host="0.0.0.0", port=8000)  # Change 8000
```

**Frontend** (`frontend/src/services/api.js`):
```javascript
const API_BASE_URL = 'http://localhost:8000';  // Update if you changed backend port
```

### Model Settings

Edit `backend/lm_studio_client.py` to adjust:
- `temperature`: Controls randomness (0.0-1.0)
- `max_tokens`: Maximum response length
- `base_url`: LM Studio URL if not default

### UI Customization

Edit `frontend/tailwind.config.js` for theme colors:
```javascript
colors: {
  primary: '#6366f1',    // Change these
  secondary: '#8b5cf6',  // Change these
  // ...
}
```

## Need Help?

1. Check the main README.md for detailed information
2. Review the API documentation at http://localhost:8000/docs
3. Check LM Studio documentation
4. Review browser console for frontend errors
5. Check terminal logs for backend errors

## Next Steps

Once everything is working:
- Try different models in LM Studio
- Experiment with multiple conversations
- Customize the UI colors
- Add your own features!

---

Happy chatting! 🚀

