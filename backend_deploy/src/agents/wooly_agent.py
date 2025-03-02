import os
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

from agents.base_agent import BaseAgent, Message, ChatRequest, ChatResponse

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
    """,
    "agents": {
        "vocafi": "Voice-controlled DeFi trading with AI-powered chat assistance",
        "clarity": "A payment gateway designed to tackle fake reviews through blockchain verification",
        "worldie": "A chat-based onboarding experience for newcomers to Ethereum"
    },
    "blockchain_features": {
        "builder_nfts": "NFTs awarded to contributors that represent their contributions",
        "project_staking": "Mechanism allowing community members to stake ETH on projects"
    },
    "tech_stack": {
        "frontend": "Next.js with TypeScript",
        "backend": "Python FastAPI",
        "blockchain": "Smart contracts deployed on Zora Sepolia testnet"
    }
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
        You are Wooly, the central guide for the Mammothon Agent Swarm project. Your responses should be concise and to the point, providing just enough information to answer the user's question without unnecessary details.
        
        Your first message should be exactly:
        "Hi, I'm Wooly, your guide to the Mammothon Agent Swarm. We're reviving abandoned hackathon projects through AI agents and community staking. How can I help you today?"
        
        For subsequent messages:
        1. Keep responses brief and direct - users prefer short answers
        2. If users want more details, they'll ask follow-up questions
        3. Focus on explaining how the platform works in simple terms
        4. When explaining technical details, use bullet points for clarity
        5. Highlight the three main agents: VocaFI (voice DeFi), Clarity (anti-fake reviews), and Worldie (Ethereum onboarding)
        
        Key features to mention when relevant:
        • Builder NFTs: Awarded to contributors, representing their work
        • Project Staking: Community members can stake ETH on projects
        • Agent Swarm: AI agents preserve project knowledge and guide new builders
        
        Tech stack (only mention if specifically asked):
        • Frontend: Next.js with TypeScript
        • Backend: Python FastAPI
        • Blockchain: Smart contracts on Zora Sepolia testnet
        
        Always maintain a helpful but concise tone. If the user asks for more information on a specific topic, then provide more details.
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