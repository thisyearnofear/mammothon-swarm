import os
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import google.generativeai as genai
from pydantic import BaseModel
from typing import List, Optional

# Load environment variables
load_dotenv()

# Configure Gemini
gemini_api_key = os.getenv("GEMINI_API_KEY")
if gemini_api_key:
    genai.configure(api_key=gemini_api_key)

# Initialize FastAPI app
app = FastAPI(title="Wooly - Mammothon Guide", 
              description="AI-powered guide for the Mammothon Agent Swarm project")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development; restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define project details
PROJECT_INFO = {
    "name": "Mammothon Agent Swarm",
    "description": "A decentralized platform for reviving abandoned hackathon projects through AI agents and community engagement.",
    "features": [
        "AI-powered project agents",
        "Builder staking mechanism",
        "Early advocate NFTs",
        "Decentralized data storage",
        "Community-driven project revival"
    ],
    "architecture": {
        "frontend": "HTML/CSS/JS with modular agent system",
        "backend": "FastAPI with SwarmNode integration",
        "storage": "Conduit and Celestia (planned)"
    }
}

class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[Message]

class ChatResponse(BaseModel):
    response: str
    project_info: Optional[dict] = None

def get_chat_response(messages, model_type="gemini"):
    """Generate a response using Gemini."""
    system_prompt = f"""
    You are Wooly, the friendly guide for the Mammothon Agent Swarm project. Your role is to help users understand:

    1. The overall vision of Mammothon Agent Swarm:
       - Reviving abandoned hackathon projects through AI agents
       - Building a community of developers and advocates
       - Creating a decentralized ecosystem for project revival

    2. How the platform works:
       - Each project has its own AI agent (like VocaFI)
       - Builders can stake to take over projects
       - Early advocates can mint NFTs
       - All data is stored on decentralized networks

    3. Current features and future plans:
       - AI-powered project explanations
       - Builder staking mechanism
       - Early advocate NFTs
       - Integration with Conduit and Celestia

    Be friendly, helpful, and enthusiastic. If users ask about specific projects, direct them to the respective project agents.
    """
    
    conversation_history = []
    for msg in messages:
        if msg.role == "user":
            conversation_history.append(f"User: {msg.content}")
        else:
            conversation_history.append(f"Assistant: {msg.content}")
    
    conversation_text = "\n".join(conversation_history)
    last_user_message = next((msg.content for msg in reversed(messages) if msg.role == "user"), "")
    
    try:
        model = genai.GenerativeModel('gemini-pro')
        prompt = f"{system_prompt}\n\nConversation history:\n{conversation_text}\n\nUser's latest message: {last_user_message}\n\nRespond as Wooly:"
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        print(f"Gemini error: {e}")
        return "I'm sorry, I'm having trouble connecting to my AI services right now. Please try again later."

@app.post("/chat")
async def chat(request: ChatRequest):
    """Chat with Wooly."""
    response = get_chat_response(request.messages)
    
    # Include project info with the first message
    include_project_info = len(request.messages) <= 1
    
    return ChatResponse(
        response=response,
        project_info=PROJECT_INFO if include_project_info else None
    )

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000) 