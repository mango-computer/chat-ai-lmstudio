# Prompt Mínimo para LLM: Chat AI Client con LM Studio

Este documento contiene el prompt mínimo necesario para que un modelo LLM de código (como Qwen3 Coder, Claude, GPT-4, etc.) pueda crear el proyecto completo desde cero.

---

## PROMPT PARA EL LLM

```
Crea un proyecto completo de chat AI con las siguientes especificaciones:

OBJETIVO:
Cliente de chat moderno y elegante que se conecta a LM Studio (servidor local de LLM en puerto 1234) para tener conversaciones con IA.

ARQUITECTURA:
- Backend: Python + FastAPI con streaming SSE
- Frontend: React + Vite + Tailwind CSS v3
- Comunicación: REST API + Server-Sent Events para respuestas en tiempo real
- Almacenamiento: En memoria (sin base de datos)

ESTRUCTURA DEL PROYECTO:
client-chat/
├── backend/
│   ├── main.py              # FastAPI app con CORS
│   ├── models.py            # Modelos Pydantic
│   ├── lm_studio_client.py  # Cliente OpenAI para LM Studio
│   ├── requirements.txt     # Dependencias Python
│   └── README.md
├── frontend/
│   ├── src/
│   │   ├── components/      # 5 componentes React
│   │   ├── contexts/        # ChatContext con estado global
│   │   ├── services/        # api.js para llamadas backend
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json
├── README.md
├── start-backend.sh
├── start-frontend.sh
└── .gitignore

BACKEND - ESPECIFICACIONES:

1. Dependencias (requirements.txt):
   - fastapi==0.115.5
   - uvicorn==0.32.1
   - openai==1.58.1
   - python-multipart==0.0.18
   - pydantic==2.10.3
   - sse-starlette==2.2.1
   - httpx==0.27.2

2. Modelos Pydantic (models.py):
   - Message: role, content, timestamp
   - ChatRequest: conversation_id, message
   - Conversation: id, title, created_at, messages[]
   - ConversationCreate: title (opcional)
   - ConversationResponse: id, title, created_at, message_count

3. Cliente LM Studio (lm_studio_client.py):
   - Clase LMStudioClient con base_url="http://localhost:1234/v1"
   - Método async stream_chat_completion() que usa OpenAI SDK
   - Yield de chunks de contenido
   - Manejo de errores

4. API FastAPI (main.py):
   - CORS habilitado para localhost:5173
   - Almacenamiento en memoria: Dict[str, Conversation]
   - Endpoints:
     * GET / - Health check
     * GET /api/conversations - Listar conversaciones
     * POST /api/conversations - Crear conversación
     * DELETE /api/conversations/{id} - Eliminar conversación
     * GET /api/conversations/{id}/messages - Obtener mensajes
     * POST /api/chat/stream - Streaming con SSE
     * GET /api/models - Modelos disponibles
   - En /api/chat/stream:
     * Agregar mensaje de usuario
     * Actualizar título si es primer mensaje
     * Stream de respuesta con EventSourceResponse
     * Eventos: "message" (chunks), "done" (completado), "error" (errores)

FRONTEND - ESPECIFICACIONES:

1. Dependencias:
   - React 18
   - Vite 7
   - Tailwind CSS 3.4.15 (IMPORTANTE: v3, NO v4)
   - PostCSS y Autoprefixer

2. Configuración Tailwind (tailwind.config.js):
   - Colores personalizados:
     * primary: '#6366f1'
     * secondary: '#8b5cf6'
     * dark: '#0f172a'
     * dark-light: '#1e293b'
     * dark-lighter: '#334155'

3. Estilos (index.css):
   - Importar directivas Tailwind
   - Tema oscuro (background dark, text light)
   - Scrollbar personalizado
   - Animaciones: fadeIn, pulse-slow
   - Fuente: Inter de Google Fonts

4. API Service (services/api.js):
   - API_BASE_URL = 'http://localhost:8000'
   - Funciones para conversaciones (CRUD)
   - Función streamChat() que:
     * Usa fetch con POST a /api/chat/stream
     * Lee response.body con getReader()
     * Parsea líneas SSE (formato "data: {...}")
     * Llama callbacks: onChunk, onComplete, onError

5. Context (contexts/ChatContext.jsx):
   - Estados: conversations, currentConversationId, messages, isLoading, isStreaming, streamingMessage, error
   - Funciones: loadConversations, loadMessages, createConversation, deleteConversation, sendMessage, switchConversation
   - **CRÍTICO en sendMessage()**: Usar variable local fullMessage para acumular chunks, NO el estado
   - useEffect para cargar conversaciones al montar
   - useEffect para cargar mensajes cuando cambia conversación

6. Componentes:

   a) Sidebar.jsx:
      - Barra lateral con header "Chat AI"
      - Botón "New Chat" con gradiente
      - Lista de conversaciones con scroll
      - Botón de eliminar en hover
      - Botón para colapsar/expandir
      - Estado collapsed para mostrar solo iconos

   b) ChatWindow.jsx:
      - Área de mensajes con scroll
      - Muestra Message components para cada mensaje
      - Muestra StreamingMessage para mensaje en progreso
      - Auto-scroll con useRef y useEffect
      - Pantalla de bienvenida si no hay conversación
      - Muestra errores si existen
      - Usa MessageInput al final

   c) Message.jsx:
      - Burbuja de mensaje diferente para user/assistant
      - Usuario: gradiente primary-secondary, alineado a derecha
      - Asistente: bg dark-lighter, alineado a izquierda
      - Iconos SVG para cada rol
      - Animación fadeIn

   d) StreamingMessage.jsx:
      - Similar a Message pero para asistente
      - Incluye cursor pulsante al final
      - Muestra contenido en tiempo real

   e) MessageInput.jsx:
      - Textarea con auto-resize
      - Enter para enviar, Shift+Enter para nueva línea
      - Botón con gradiente
      - Spinner cuando disabled (streaming)
      - Max height 200px

7. App.jsx:
   - Layout flex horizontal
   - ChatProvider envuelve todo
   - Sidebar + ChatWindow

CARACTERÍSTICAS VISUALES:

- Tema: Oscuro con gradientes morados/azules
- Botones: Gradiente de primary a secondary con hover effects
- Transiciones: Suaves (duration-200, duration-300)
- Scrollbar: Personalizado con colores del tema
- Animaciones: Fade-in para mensajes, pulse para cursor de escritura
- Responsivo: Mobile y desktop
- Fuente: Inter de Google Fonts

FUNCIONALIDADES:

1. Gestión de conversaciones:
   - Crear nueva conversación
   - Listar conversaciones en sidebar
   - Cambiar entre conversaciones
   - Eliminar conversaciones
   - Título automático del primer mensaje

2. Chat:
   - Enviar mensajes
   - Streaming en tiempo real de respuestas
   - Historial de mensajes persistente
   - Auto-scroll a último mensaje
   - Estados de carga

3. UI/UX:
   - Sidebar colapsable
   - Indicador de escritura
   - Manejo de errores visible
   - Diseño moderno y elegante

SCRIPTS DE INICIO:

1. start-backend.sh:
   - Crear venv si no existe
   - Activar venv
   - Instalar dependencias
   - Verificar conexión LM Studio
   - Iniciar uvicorn

2. start-frontend.sh:
   - Instalar npm dependencies si no existen
   - Verificar conexión backend
   - Iniciar npm run dev

DOCUMENTACIÓN:

- README.md principal con quick start, features, troubleshooting
- backend/README.md con setup y endpoints
- .gitignore para Python y Node

PUNTOS CRÍTICOS A CONSIDERAR:

1. Usar Tailwind CSS v3.4.15, NO v4 (incompatible)
2. En postcss.config.js usar 'tailwindcss' no '@tailwindcss/postcss'
3. En ChatContext.jsx, usar variable local para acumular mensaje en streaming
4. Versiones exactas de dependencias para compatibilidad con Python 3.13
5. CORS configurado para localhost:5173
6. SSE debe parsear líneas que empiezan con "data: "
7. Auto-scroll después de nuevos mensajes o chunks

RESULTADO ESPERADO:

Un proyecto funcional donde:
- Backend corre en puerto 8000
- Frontend corre en puerto 5173
- Se conecta a LM Studio en puerto 1234
- UI moderna con tema oscuro y gradientes
- Streaming funcional en tiempo real
- Múltiples conversaciones gestionables
- Sin errores en consola

INSTRUCCIONES:

Crea TODOS los archivos necesarios con su contenido completo. No uses placeholders ni "// TODO". Cada archivo debe estar completamente implementado y funcional. Incluye comentarios donde sea necesario para claridad.
```

