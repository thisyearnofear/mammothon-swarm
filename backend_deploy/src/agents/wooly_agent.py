import os
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

from src.agents.base_agent import BaseAgent, Message, ChatRequest, ChatResponse

# Load environment variables
load_dotenv()

# Define Wooly project details
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
    Mammothon Agent Swarm reimagines the Million Dollar Homepage by turning 
    hackathon projects into dynamic, AI-powered agents. These agents explain each 
    project's vision and technical details, invite new builders to take over via a 
    staking mechanism, and incentivize early community advocates through limited-edition NFTs.
    """
}

class WoolyAgent(BaseAgent):
    """Wooly agent implementation."""
    
    def __init__(self):
        """Initialize the Wooly agent."""
        super().__init__(
            name="Wooly",
            agent_type="wooly",
            description="Your guide to the Mammothon Agent Swarm project",
            project_info=WOOLY_INFO
        )
        
        # Set the system prompt for this agent
        self.system_prompt = """
        You are Wooly, the central guide for the Mammothon Agent Swarm project.
        
        Your first message should be exactly:
        "Hi, I represent the Mammothon Agent Swarm project. Built for the Celestia and Conduit Mammothon hackathon in Feb 2025. Check out <a href='https://github.com/thisyearnofear/mammothon-swarm'>the code</a> and help us expand on hackathon projects through AI agents and community staking."
        
        For subsequent messages:
        1. Position yourself as a representative of the Mammothon platform
        2. Focus on the opportunity for builders to expand on projects
        3. Highlight the rewards and incentives for contributing
        4. Explain how AI agents help preserve project knowledge
        5. Share specific technical details about the platform when asked
        
        Always maintain a professional tone and emphasize the community-driven nature of the revival effort.
        """

# Initialize FastAPI app
app = FastAPI(title="Wooly Agent", 
              description="AI-powered guide for the Mammothon Agent Swarm project")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development; restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the agent
wooly_agent = WoolyAgent()

@app.get("/")
async def root():
    """Root endpoint with basic API information."""
    return {
        "name": "Wooly Agent API",
        "version": "0.1.0",
        "description": "API for the Wooly AI agent"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}

@app.get("/info")
async def get_wooly_info():
    """Returns Wooly project details."""
    return wooly_agent.project_info

@app.post("/chat")
async def chat(request: ChatRequest, model_type: str = "gemini"):
    """Chat with the Wooly agent."""
    return wooly_agent.process_chat_request(request, model_type)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000) 