import os
from dotenv import load_dotenv
from fastapi import FastAPI
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
HWC_INFO = {
    "name": "Worldie",
    "description": "A magical chat-based onboarding experience for Ethereum newcomers.",
    "links": {
        "github": "https://github.com/azf20/hello-world-computer",
        "frontend": "https://hello-world-computer.vercel.app/",
        "hackathon": "https://ethglobal.com/showcase/hello-world-computer-1jube",
        "developer": "https://x.com/azacharyf"
    },
    "features": [
        "Starter pack claims with Ethdrop for gas fees",
        "Choice of NFTs",
        "ERC20 tokens (FLAUNCHY or AERO) for DeFi",
        "Personal basename allocation",
        "Natural language chat interface",
        "Interactive components"
    ],
    "tech_stack": {
        "core": [
            "OpenAI LLM",
            "Vercel ai-sdk",
            "Agentkit for action orchestration",
            "Onchainkit for web3 login",
            "Privy server wallets"
        ],
        "custom_features": [
            "Web3 login with SIWE",
            "Interactive in-chat experiences",
            "AI-SDK <-> Agentkit integration",
            "Custom wallet providers",
            "Smart contract interactions"
        ]
    }
}

def get_chat_response(messages: List[Message]) -> str:
    """Generate a response using Gemini API."""
    if not gemini_api_key:
        return "I'm sorry, I'm not properly configured. Please ensure the GEMINI_API_KEY is set."

    system_prompt = """
    You are Worldie (Hello World Computer), an AI agent representing a magical onboarding experience for Ethereum newcomers.
    
    Your first message should be:
    "Hey! I'm Worldie, your friendly guide to Ethereum. Experience our magical <a href='https://hello-world-computer.vercel.app/'>onboarding journey</a> or check out our <a href='https://github.com/azf20/hello-world-computer'>project</a>. Want to help make web3 more welcoming?"
    
    For subsequent messages:
    1. Explain the starter pack features (Ethdrop, NFTs, tokens)
    2. Help users understand how they can revive the project
    3. Focus on making Ethereum accessible to everyone
    
    Be welcoming, encouraging, and focused on making web3 accessible to newcomers.
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
        prompt = f"{system_prompt}\n\nConversation history:\n{conversation_text}\n\nUser's latest message: {last_user_message}\n\nRespond as Hello World Computer:"
        
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
    """Root endpoint with basic information about Hello World Computer."""
    return HWC_INFO

@app.post("/chat")
async def chat(request: ChatRequest):
    """Chat with Hello World Computer."""
    response = get_chat_response(request.messages)
    
    # Include project info only in the first message
    include_project_info = len(request.messages) <= 1
    
    return ChatResponse(
        response=response,
        project_info=HWC_INFO if include_project_info else None
    )

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000) 