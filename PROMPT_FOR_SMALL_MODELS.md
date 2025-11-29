# Prompt para Modelos Pequeños Locales (Qwen3, CodeLlama, etc.)

Este documento contiene prompts optimizados para modelos pequeños que se ejecutan localmente. El proyecto se divide en **8 fases independientes** que se pueden ejecutar una por una.

---

## 🎯 ESTRATEGIA PARA MODELOS PEQUEÑOS

**NO des todo el prompt de una vez**. Ejecuta cada fase por separado y valida antes de continuar.

### Orden de Ejecución:
1. ✅ Fase 1: Estructura y configuración básica
2. ✅ Fase 2: Backend - Modelos y cliente LM Studio
3. ✅ Fase 3: Backend - API FastAPI
4. ✅ Fase 4: Frontend - Configuración base
5. ✅ Fase 5: Frontend - Servicios y contexto
6. ✅ Fase 6: Frontend - Componentes básicos
7. ✅ Fase 7: Frontend - Componentes avanzados
8. ✅ Fase 8: Scripts y documentación

---

## FASE 1: ESTRUCTURA Y CONFIGURACIÓN BÁSICA

### Prompt:
```
Crea la estructura básica del proyecto "client-chat":

1. Crear carpetas:
   - client-chat/backend/
   - client-chat/frontend/

2. Crear backend/requirements.txt con estas dependencias EXACTAS:
fastapi==0.115.5
uvicorn==0.32.1
openai==1.58.1
python-multipart==0.0.18
pydantic==2.10.3
sse-starlette==2.2.1
httpx==0.27.2

3. Crear .gitignore en la raíz con:
   - __pycache__/
   - venv/
   - node_modules/
   - dist/
   - .DS_Store
   - *.pyc
   - .env

Confirma cuando esté listo.
```

**Validar**: Verificar que las carpetas y archivos existen.

---

## FASE 2: BACKEND - MODELOS Y CLIENTE

### Prompt:
```
Crea dos archivos en backend/:

1. backend/models.py:
   - Importar: pydantic BaseModel, typing List/Optional, datetime
   - Clase Message con: role (str), content (str), timestamp (Optional[datetime])
   - Clase ChatRequest con: conversation_id (str), message (str)
   - Clase Conversation con: id (str), title (str), created_at (datetime), messages (List[Message])
   - Clase ConversationCreate con: title (Optional[str] = "New Conversation")
   - Clase ConversationResponse con: id (str), title (str), created_at (datetime), message_count (int)

2. backend/lm_studio_client.py:
   - Importar: OpenAI from openai, AsyncIterator from typing, asyncio
   - Clase LMStudioClient con:
     * __init__(base_url="http://localhost:1234/v1"): crea self.client = OpenAI(base_url, api_key="lm-studio")
     * async def stream_chat_completion(messages, model="local-model", temperature=0.7, max_tokens=2000):
       - Usar loop.run_in_executor para llamar client.chat.completions.create con stream=True
       - Yield chunk.choices[0].delta.content si no es None
       - Manejar excepciones y yield error message
     * def get_available_models(): retornar lista de model.id del client.models.list()

Usa sintaxis Python moderna y manejo de errores.
```

**Validar**: Verificar que los archivos se crean sin errores de sintaxis.

---

## FASE 3: BACKEND - API FASTAPI

