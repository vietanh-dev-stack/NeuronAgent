from fastapi import FastAPI
from pydantic import BaseModel
from transformers import AutoTokenizer, AutoModelForCausalLM
import torch

app = FastAPI()

# ===== Request model =====
class ChatRequest(BaseModel):
    message: str

# ===== Load model =====
model_name = "microsoft/DialoGPT-medium"

tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(model_name)

# ===== Memory =====
memory = []

# ===== Tools =====
def get_weather(city: str):
    return f"Weather in {city}: 30°C, sunny ☀️"

def calculator(expr: str):
    try:
        return str(eval(expr))
    except:
        return "Invalid math expression"

# ===== AI generate =====
def generate_response(prompt):
    inputs = tokenizer(prompt, return_tensors="pt")

    outputs = model.generate(
        **inputs,
        max_new_tokens=100,
        do_sample=True,
        temperature=0.7,
        repetition_penalty=1.2
    )

    return tokenizer.decode(outputs[0], skip_special_tokens=True)

# ===== Agent logic =====
def agent(user_input: str):
    global memory

    memory.append("User: " + user_input)

    context = "\n".join(memory[-5:])  # nhớ 5 tin gần nhất

    # TOOL LOGIC
    if "weather" in user_input.lower():
        tool_result = get_weather("Ho Chi Minh")
        memory.append("Tool: " + tool_result)

    elif any(char.isdigit() for char in user_input):
        tool_result = calculator(user_input)
        memory.append("Tool: " + tool_result)

    # tạo prompt cho AI
    prompt = context + "\nAssistant:"

    response = generate_response(prompt)

    memory.append("Assistant: " + response)

    return response

# ===== API =====
@app.post("/chat")
async def chat(data: ChatRequest):
    response = agent(data.message)
    return {"response": response}