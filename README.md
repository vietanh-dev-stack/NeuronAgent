# 🧠 NeuronAgent — Personal AI Assistant

A production-ready, modular AI agent system with streaming chat, tool usage, memory, and authentication.

---

## ✨ Features

| Feature | Status |
|---------|--------|
| Streaming chat (SSE) | ✅ |
| Tool system (calculator, code analyzer, web search, notes, code runner) | ✅ |
| Short-term memory (Redis sliding window) | ✅ |
| Long-term memory (PostgreSQL) | ✅ |
| JWT authentication | ✅ |
| Session management | ✅ |
| Chat modes: Chat / Code / Task | ✅ |
| Markdown + code rendering | ✅ |
| Collapsible sidebar | ✅ |
| Dark theme premium UI | ✅ |

---

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 20+
- PostgreSQL 15+
- Redis 7+
- OpenAI API key

### 1. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate   # Windows
source venv/bin/activate  # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Configure environment
copy .env.example .env
# Edit .env and set OPENAI_API_KEY, DATABASE_URL, etc.

# Run the server
python run.py
# API available at: http://localhost:8000
# Swagger docs at: http://localhost:8000/docs
```

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment (already set for local dev)
# NEXT_PUBLIC_API_URL=http://localhost:8000

# Start development server
npm run dev
# App available at: http://localhost:3000
```

### 3. Docker (All services)

```bash
# Copy and configure backend environment
cp backend/.env.example backend/.env
# Edit backend/.env: set OPENAI_API_KEY

# Start everything
docker compose up --build

# Access:
# Frontend: http://localhost:3000
# Backend: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│               Next.js 15 Frontend (Port 3000)           │
│  Chat UI • Session List • Auth • Streaming SSE Reader   │
└──────────────────────┬──────────────────────────────────┘
                       │ REST + SSE
┌──────────────────────▼──────────────────────────────────┐
│              FastAPI Backend (Port 8000)                 │
│                                                         │
│  Auth → Agent Orchestrator → LLM Client (OpenAI)        │
│                    ↓                                    │
│  Tool Registry: calculator | code_analyzer | web_search │
│                 note_writer | code_runner               │
│                    ↓                                    │
│  Memory: Short-term (Redis) + Long-term (PostgreSQL)    │
└──────────────────────────────────────────────────────────┘
         │                        │
    PostgreSQL                  Redis
    (sessions, messages,    (session window,
     memory_entries)         rate limiting)
```

---

## 📁 Project Structure

```
NeuronAgent/
├── backend/
│   ├── app/
│   │   ├── main.py           # FastAPI app factory
│   │   ├── config.py         # Settings
│   │   ├── api/v1/           # Route handlers
│   │   ├── agent/            # Orchestrator
│   │   ├── tools/            # Tool system
│   │   ├── llm/              # LLM client + prompts
│   │   ├── memory/           # Short/long-term memory
│   │   ├── models/           # SQLAlchemy ORM
│   │   ├── schemas/          # Pydantic schemas
│   │   ├── services/         # Business logic
│   │   └── db/               # Database setup
│   ├── requirements.txt
│   ├── .env.example
│   └── Dockerfile
│
├── frontend/
│   ├── app/                  # Next.js App Router pages
│   ├── components/           # UI components
│   ├── hooks/                # React hooks
│   ├── lib/                  # API client + utilities
│   ├── stores/               # Zustand state
│   ├── types/                # TypeScript types
│   └── Dockerfile
│
└── docker-compose.yml
```

---

## 🔧 Adding a New Tool

1. Create `backend/app/tools/my_tool.py`:

```python
from app.tools.base import BaseTool, ToolResult

class MyTool(BaseTool):
    name = "my_tool"
    description = "Does something useful. Use when..."
    parameters = {
        "type": "object",
        "properties": {
            "input": {"type": "string", "description": "The input"}
        },
        "required": ["input"],
    }

    async def run(self, input: str, **kwargs) -> ToolResult:
        result = f"Processed: {input}"
        return ToolResult(success=True, output=result)
```

2. Register in `backend/app/tools/registry.py`:

```python
from app.tools.my_tool import MyTool
# Add MyTool() to the list in register_all_tools()
```

That's it — the tool is automatically available to the AI.

---

## 🌐 API Reference

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/v1/auth/register` | POST | No | Create account |
| `/api/v1/auth/login` | POST | No | Get JWT token |
| `/api/v1/sessions` | GET | JWT | List sessions |
| `/api/v1/sessions` | POST | JWT | Create session |
| `/api/v1/sessions/{id}` | DELETE | JWT | Delete session |
| `/api/v1/chat/stream` | POST | JWT | Stream response (SSE) |
| `/api/v1/chat/history/{id}` | GET | JWT | Get message history |
| `/api/v1/memory` | GET | JWT | View session memory |
| `/health` | GET | No | Health check |

---

## 🔐 Environment Variables (Backend)

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENAI_API_KEY` | OpenAI API key | **Required** |
| `OPENAI_MODEL` | Model to use | `gpt-4o-mini` |
| `DATABASE_URL` | PostgreSQL async URL | localhost |
| `REDIS_URL` | Redis connection URL | localhost |
| `SECRET_KEY` | JWT signing secret | **Generate** |
| `SHORT_TERM_WINDOW` | Messages in context | `20` |
| `LONG_TERM_TOP_K` | Memory retrievals | `5` |