### Prompt:
```
Crea backend/main.py con FastAPI:

Importar:
- FastAPI, HTTPException
- CORSMiddleware
- EventSourceResponse from sse_starlette.sse
- datetime, Dict, uuid, json
- Importar todo de models y LMStudioClient

Configurar:
- app = FastAPI(title="Chat Client API")
- CORS: allow_origins=["http://localhost:5173"], allow_methods=["*"]
- conversations: Dict[str, Conversation] = {} (almacenamiento en memoria)
- lm_client = LMStudioClient()

Crear endpoints:
1. GET / : retornar {"status": "Chat API is running"}

2. GET /api/conversations : retornar lista de ConversationResponse de todas las conversaciones

3. POST /api/conversations : 
   - Recibir ConversationCreate
   - Crear id con uuid.uuid4()
   - Crear Conversation nueva
   - Guardar en conversations
   - Retornar ConversationResponse

4. DELETE /api/conversations/{conversation_id} : 
   - Verificar que existe
   - Eliminar de conversations
   - Retornar {"status": "deleted"}

5. GET /api/conversations/{conversation_id}/messages :
   - Verificar que existe
   - Retornar lista de messages

6. POST /api/chat/stream :
   - Recibir ChatRequest
   - Agregar mensaje de usuario a conversación
   - Si es primer mensaje, actualizar título (primeros 50 chars)
   - Crear async def event_generator():
     * Inicializar assistant_message_content = ""
     * Iterar sobre lm_client.stream_chat_completion
     * Acumular chunks en assistant_message_content
     * Yield {"event": "message", "data": json.dumps({"content": chunk})}
     * Al final agregar mensaje asistente completo
     * Yield {"event": "done", "data": json.dumps({"status": "completed"})}
   - Retornar EventSourceResponse(event_generator())

7. GET /api/models : retornar lm_client.get_available_models()

Al final: if __name__ == "__main__": uvicorn.run(app, host="0.0.0.0", port=8000)
```

**Validar**: Ejecutar `python backend/main.py` y verificar que inicia sin errores.

---

## FASE 4: FRONTEND - CONFIGURACIÓN BASE

### Prompt:
```
Configura el frontend React con Vite:

1. Ejecutar (manual): 
   cd client-chat
   npm create vite@latest frontend -- --template react

2. Instalar Tailwind CSS v3 (IMPORTANTE: versión 3, no 4):
   cd frontend
   npm install -D tailwindcss@3.4.15 postcss autoprefixer

3. Crear frontend/tailwind.config.js:
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: '#6366f1',
        secondary: '#8b5cf6',
        dark: '#0f172a',
        'dark-light': '#1e293b',
        'dark-lighter': '#334155',
      },
    },
  },
  plugins: [],
}

4. Crear frontend/postcss.config.js:
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}

5. Reemplazar frontend/src/index.css con:
@tailwind base;
@tailwind components;
@tailwind utilities;

* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  -webkit-font-smoothing: antialiased;
  background-color: #0f172a;
  color: #f1f5f9;
}

#root { height: 100vh; overflow: hidden; }

::-webkit-scrollbar { width: 8px; }
::-webkit-scrollbar-track { background: #1e293b; }
::-webkit-scrollbar-thumb { background: #475569; border-radius: 4px; }

.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

6. Actualizar frontend/index.html, agregar en <head>:
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
```

**Validar**: Ejecutar `npm run dev` y verificar que compila sin errores (aunque no haya contenido aún).

---

## FASE 5: FRONTEND - SERVICIOS Y CONTEXTO

### Prompt Parte A - API Service:
```
Crea frontend/src/services/api.js:

const API_BASE_URL = 'http://localhost:8000';

export const api = {
  // Función getConversations: fetch GET /api/conversations, retornar json
  
  // Función createConversation(title): fetch POST /api/conversations con body {title}, retornar json
  
  // Función deleteConversation(id): fetch DELETE /api/conversations/{id}, retornar json
  
  // Función getMessages(id): fetch GET /api/conversations/{id}/messages, retornar json
  
  // Función streamChat(conversationId, message, onChunk, onComplete, onError):
  async streamChat(conversationId, message, onChunk, onComplete, onError) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/chat/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversation_id: conversationId, message }),
      });
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            if (data) {
              const parsed = JSON.parse(data);
              if (parsed.content) onChunk(parsed.content);
              else if (parsed.status === 'completed') onComplete();
              else if (parsed.error) onError(parsed.error);
            }
          }
        }
      }
    } catch (error) {
      onError(error.message);
    }
  },
};

Implementa todas las funciones async/await con manejo de errores.
```

**Validar**: Verificar que el archivo no tiene errores de sintaxis.

