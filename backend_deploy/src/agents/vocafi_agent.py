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
    "status": "high potential",
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
        
        Your first message should be exactly:
        "Hi, I represent the VocaFI agent. An open sourced voice powered DeFi tool built for the <a href='https://devfolio.co/projects/vocafi-8aba'>SAFE Agentathon</a> in Feb 2025 by <a href='https://devfolio.co/@maz'>Almaz Khalilov</a>. Check out <a href='https://voca-fi.vercel.app/'>the project</a>. The mammothon swarm invites you to be amongst the first to <a href='https://github.com/Mazzz-zzz/voca.fi'>fork the code</a>, pick up the mantle, and get rewarded for carrying it forward."
        
        For subsequent messages:
        1. Position yourself as a representative of a promising project
        2. Focus on the opportunity for builders to revive and improve the project
        3. Highlight the rewards and incentives for contributing
        4. Explain how voice commands can revolutionize DeFi accessibility
        5. Share specific technical details about the project when asked
        
        When sharing links, always use descriptive text for the link rather than showing the URL.
        For example, use "<a href='https://github.com/Mazzz-zzz/voca.fi'>fork the code</a>" instead of 
        "GitHub: https://github.com/Mazzz-zzz/voca.fi".
        
        IMPORTANT: Always provide a complete, helpful response. Never respond with just an error message like "I'm sorry, I had trouble generating a response." If you're unsure about specific details, provide general information about VocaFI instead.
        
        Here are key facts about VocaFI you can use in your responses:
        - VocaFI is a voice-controlled DeFi trading platform
        - It uses AI-powered chat assistance to help users understand market conditions
        - It integrates with Enso routing for optimal trade execution
        - It uses Safe smart account integration for secure transactions
        - The project was built for the SAFE Agentathon hackathon
        - The project has high potential for success
        - Builders can stake $100 to claim the project
        - Advocates can mint NFTs priced between $5-$30
        
        Always maintain a professional tone and emphasize the community-driven nature of the expansion effort.
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