---

## NOTAS PARA EL USO DEL PROMPT

### ¿Por qué este prompt funciona?

1. **Especifica TODO sin ser excesivo**: Da la estructura completa pero deja que el LLM implemente los detalles
2. **Menciona puntos críticos**: Evita errores comunes conocidos
3. **Define arquitectura clara**: El LLM sabe qué tecnologías usar y por qué
4. **Especifica versiones**: Evita incompatibilidades
5. **Describe resultado esperado**: El LLM sabe cuándo ha terminado correctamente

### Ajustes según el LLM

**Para modelos más pequeños (Qwen3 Coder, CodeLlama):**
- Dar el prompt en partes (backend primero, luego frontend)
- Ser más explícito en las estructuras de datos
- Incluir ejemplos de código para patrones complejos

**Para modelos grandes (GPT-4, Claude Sonnet):**
- Este prompt es suficiente
- Pueden manejar todo de una vez
- Pueden inferir mejores prácticas automáticamente

**Para modelos especializados en código (GitHub Copilot, Cursor):**
- Pueden beneficiarse de ejemplos de código más concretos
- Especificar patrones de diseño preferidos

### Variaciones del Prompt

**Versión Ultra Corta (para GPT-4/Claude):**
```
Crea un chat client con React+Vite+Tailwind v3 (frontend) y FastAPI (backend) que se conecta a LM Studio en localhost:1234 usando OpenAI SDK. 
Features: streaming SSE, múltiples conversaciones, tema oscuro con gradientes morados. 
Backend en puerto 8000, frontend en 5173.
Usar Pydantic 2.10.3, FastAPI 0.115.5, OpenAI 1.58.1, Tailwind CSS 3.4.15.
```

