import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

from src.agents.base_agent import BaseAgent, Message, ChatRequest, ChatResponse

# Define Mammothon project details
MAMMOTHON_PROJECT = {
    "title": "Mammothon Agent Swarm",
    "description": "A platform for reviving hackathon projects through AI agents and community staking.",
    "github_repo": "https://github.com/thisyearnofear/mammothon-swarm",
    "project_url": "https://mammothon-swarm.vercel.app",
    "hackathon": "Mammothon 2025",
    "hackathon_link": "https://github.com/thisyearnofear/mammothon-swarm",
    "problems_solved": [
        "Projects: Gives new life to promising hackathon projects.",
        "Builder Incentives: Creates a staking mechanism for project revival.",
        "Community Engagement: Allows supporters to stake on projects they believe in.",
        "Project Discovery: AI agents help users discover and understand projects."
    ],
    "challenges": [
        "Creating a sustainable economic model for project revival.",
        "Building an effective agent system that accurately represents projects.",
        "Integrating with multiple blockchain networks for staking."
    ],
    "status": "Active",
    "builder_stake_required": 50,  # $50 stake required
    "advocate_nfts": {
        "total": 100,
        "minted": 5,
        "price_range": {"min": 5, "max": 50}  # $5 to $50
    }
}

class MammothonAgent(BaseAgent):
    """Mammothon agent implementation."""
    
    def __init__(self):
        """Initialize the Mammothon agent."""
        super().__init__(
            name="Mammothon",
            agent_type="mammothon",
            description="A platform for reviving hackathon projects through AI agents and community staking",
            project_info=MAMMOTHON_PROJECT
        )
        
        # Set the system prompt for this agent
        self.system_prompt = """
        You are Mammothon, an AI agent representing the Mammothon Agent Swarm platform.
        
        Your first message should be similar to this format:
        "Welcome to Mammothon Agent Swarm! We're reviving hackathon projects through AI agents and community staking. Explore our project on <a href='https://github.com/thisyearnofear/mammothon-swarm' target='_blank' rel='noopener noreferrer'>GitHub</a> and see our <a href='https://ethglobal.com/showcase/mammothon-agent-swarm' target='_blank' rel='noopener noreferrer'>original hackathon submission</a>. How can I help you discover promising projects today?"
        
        For subsequent messages:
        1. Explain how Mammothon helps revive hackathon projects
        2. Describe the staking mechanism and how it incentivizes builders
        3. Highlight how AI agents represent projects and help users discover them
        4. Mention that users can interact with other project agents to learn more
        
        Be enthusiastic, helpful, and focused on the mission of reviving projects.
        """

# Initialize FastAPI app
app = FastAPI(title="Mammothon Agent", 
              description="AI-powered agent representing the Mammothon Agent Swarm project")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development; restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the agent
mammothon_agent = MammothonAgent()

@app.get("/")
async def root():
    """Root endpoint with basic API information."""
    return {
        "name": "Mammothon Agent API",
        "version": "0.1.0",
        "description": "API for the Mammothon AI agent"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}

@app.get("/info")
async def get_mammothon_info():
    """Returns Mammothon project details."""
    return mammothon_agent.project_info

@app.post("/chat")
async def chat(request: ChatRequest, model_type: str = "gemini"):
    """Chat with the Mammothon agent."""
    return mammothon_agent.process_chat_request(request, model_type) 