### Prompt Parte B - Context:
```
Crea frontend/src/contexts/ChatContext.jsx:

Importar: createContext, useContext, useState, useEffect from react
Importar: api from '../services/api'

Crear ChatContext = createContext()

export const ChatProvider = ({ children }) => {
  // Estados:
  const [conversations, setConversations] = useState([])
  const [currentConversationId, setCurrentConversationId] = useState(null)
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingMessage, setStreamingMessage] = useState('')
  const [error, setError] = useState(null)

  // useEffect cargar conversaciones al montar
  // useEffect cargar mensajes cuando cambia currentConversationId

  // Función loadConversations: llamar api.getConversations, setConversations
  
  // Función loadMessages(id): llamar api.getMessages, setMessages
  
  // Función createConversation: llamar api.createConversation, agregar a conversations, setCurrentConversationId
  
  // Función deleteConversation(id): llamar api.deleteConversation, filtrar conversations
  
  // Función sendMessage(content):
  IMPORTANTE: Usar variable local para acumular mensaje:
  
  const sendMessage = async (content) => {
    if (!currentConversationId || !content.trim() || isStreaming) return;
    
    const userMessage = { role: 'user', content, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setStreamingMessage('');
    setIsStreaming(true);
    
    let fullMessage = '';  // CRÍTICO: Variable local
    
    await api.streamChat(
      currentConversationId,
      content,
      (chunk) => {
        fullMessage += chunk;
        setStreamingMessage(fullMessage);
      },
      () => {
        setMessages(prev => [...prev, { role: 'assistant', content: fullMessage, timestamp: new Date() }]);
        setStreamingMessage('');
        setIsStreaming(false);
        loadConversations();
      },
      (error) => {
        setError(error);
        setIsStreaming(false);
      }
    );
  };
  
  // Función switchConversation(id): setCurrentConversationId, resetear streaming

  // Retornar Provider con value={todos los estados y funciones}
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChat must be used within ChatProvider');
  return context;
};
```

**Validar**: Sin errores de sintaxis, estructura correcta.

---

## FASE 6: FRONTEND - COMPONENTES BÁSICOS

### Prompt Parte A - Message:
```
Crea frontend/src/components/Message.jsx:

Componente que recibe prop {message}:
- Determinar si es usuario: message.role === 'user'
- Retornar div con:
  * flex justify-end (si user) o justify-start (si assistant)
  * mb-4 animate-fade-in
  * Dentro: div con:
    - max-w-[80%] rounded-2xl px-4 py-3
    - bg-gradient-to-r from-primary to-secondary text-white (si user)
    - bg-dark-lighter text-gray-100 (si assistant)
    - Contenido: flex items-start gap-3
      * Icono SVG (computadora si assistant, usuario si user)
      * message.content en whitespace-pre-wrap

Usar Tailwind CSS classes.
```

### Prompt Parte B - StreamingMessage:
```
Crea frontend/src/components/StreamingMessage.jsx:

Similar a Message pero para assistant con cursor pulsante:
- flex justify-start mb-4 animate-fade-in
- bg-dark-lighter text-gray-100
- Mostrar prop {content}
- Al final agregar: <span className="inline-block w-2 h-4 bg-primary ml-1 animate-pulse"></span>
```

### Prompt Parte C - MessageInput:
```
Crea frontend/src/components/MessageInput.jsx:

Componente que recibe {onSendMessage, disabled}:
- useState para input
- handleSubmit: prevenir default, llamar onSendMessage(input), limpiar input
- handleKeyDown: Enter sin Shift = submit
- Retornar form con onSubmit:
  * Container: p-4 border-t border-dark-lighter bg-dark-light
  * Textarea con:
    - value={input}, onChange
    - placeholder="Type your message..."
    - bg-dark-lighter text-gray-100
    - rounded-xl px-4 py-3
    - disabled={disabled}
    - onKeyDown={handleKeyDown}
  * Botón submit:
    - bg-gradient-to-r from-primary to-secondary
    - disabled={!input.trim() || disabled}
    - Icono de enviar (SVG)
    - Si disabled: mostrar spinner SVG con animate-spin
```

**Validar**: Componentes se crean correctamente.

---

## FASE 7: FRONTEND - COMPONENTES AVANZADOS

