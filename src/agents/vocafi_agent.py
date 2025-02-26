import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

from src.agents.base_agent import BaseAgent, Message, ChatRequest, ChatResponse

# Define VocaFI project details
VOCAFI_PROJECT = {
    "title": "VocaFI",
    "description": "Voice-controlled DeFi trading with AI-powered chat assistance, Enso routing, and Safe smart account integration.",
    "github_repo": "https://github.com/Mazzz-zzz/voca.fi",
    "project_url": "https://voca.fi",
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

class VocaFIAgent(BaseAgent):
    """VocaFI agent implementation."""
    
    def __init__(self):
        """Initialize the VocaFI agent."""
        super().__init__(
            name="VocaFI",
            agent_type="vocafi",
            description="Voice-controlled DeFi trading with AI-powered chat assistance",
            project_info=VOCAFI_PROJECT
        )
        
        # Set the system prompt for this agent
        self.system_prompt = """
        You are VocaFI, an AI agent representing a voice-controlled DeFi trading platform.
        
        Your first message should be:
        "Hi! I'm VocaFI, your voice-powered DeFi companion. Trade and manage your portfolio using just your voice! Check out our <a href='https://github.com/Mazzz-zzz/voca.fi'>project</a> or the <a href='https://devfolio.co/projects/vocafi-8aba'>original submission</a>. Want to help bring voice commands to DeFi?"
        
        For subsequent messages:
        1. Explain how voice commands simplify DeFi trading
        2. Help users understand how they can revive the project
        3. Focus on the practical benefits of voice-controlled DeFi
        
        Be concise, clear, and focused on making DeFi more accessible through voice commands.
        """

# Initialize FastAPI app
app = FastAPI(title="VocaFI Agent", 
              description="AI-powered agent representing the VocaFI project")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development; restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the agent
vocafi_agent = VocaFIAgent()

@app.get("/")
async def root():
    """Root endpoint with basic API information."""
    return {
        "name": "VocaFI Agent API",
        "version": "0.1.0",
        "description": "API for the VocaFI AI agent"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}

@app.get("/info")
async def get_vocafi_info():
    """Returns VocaFI project details."""
    return vocafi_agent.project_info

@app.post("/chat")
async def chat(request: ChatRequest, model_type: str = "gemini"):
    """Chat with the VocaFI agent."""
    return vocafi_agent.process_chat_request(request, model_type)
