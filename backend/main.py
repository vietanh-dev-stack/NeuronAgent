from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from transformers import AutoTokenizer, AutoModelForCausalLM
import torch
from sse_starlette.sse import EventSourceResponse
import asyncio


# =====================
# APP INIT
# =====================
app = FastAPI()

# =====================
# CORS CONFIG (FRONTEND CONNECT)
# =====================
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =====================
# REQUEST MODEL
# =====================
class ChatRequest(BaseModel):
    message: str


# =====================
# LIGHTWEIGHT MODEL
# =====================
model_name = "microsoft/DialoGPT-small"

tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(model_name)

# =====================
# MEMORY (SAFE LIMIT)
# =====================
memory = []


# =====================
# TOOLS
# =====================
def get_weather(city: str):
    return f"Weather in {city}: 30°C, sunny ☀️"

def calculator(expr: str):
    try:
        return str(eval(expr))
    except:
        return "Invalid math expression"


# =====================
# GENERATION FUNCTION (OPTIMIZED)
# =====================
def generate_response(prompt: str):
    inputs = tokenizer.encode(
        prompt + tokenizer.eos_token,
        return_tensors="pt"
    )

    with torch.no_grad():
        outputs = model.generate(
            inputs,
            max_new_tokens=80,
            do_sample=True,
            temperature=0.7,
            top_p=0.9,
            repetition_penalty=1.2,
            pad_token_id=tokenizer.eos_token_id
        )

    response = tokenizer.decode(
        outputs[:, inputs.shape[-1]:][0],
        skip_special_tokens=True
    )

    return response.strip()


# =====================
# AGENT LOGIC
# =====================
def agent(user_input: str):
    global memory

    user_input = user_input.strip()

    # save user message
    memory.append(f"User: {user_input}")

    # limit memory (avoid lag/crash)
    if len(memory) > 6:
        memory = memory[-6:]

    context = "\n".join(memory)

    tool_result = None

    # =====================
    # TOOL SELECTION (simple rule-based)
    # =====================
    if "weather" in user_input.lower():
        tool_result = get_weather("Ho Chi Minh")
        memory.append(f"Tool: {tool_result}")

    elif any(char.isdigit() for char in user_input):
        tool_result = calculator(user_input)
        memory.append(f"Tool: {tool_result}")

    # =====================
    # PROMPT FOR MODEL
    # =====================
    prompt = f"""
You are a helpful AI assistant.

You can use previous conversation context.

Conversation:
{context}

Answer clearly and naturally.

Assistant:
"""

    response = generate_response(prompt)

    memory.append(f"Assistant: {response}")

    return response


# =====================
# API ENDPOINT
# =====================
@app.post("/chat")
async def chat(data: ChatRequest):
    return {
        "response": agent(data.message)
    }

@app.post("/chat-stream")
async def chat_stream(data: ChatRequest):

    response_text = agent(data.message)

    async def event_generator():
        for word in response_text.split():
            yield {"data": word + " "}
            await asyncio.sleep(0.05)

    return EventSourceResponse(event_generator())