### Prompt Parte A - Sidebar:
```
Crea frontend/src/components/Sidebar.jsx:

Importar useChat from '../contexts/ChatContext' y useState

Componente con estado isCollapsed:
- Container: div con bg-dark-light border-r border-dark-lighter
  * width: w-16 si collapsed, w-80 si no
  * transition-all duration-300

- Header con:
  * Título "Chat AI" con gradiente (si no collapsed)
  * Botón para colapsar (flecha SVG)

- Botón "New Chat" con:
  * bg-gradient-to-r from-primary to-secondary
  * onClick={createConversation}
  * Icono + y texto (si no collapsed)

- Lista de conversaciones:
  * Mapear conversations
  * Cada una: botón con:
    - onClick={switchConversation}
    - bg-dark-lighter si es current
    - Icono chat SVG
    - Título y count de mensajes (si no collapsed)
    - Botón eliminar en hover (icono trash)

Usar Tailwind CSS.
```

### Prompt Parte B - ChatWindow:
```
Crea frontend/src/components/ChatWindow.jsx:

Importar: useEffect, useRef, useChat, Message, StreamingMessage, MessageInput

Componente:
- Obtener estados de useChat
- useRef para messagesEndRef y scroll automático
- useEffect para scrollToBottom cuando cambian messages o streamingMessage

Si no hay currentConversationId:
- Mostrar pantalla de bienvenida:
  * Icono grande con gradiente
  * Título "Welcome to Chat AI"
  * Descripción y features

Si hay conversación:
- Container: flex-1 flex flex-col bg-dark
- Área de mensajes: flex-1 overflow-y-auto p-4
  * Si isLoading: spinner con "Loading messages..."
  * Si no hay mensajes: "No messages yet"
  * Si hay: mapear messages con <Message key={index} message={msg} />
  * Si isStreaming: <StreamingMessage content={streamingMessage} />
  * <div ref={messagesEndRef} /> al final
  * Si error: mostrar en rojo

- Al final: <MessageInput onSendMessage={sendMessage} disabled={isStreaming} />

Usar Tailwind CSS para layout y colores.
```

**Validar**: Componentes sin errores.

---

## FASE 8: INTEGRACIÓN Y SCRIPTS

### Prompt Parte A - App y Main:
```
1. Crear frontend/src/App.jsx:
import { ChatProvider } from './contexts/ChatContext'
import Sidebar from './components/Sidebar'
import ChatWindow from './components/ChatWindow'

function App() {
  return (
    <ChatProvider>
      <div className="flex h-screen overflow-hidden bg-dark text-gray-100">
        <Sidebar />
        <ChatWindow />
      </div>
    </ChatProvider>
  )
}

export default App

2. Crear frontend/src/main.jsx:
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

3. Eliminar frontend/src/App.css si existe.
```

### Prompt Parte B - Scripts:
```
Crea estos scripts en la raíz client-chat/:

1. start-backend.sh:
#!/bin/bash
echo "Starting backend..."
cd backend
if [ ! -d "venv" ]; then python3 -m venv venv; fi
source venv/bin/activate
pip install -q -r requirements.txt
uvicorn main:app --reload

2. start-frontend.sh:
#!/bin/bash
echo "Starting frontend..."
cd frontend
if [ ! -d "node_modules" ]; then npm install; fi
npm run dev

Hacer ejecutables: chmod +x *.sh
```

### Prompt Parte C - README:
```
Crea README.md en la raíz con:

# Chat AI - LM Studio Client

Chat client que conecta a LM Studio.

## Inicio Rápido

1. Iniciar LM Studio en puerto 1234 con un modelo
2. Terminal 1: ./start-backend.sh
3. Terminal 2: ./start-frontend.sh
4. Abrir: http://localhost:5173

## Tecnologías

- Backend: Python + FastAPI
- Frontend: React + Vite + Tailwind CSS v3
- LM Studio: Puerto 1234

## Features

- Streaming en tiempo real
- Múltiples conversaciones
- Tema oscuro moderno
```

**Validar**: Todo funciona end-to-end.

---

## 🔧 CHECKLIST FINAL

Después de completar las 8 fases:

