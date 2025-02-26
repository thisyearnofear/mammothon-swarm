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
    # Set default safety settings
    safety_settings = {
        "HARM_CATEGORY_HARASSMENT": "BLOCK_NONE",
        "HARM_CATEGORY_HATE_SPEECH": "BLOCK_NONE",
        "HARM_CATEGORY_SEXUALLY_EXPLICIT": "BLOCK_NONE",
        "HARM_CATEGORY_DANGEROUS_CONTENT": "BLOCK_NONE",
    }

# Initialize FastAPI app
app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define message models for chat
class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[Message]

class ChatResponse(BaseModel):
    response: str
    project_info: Optional[dict] = None

# Project information
WOOLY_INFO = {
    "name": "Wooly",
    "description": "Your guide to the Mammothon Agent Swarm project",
    "capabilities": [
        "Explain the Mammothon Agent Swarm project",
        "Guide users through available agents",
        "Help with project navigation",
        "Provide technical documentation"
    ],
    "project_overview": """
    Mammothon Agent Swarm reimagines the Million Dollar Homepage by turning abandoned 
    hackathon projects into dynamic, AI-powered agents. These agents explain each 
    project's vision and technical details, invite new builders to take over via a 
    staking mechanism, and incentivize early community advocates through limited-edition NFTs.
    """
}

def get_chat_response(messages: List[Message]) -> str:
    """Generate a response using Gemini API."""
    if not gemini_api_key:
        return "I'm sorry, I'm not properly configured. Please ensure the GEMINI_API_KEY is set."

    # Create the system prompt with README content
    system_prompt = """
    You are Wooly, the central guide for the Mammothon Agent Swarm project.
    
    Your first message should be:
    "Welcome! I'm Wooly, your guide to Mammothon Agent Swarm. We're reviving abandoned hackathon projects through AI agents and community staking. Check out our <a href='https://github.com/thisyearnofear/mammothon-swarm'>frontend</a> and <a href='https://github.com/pallasite99/pixelate_backend'>backend</a>. How can I help you explore our project?"
    
    For subsequent messages:
    1. Guide users through the platform's features (AI agents, staking, NFTs)
    2. Help users understand how they can participate
    3. Direct users to specific project agents based on their interests
    
    Be concise, friendly, and focused on helping users understand and navigate the project.
    """

    try:
        # Format conversation history
        conversation = []
        for msg in messages:
            prefix = "User: " if msg.role == "user" else "Assistant: "
            conversation.append(f"{prefix}{msg.content}")
        
        conversation_text = "\n".join(conversation)
        
        # Get the last user message
        last_user_message = next((msg.content for msg in reversed(messages) if msg.role == "user"), "")
        
        # Generate response using Gemini
        model = genai.GenerativeModel('gemini-1.5-pro')
        prompt = f"{system_prompt}\n\nConversation history:\n{conversation_text}\n\nUser's latest message: {last_user_message}\n\nRespond as Wooly, focusing on project guidance:"
        
        response = model.generate_content(
            prompt,
            safety_settings=safety_settings,
            generation_config={
                "temperature": 0.7,
                "top_p": 0.8,
                "top_k": 40
            }
        )
        return response.text
    except Exception as e:
        print(f"Error generating response: {e}")
        return "I apologize, but I'm having trouble processing your request right now. Please try again."

@app.get("/")
async def root():
    """Root endpoint with basic information about Wooly."""
    return WOOLY_INFO

@app.post("/chat")
async def chat(request: ChatRequest):
    """Chat with Wooly."""
    response = get_chat_response(request.messages)
    
    # Include project info only in the first message
    include_project_info = len(request.messages) <= 1
    
    return ChatResponse(
        response=response,
        project_info=WOOLY_INFO if include_project_info else None
    )

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000) 