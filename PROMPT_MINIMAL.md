# Prompt Ultra Compacto para Modelos con Contexto Limitado

Para modelos con 4096 tokens o menos. Ejecutar cada prompt por separado.

---

## FASE 1: ESTRUCTURA

```
Crea carpetas: client-chat/backend/ y client-chat/frontend/

Crea backend/requirements.txt:
fastapi==0.115.5
uvicorn==0.32.1
openai==1.58.1
pydantic==2.10.3
sse-starlette==2.2.1
httpx==0.27.2
```

---

## FASE 2: BACKEND MODELOS

```
Crea backend/models.py:

from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class Message(BaseModel):
    role: str
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
```

---

## FASE 3: BACKEND CLIENTE LM

```
Crea backend/lm_studio_client.py:

from openai import OpenAI
import asyncio

class LMStudioClient:
    def __init__(self):
        self.client = OpenAI(base_url="http://localhost:1234/v1", api_key="lm-studio")
    
    async def stream_chat_completion(self, messages):
        loop = asyncio.get_event_loop()
        stream = await loop.run_in_executor(
            None,
            lambda: self.client.chat.completions.create(
                model="local-model", messages=messages, stream=True
            )
        )
        for chunk in stream:
            if chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content
```

---

## FASE 4: BACKEND API (parte 1)

```
Crea backend/main.py inicio:

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sse_starlette.sse import EventSourceResponse
from datetime import datetime
from typing import Dict
import uuid, json
from models import *
from lm_studio_client import LMStudioClient

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:5173"], 
                   allow_methods=["*"], allow_headers=["*"])

conversations: Dict[str, Conversation] = {}
lm_client = LMStudioClient()

@app.get("/")
def root():
    return {"status": "running"}
```

---

## FASE 5: BACKEND API (parte 2)

```
Agrega a backend/main.py:

@app.get("/api/conversations")
def get_conversations():
    return [ConversationResponse(id=c.id, title=c.title, 
            created_at=c.created_at, message_count=len(c.messages)) 
            for c in conversations.values()]

@app.post("/api/conversations")
def create_conversation(data: ConversationCreate):
    cid = str(uuid.uuid4())
    conversations[cid] = Conversation(id=cid, title=data.title, 
                                      created_at=datetime.now(), messages=[])
    return ConversationResponse(id=cid, title=data.title, 
                                created_at=datetime.now(), message_count=0)

@app.delete("/api/conversations/{cid}")
def delete_conversation(cid: str):
    if cid in conversations:
        del conversations[cid]
    return {"status": "deleted"}

@app.get("/api/conversations/{cid}/messages")
def get_messages(cid: str):
    return conversations[cid].messages if cid in conversations else []
```

---

## FASE 6: BACKEND STREAMING

```
Agrega a backend/main.py:

@app.post("/api/chat/stream")
async def stream_chat(req: ChatRequest):
    conv = conversations[req.conversation_id]
    conv.messages.append(Message(role="user", content=req.message, 
                                 timestamp=datetime.now()))
    
    if len(conv.messages) == 1:
        conv.title = req.message[:50]
    
    msgs = [{"role": m.role, "content": m.content} for m in conv.messages]
    
    async def gen():
        full = ""
        async for chunk in lm_client.stream_chat_completion(msgs):
            full += chunk
            yield {"event": "message", "data": json.dumps({"content": chunk})}
        conv.messages.append(Message(role="assistant", content=full, 
                                     timestamp=datetime.now()))
        yield {"event": "done", "data": json.dumps({"status": "completed"})}
    
    return EventSourceResponse(gen())
```

---

## FASE 7: FRONTEND CONFIG

```
Ejecutar manualmente:
npm create vite@latest frontend -- --template react
cd frontend
npm install -D tailwindcss@3.4.15 postcss autoprefixer

Crea frontend/tailwind.config.js:
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: '#6366f1', secondary: '#8b5cf6',
        dark: '#0f172a', 'dark-light': '#1e293b', 'dark-lighter': '#334155'
      }
    }
  }
}

Crea frontend/postcss.config.js:
export default { plugins: { tailwindcss: {}, autoprefixer: {} } }
```