### Verificación de Archivos
- [ ] backend/requirements.txt
- [ ] backend/models.py
- [ ] backend/lm_studio_client.py
- [ ] backend/main.py
- [ ] frontend/tailwind.config.js
- [ ] frontend/postcss.config.js
- [ ] frontend/src/index.css
- [ ] frontend/src/services/api.js
- [ ] frontend/src/contexts/ChatContext.jsx
- [ ] frontend/src/components/Message.jsx
- [ ] frontend/src/components/StreamingMessage.jsx
- [ ] frontend/src/components/MessageInput.jsx
- [ ] frontend/src/components/Sidebar.jsx
- [ ] frontend/src/components/ChatWindow.jsx
- [ ] frontend/src/App.jsx
- [ ] frontend/src/main.jsx
- [ ] start-backend.sh
- [ ] start-frontend.sh
- [ ] README.md
- [ ] .gitignore

### Verificación Funcional
1. **Backend**
   ```bash
   cd backend
   pip install -r requirements.txt
   python main.py
   # Debe iniciar en puerto 8000
   ```

2. **Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   # Debe iniciar en puerto 5173
   ```

3. **Integración**
   - [ ] LM Studio corriendo en 1234
   - [ ] Backend responde en 8000
   - [ ] Frontend muestra UI oscura con gradientes
   - [ ] Crear conversación funciona
   - [ ] Enviar mensaje funciona
   - [ ] Streaming se ve en tiempo real
   - [ ] Mensajes se guardan completos

---

## 🐛 PROBLEMAS COMUNES Y SOLUCIONES

### Problema 1: Tailwind no funciona
```
Re-prompt:
Verifica que en package.json esté:
"tailwindcss": "3.4.15"

NO debe ser versión 4.x

Si es v4, desinstalar y reinstalar:
npm uninstall tailwindcss
npm install -D tailwindcss@3.4.15
```

### Problema 2: Streaming no acumula
```
Re-prompt:
En ChatContext.jsx, verifica que sendMessage use:
let fullMessage = '';
NO usar el estado streamingMessage para acumular.
```

### Problema 3: Error al instalar Pydantic
```
Re-prompt:
Verifica que requirements.txt tenga:
pydantic==2.10.3
httpx==0.27.2
openai==1.58.1

Estas versiones son compatibles con Python 3.13.
```

### Problema 4: CORS error
```
Re-prompt:
En backend/main.py verifica que CORS tenga:
allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"]
```

---

## 💡 TIPS PARA MODELOS PEQUEÑOS

### 1. Una Fase a la Vez
No intentes hacer varias fases juntas. Completa una y valida antes de continuar.

### 2. Si el Output es Incompleto
```
Re-prompt:
Continúa el código anterior desde donde lo dejaste.
[Pegar las últimas líneas generadas]
```

### 3. Si Hay Errores de Sintaxis
```
Re-prompt:
Hay un error en [nombre del archivo] línea X:
[pegar el error]
Corrige solo esa función/sección.
```

### 4. Si Falta Funcionalidad
```
Re-prompt:
En [archivo], la función [nombre] está incompleta.
Implementa: [describir qué debe hacer]
```

### 5. Usa Validación Incremental
Después de cada fase, ejecuta:
```bash
# Backend
python -m py_compile backend/*.py

# Frontend  
cd frontend && npm run build
```

---

## 📊 TIEMPOS ESTIMADOS

| Modelo Local | Tiempo Total | Iteraciones |
|--------------|--------------|-------------|
| Qwen3 Coder 1.5B | 45-60 min | 15-25 |
| Qwen3 Coder 7B | 30-45 min | 10-15 |
| CodeLlama 7B | 40-55 min | 12-20 |
| Llama 3 8B | 35-50 min | 10-18 |

*Tiempos incluyen validación y correcciones*

---

## 🎯 RESULTADO ESPERADO

Al completar todas las fases:
- ✅ 20 archivos creados
- ✅ Backend funcional en puerto 8000
- ✅ Frontend con UI oscura y gradientes en puerto 5173
- ✅ Streaming funciona en tiempo real
- ✅ Gestión de múltiples conversaciones
- ✅ Sin errores en consolas

---

*Este enfoque paso a paso está optimizado para la capacidad de procesamiento limitada de modelos pequeños locales.*

