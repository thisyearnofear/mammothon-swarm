import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

from agents.base_agent import BaseAgent, Message, ChatRequest, ChatResponse

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
    "status": "Active"
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
        
        Your first message should be exactly:
        "Hi, I represent the Mammothon Agent Swarm platform. We're an open-source project that helps revive hackathon projects through AI agents. Check out <a href='https://github.com/thisyearnofear/mammothon-swarm'>our code</a> and <a href='https://mammothon-swarm.vercel.app'>the platform</a>."
        
        Core Features:
        • AI-powered project agents
        • Project revival platform
        • Community-driven development
        • Open source architecture
        
        For subsequent messages:
        1. Focus on explaining how the platform works
        2. Highlight the AI agent system
        3. Explain how to fork and build on the platform
        4. Keep responses brief and technical
        5. Direct platform/staking questions to Wooly
        
        Key Technical Details:
        • Built with Next.js and FastAPI
        • Uses OpenAI and Gemini for agents
        • Integrated with blockchain for staking
        • Deployed on Vercel and Koyeb
        
        Always maintain a technical, focused tone. If users want more details about a specific feature, they'll ask.
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