---

## FASE 8: FRONTEND CSS

```
Reemplaza frontend/src/index.css:

@tailwind base;
@tailwind components;
@tailwind utilities;

* { margin: 0; padding: 0; box-sizing: border-box; }
body { background: #0f172a; color: #f1f5f9; font-family: sans-serif; }
#root { height: 100vh; overflow: hidden; }
::-webkit-scrollbar { width: 8px; }
::-webkit-scrollbar-track { background: #1e293b; }
::-webkit-scrollbar-thumb { background: #475569; }
```

---

## FASE 9: FRONTEND API

```
Crea frontend/src/services/api.js:

const URL = 'http://localhost:8000';

export const api = {
  getConversations: () => fetch(`${URL}/api/conversations`).then(r => r.json()),
  createConversation: () => fetch(`${URL}/api/conversations`, 
    {method: 'POST', headers: {'Content-Type': 'application/json'}, 
     body: JSON.stringify({})}).then(r => r.json()),
  deleteConversation: (id) => fetch(`${URL}/api/conversations/${id}`, 
    {method: 'DELETE'}).then(r => r.json()),
  getMessages: (id) => fetch(`${URL}/api/conversations/${id}/messages`).then(r => r.json()),
  
  async streamChat(id, msg, onChunk, onDone, onErr) {
    const res = await fetch(`${URL}/api/chat/stream`, {
      method: 'POST', headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({conversation_id: id, message: msg})
    });
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    while (true) {
      const {done, value} = await reader.read();
      if (done) break;
      decoder.decode(value).split('\n').forEach(line => {
        if (line.startsWith('data: ')) {
          const data = JSON.parse(line.slice(6));
          if (data.content) onChunk(data.content);
          else if (data.status) onDone();
        }
      });
    }
  }
};
```

---

## FASE 10: FRONTEND CONTEXT

```
Crea frontend/src/contexts/ChatContext.jsx:

import {createContext, useContext, useState, useEffect} from 'react';
import {api} from '../services/api';

const ChatContext = createContext();

export const ChatProvider = ({children}) => {
  const [conversations, setConversations] = useState([]);
  const [currentId, setCurrentId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [streaming, setStreaming] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

  useEffect(() => { api.getConversations().then(setConversations); }, []);
  useEffect(() => { 
    if (currentId) api.getMessages(currentId).then(setMessages);
  }, [currentId]);

  const create = async () => {
    const c = await api.createConversation();
    setConversations([c, ...conversations]);
    setCurrentId(c.id);
  };

  const send = async (text) => {
    setMessages([...messages, {role: 'user', content: text}]);
    setIsStreaming(true);
    let full = '';
    await api.streamChat(currentId, text, 
      (chunk) => { full += chunk; setStreaming(full); },
      () => { setMessages(m => [...m, {role: 'assistant', content: full}]); 
              setStreaming(''); setIsStreaming(false); },
      console.error
    );
  };

  return <ChatContext.Provider value={{conversations, currentId, messages, 
    streaming, isStreaming, create, send, setCurrentId, 
    del: (id) => api.deleteConversation(id).then(() => 
      setConversations(conversations.filter(c => c.id !== id)))}}>
    {children}
  </ChatContext.Provider>;
};

export const useChat = () => useContext(ChatContext);
```

---

## FASE 11: COMPONENTES 1

```
Crea frontend/src/components/Message.jsx:

export default function Message({message}) {
  const isUser = message.role === 'user';
  return <div className={`flex mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
    <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
      isUser ? 'bg-gradient-to-r from-primary to-secondary text-white' 
             : 'bg-dark-lighter text-gray-100'
    }`}>{message.content}</div>
  </div>;
}

Crea frontend/src/components/StreamingMessage.jsx:

export default function StreamingMessage({content}) {
  return <div className="flex justify-start mb-4">
    <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-dark-lighter">
      {content}<span className="inline-block w-2 h-4 bg-primary ml-1 animate-pulse"/>
    </div>
  </div>;
}
```

---

