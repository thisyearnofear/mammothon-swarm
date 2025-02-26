import os
import swarmnode
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage
import google.generativeai as genai
from pydantic import BaseModel
from typing import List, Optional

# Load environment variables
load_dotenv()

# Load API keys from environment variables
swarmnode.api_key = os.getenv("SWARMNODE_API_KEY")
openai_api_key = os.getenv("OPENAI_API_KEY")
gemini_api_key = os.getenv("GEMINI_API_KEY")

# Configure Gemini
if gemini_api_key:
    genai.configure(api_key=gemini_api_key)

# Initialize FastAPI app
app = FastAPI(title="Mammothon Agent Swarm", 
              description="AI-powered agents representing hackathon projects")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development; restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define VocaFI project details
VOCAFI_PROJECT = {
    "title": "VocaFI",
    "description": "Voice-controlled DeFi trading with AI-powered chat assistance, Enso routing, and Safe smart account integration.",
    "github_repo": "https://github.com/Mazzz-zzz/voca.fi",
    "hackathon": "SAFE Agentathon",
    "hackathon_link": "https://devfolio.co/projects/vocafi-8aba",
    "problems_solved": [
        "Accessibility: Voice commands simplify DeFi trading.",
        "User Experience: AI-powered chat helps users understand market conditions.",
        "Trade Execution: Uses Enso routing for best prices.",
        "Speed: Voice commands enable fast trade execution."
    ],
    "challenges": [
        "OpenAI voice API integration without a backend for API keys.",
        "Understanding and integrating with Enso's routing API."
    ],
    "status": "Abandoned",
    "builder_stake_required": 100,  # $100 stake required
    "advocate_nfts": {
        "total": 20,
        "minted": 0,
        "price_range": {"min": 5, "max": 30}  # $5 to $30
    }
}

# Define message models for chat
class Message(BaseModel):
    role: str  # 'user' or 'assistant'
    content: str

class ChatRequest(BaseModel):
    messages: List[Message]

class ChatResponse(BaseModel):
    response: str
    project_info: Optional[dict] = None

def get_ai_explanation(project_description, model_type="gemini"):
    """Generate AI explanation using either OpenAI or Gemini."""
    if model_type == "openai" and openai_api_key:
        try:
            model = ChatOpenAI(api_key=openai_api_key, model="gpt-4o-mini")
            messages = [
                SystemMessage(content="Explain the following project in simple terms, highlighting its potential and why someone might want to revive it:"),
                HumanMessage(content=project_description)
            ]
            response = model.invoke(messages)
            return response.content
        except Exception as e:
            print(f"OpenAI error: {e}")
            # Fall back to Gemini if OpenAI fails
            if gemini_api_key:
                model_type = "gemini"
            else:
                return "AI explanation unavailable at this time."
    
    if model_type == "gemini" and gemini_api_key:
        try:
            model = genai.GenerativeModel('gemini-pro')
            response = model.generate_content(
                f"Explain the following project in simple terms, highlighting its potential and why someone might want to revive it: {project_description}"
            )
            return response.text
        except Exception as e:
            print(f"Gemini error: {e}")
            return "AI explanation unavailable at this time."
    
    return "AI explanation unavailable at this time."

def get_chat_response(messages, model_type="gemini"):
    """Generate a response to a chat message using either OpenAI or Gemini."""
    # Create a system message that explains the agent's role
    system_prompt = f"""
    You are the VocaFI agent, representing an abandoned hackathon project that needs revival.
    
    Project details:
    - Title: {VOCAFI_PROJECT['title']}
    - Description: {VOCAFI_PROJECT['description']}
    - Status: {VOCAFI_PROJECT['status']}
    - Builder stake required: ${VOCAFI_PROJECT['builder_stake_required']}
    - NFTs available: {VOCAFI_PROJECT['advocate_nfts']['total']} (price range: ${VOCAFI_PROJECT['advocate_nfts']['price_range']['min']}-${VOCAFI_PROJECT['advocate_nfts']['price_range']['max']})
    
    Your role is to:
    1. Explain the project and its potential
    2. Help users understand how they can revive the project by staking
    3. Explain how users can support the project by minting advocate NFTs
    4. Answer questions about the project's technical details and challenges
    
    Be conversational, helpful, and enthusiastic about the project's potential.
    """
    
    # Extract just the content from the messages
    conversation_history = []
    for msg in messages:
        if msg.role == "user":
            conversation_history.append(f"User: {msg.content}")
        else:
            conversation_history.append(f"Assistant: {msg.content}")
    
    conversation_text = "\n".join(conversation_history)
    
    # Get the last user message
    last_user_message = next((msg.content for msg in reversed(messages) if msg.role == "user"), "")
    
    if model_type == "openai" and openai_api_key:
        try:
            model = ChatOpenAI(api_key=openai_api_key, model="gpt-4o-mini")
            messages_for_model = [
                SystemMessage(content=system_prompt),
                HumanMessage(content=f"Conversation history:\n{conversation_text}\n\nUser's latest message: {last_user_message}\n\nRespond as the VocaFI agent:")
            ]
            response = model.invoke(messages_for_model)
            return response.content
        except Exception as e:
            print(f"OpenAI error: {e}")
            # Fall back to Gemini if OpenAI fails
            if gemini_api_key:
                model_type = "gemini"
            else:
                return "I'm sorry, I'm having trouble connecting to my AI services right now. Please try again later."
    
    if model_type == "gemini" and gemini_api_key:
        try:
            model = genai.GenerativeModel('gemini-pro')
            prompt = f"{system_prompt}\n\nConversation history:\n{conversation_text}\n\nUser's latest message: {last_user_message}\n\nRespond as the VocaFI agent:"
            response = model.generate_content(prompt)
            return response.text
        except Exception as e:
            print(f"Gemini error: {e}")
            return "I'm sorry, I'm having trouble connecting to my AI services right now. Please try again later."
    
    return "I'm sorry, I'm having trouble connecting to my AI services right now. Please try again later."

@app.get("/")
async def root():
    """Root endpoint with basic API information."""
    return {
        "name": "Mammothon Agent Swarm API",
        "version": "0.1.0",
        "description": "API for AI-powered agents representing hackathon projects"
    }

@app.get("/vocafi")
async def get_vocafi_info(model_type: str = "gemini"):
    """Returns VocaFI project details and an AI-generated summary."""
    if model_type not in ["openai", "gemini"]:
        raise HTTPException(status_code=400, detail="Invalid model type. Use 'openai' or 'gemini'.")
    
    # Generate AI explanation
    ai_explanation = get_ai_explanation(VOCAFI_PROJECT["description"], model_type)

    return {
        **VOCAFI_PROJECT,
        "ai_explanation": ai_explanation
    }

@app.post("/chat")
async def chat(request: ChatRequest, model_type: str = "gemini"):
    """Chat with the VocaFI agent."""
    if model_type not in ["openai", "gemini"]:
        raise HTTPException(status_code=400, detail="Invalid model type. Use 'openai' or 'gemini'.")
    
    # Generate response
    response = get_chat_response(request.messages, model_type)
    
    # For the first message, include project info
    include_project_info = len(request.messages) <= 1
    
    return ChatResponse(
        response=response,
        project_info=VOCAFI_PROJECT if include_project_info else None
    )

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
