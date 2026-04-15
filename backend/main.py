from fastapi import FastAPI
from pydantic import BaseModel
from transformers import AutoTokenizer, AutoModelForCausalLM
import torch

app = FastAPI()

# Model request
class ChatRequest(BaseModel):
    message: str

model_name = "microsoft/DialoGPT-medium"

tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(model_name)

def generate_response(prompt):
    inputs = tokenizer(prompt, return_tensors="pt")
    
    outputs = model.generate(
        **inputs,
        max_new_tokens=100,
        do_sample=True,
        temperature=0.7
    )

    return tokenizer.decode(outputs[0], skip_special_tokens=True)

@app.post("/chat")
async def chat(data: ChatRequest):
    user_input = data.message
    
    response = generate_response(user_input)
    
    return {"response": response}