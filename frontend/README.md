# Chat AI Frontend

Modern, elegant chat client built with React, Vite, and Tailwind CSS.

## Features

- 🎨 Beautiful dark theme with gradient accents
- 💬 Real-time streaming responses from AI
- 📱 Responsive design (mobile & desktop)
- 🗂️ Multiple conversation management
- ✨ Smooth animations and transitions
- 🚀 Fast performance with Vite

## Setup

1. Install dependencies:
```bash
npm install
```

2. Make sure the backend is running at `http://localhost:8000`

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to `http://localhost:5173`

## Build for Production

```bash
npm run build
npm run preview
```

## Tech Stack

- **React** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Context API** - State management
- **Server-Sent Events (SSE)** - Real-time streaming

## Project Structure

```
src/
├── components/
│   ├── Sidebar.jsx          # Conversation list
│   ├── ChatWindow.jsx       # Main chat interface
│   ├── Message.jsx          # Individual message
│   ├── MessageInput.jsx     # Text input
│   └── StreamingMessage.jsx # Real-time message display
├── contexts/
│   └── ChatContext.jsx      # Global state management
├── services/
│   └── api.js              # Backend API calls
├── App.jsx                 # Main app component
├── main.jsx               # Entry point
└── index.css              # Global styles
```