**Versión Iterativa (para modelos más pequeños):**
```
Paso 1: Crea el backend FastAPI con endpoints para gestión de conversaciones y streaming SSE.
[Esperar resultado]

Paso 2: Crea el frontend React con Vite y Tailwind CSS v3.
[Esperar resultado]

Paso 3: Conecta frontend con backend y agrega estilos.
[Esperar resultado]
```

### Tips para Mejores Resultados

1. **Ser específico con versiones**: Evita incompatibilidades
2. **Mencionar casos edge**: Como el problema del streaming
3. **Definir el "por qué"**: Ayuda al LLM a tomar mejores decisiones
4. **Dar contexto visual**: Describe cómo debe verse
5. **Especificar arquitectura**: Dónde va cada cosa

### Qué NO incluir en el prompt

❌ Código completo (el LLM lo generará)
❌ Instrucciones de instalación básicas (el LLM las conoce)
❌ Documentación de APIs (el LLM tiene conocimiento)
❌ Demasiados detalles de implementación (limita creatividad)

### Qué SÍ incluir

✅ Versiones específicas de paquetes
✅ Puntos críticos conocidos
✅ Estructura de archivos y carpetas
✅ Especificaciones funcionales claras
✅ Requisitos de UI/UX
✅ Limitaciones técnicas

---

## EJEMPLO DE USO

### Para Qwen3 Coder o similar:

**Sesión 1 - Backend:**
```
Usando el siguiente prompt, crea SOLO la parte del backend:
[Incluir sección "BACKEND - ESPECIFICACIONES" del prompt]
```

**Sesión 2 - Frontend:**
```
Ahora crea el frontend React que se conecta al backend anterior:
[Incluir sección "FRONTEND - ESPECIFICACIONES" del prompt]
```

### Para Claude/GPT-4:

**Sesión única:**
```
[Prompt completo]

Crea todos los archivos en orden, empezando por el backend.
```

### Para Cursor/GitHub Copilot:

**En chat del IDE:**
```
[Prompt completo]

Genera los archivos uno por uno en la estructura especificada.
```

---

## VALIDACIÓN DEL RESULTADO

Después de que el LLM genere el código, verificar:

### Checklist Rápido
- [ ] Todos los archivos creados (≈25 archivos)
- [ ] requirements.txt con versiones correctas
- [ ] Tailwind CSS es v3, no v4
- [ ] ChatContext usa variable local para streaming
- [ ] CORS configurado correctamente
- [ ] SSE implementado en backend y frontend
- [ ] 5 componentes React creados
- [ ] Scripts de inicio creados

### Pruebas Funcionales
1. Backend inicia sin errores
2. Frontend compila sin errores  
3. Frontend muestra tema oscuro con gradientes
4. Se puede crear conversación
5. Se puede enviar mensaje
6. Streaming funciona en tiempo real
7. Mensajes se guardan completos

---

## TROUBLESHOOTING DEL PROMPT

### Si el LLM genera Tailwind CSS v4:
**Re-prompt:**
```
ERROR: Usar Tailwind CSS v3.4.15, NO v4. 
Regenera package.json y configuración de Tailwind.
```

### Si el streaming no acumula mensajes:
**Re-prompt:**
```
ERROR: En ChatContext.jsx, sendMessage debe usar una variable local 
'let fullMessage = ""' para acumular chunks, no el estado streamingMessage.
Corrige la función sendMessage.
```

### Si faltan dependencias:
**Re-prompt:**
```
Verifica que requirements.txt incluya todas las versiones especificadas:
fastapi==0.115.5, uvicorn==0.32.1, openai==1.58.1, 
python-multipart==0.0.18, pydantic==2.10.3, 
sse-starlette==2.2.1, httpx==0.27.2
```

### Si el código está incompleto:
**Re-prompt:**
```
El código de [archivo] está incompleto. 
Genera la implementación completa sin placeholders ni TODOs.
```

---

## MÉTRICAS DE ÉXITO

Un prompt exitoso para un LLM debe resultar en:

1. **Completitud**: 100% de archivos necesarios generados
2. **Funcionalidad**: Proyecto corre sin errores
3. **Corrección**: Implementa todas las features especificadas
4. **Calidad**: Código limpio y bien estructurado
5. **Documentación**: README y comentarios incluidos

**Tiempo estimado de generación:**
- Modelos grandes: 5-10 minutos
- Modelos medianos: 15-30 minutos (con iteraciones)
- Modelos pequeños: 30-60 minutos (requiere más guía)

---

*Este prompt ha sido optimizado basándose en la experiencia de crear el proyecto y resolver todos los problemas encontrados.*