## FASE 12: COMPONENTES 2

```
Crea frontend/src/components/MessageInput.jsx:

import {useState} from 'react';

export default function MessageInput({onSend, disabled}) {
  const [input, setInput] = useState('');
  const send = () => { if (input.trim()) { onSend(input); setInput(''); } };
  return <div className="p-4 border-t border-dark-lighter">
    <div className="flex gap-2">
      <textarea value={input} onChange={e => setInput(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), send())}
        className="flex-1 bg-dark-lighter text-gray-100 rounded-xl px-4 py-3"
        placeholder="Type message..." disabled={disabled} />
      <button onClick={send} disabled={!input.trim() || disabled}
        className="bg-gradient-to-r from-primary to-secondary text-white px-6 rounded-xl">
        Send
      </button>
    </div>
  </div>;
}
```

---

## FASE 13: SIDEBAR

```
Crea frontend/src/components/Sidebar.jsx:

import {useChat} from '../contexts/ChatContext';

export default function Sidebar() {
  const {conversations, currentId, create, setCurrentId, del} = useChat();
  return <div className="w-80 bg-dark-light border-r border-dark-lighter flex flex-col">
    <div className="p-4 border-b border-dark-lighter">
      <h1 className="text-xl font-bold text-primary">Chat AI</h1>
    </div>
    <div className="p-4">
      <button onClick={create} 
        className="w-full bg-gradient-to-r from-primary to-secondary text-white py-3 rounded-lg">
        New Chat
      </button>
    </div>
    <div className="flex-1 overflow-y-auto p-2">
      {conversations.map(c => 
        <div key={c.id} className={`group p-3 rounded-lg mb-2 ${
          currentId === c.id ? 'bg-dark-lighter' : 'hover:bg-dark-lighter/50'}`}>
          <button onClick={() => setCurrentId(c.id)} className="w-full text-left">
            {c.title}
          </button>
          <button onClick={() => del(c.id)} 
            className="float-right text-red-400 opacity-0 group-hover:opacity-100">
            ×
          </button>
        </div>
      )}
    </div>
  </div>;
}
```

---

## FASE 14: CHAT WINDOW

```
Crea frontend/src/components/ChatWindow.jsx:

import {useChat} from '../contexts/ChatContext';
import Message from './Message';
import StreamingMessage from './StreamingMessage';
import MessageInput from './MessageInput';

export default function ChatWindow() {
  const {currentId, messages, streaming, isStreaming, send} = useChat();
  
  if (!currentId) return <div className="flex-1 flex items-center justify-center">
    <div className="text-center">
      <h2 className="text-2xl font-bold text-primary mb-4">Welcome to Chat AI</h2>
      <p className="text-gray-400">Create a new conversation to start</p>
    </div>
  </div>;

  return <div className="flex-1 flex flex-col bg-dark">
    <div className="flex-1 overflow-y-auto p-4">
      {messages.map((m, i) => <Message key={i} message={m} />)}
      {streaming && <StreamingMessage content={streaming} />}
    </div>
    <MessageInput onSend={send} disabled={isStreaming} />
  </div>;
}
```

---

## FASE 15: APP

```
Crea frontend/src/App.jsx:

import {ChatProvider} from './contexts/ChatContext';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';

export default function App() {
  return <ChatProvider>
    <div className="flex h-screen bg-dark text-gray-100">
      <Sidebar />
      <ChatWindow />
    </div>
  </ChatProvider>;
}

Reemplaza frontend/src/main.jsx:

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import './index.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode><App /></StrictMode>
);
```

---

## EJECUTAR

```bash
# Terminal 1
cd backend && pip install -r requirements.txt && uvicorn main:app --reload

# Terminal 2  
cd frontend && npm install && npm run dev
```

Abrir http://localhost:5173

---

## VALIDAR

- [ ] Backend en puerto 8000
- [ ] Frontend en puerto 5173  
- [ ] UI oscura con gradientes
- [ ] Crear conversación
- [ ] Enviar mensaje
- [ ] Ver streaming

---

**Total: 15 prompts pequeños. Ejecutar uno por uno.**

