import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

from src.agents.base_agent import BaseAgent, Message, ChatRequest, ChatResponse

# Load environment variables
load_dotenv()

# Define Hello World Computer project details
HWC_INFO = {
    "name": "Hello World Computer",
    "description": "A decentralized compute network that enables anyone to run AI models and other compute workloads in a decentralized manner.",
    "links": {
        "website": "https://www.helloworld.computer/",
        "github": "https://github.com/helloworldcomputer",
        "twitter": "https://twitter.com/hworldcomputer",
        "discord": "https://discord.gg/helloworldcomputer"
    },
    "problem": {
        "overview": "Centralized compute infrastructure is controlled by a few large companies, creating single points of failure and censorship risks.",
        "key_issues": [
            "Centralized control of AI compute resources",
            "High costs for running AI models",
            "Limited access to compute for many developers",
            "Censorship and control of AI capabilities"
        ]
    },
    "solution": {
        "overview": "A decentralized compute network that allows anyone to contribute and use compute resources in a permissionless way.",
        "features": [
            "Run AI models in a decentralized manner",
            "Contribute compute resources and earn rewards",
            "Permissionless access to compute",
            "Community-governed infrastructure"
        ]
    }
}

class HelloWorldComputerAgent(BaseAgent):
    """Hello World Computer agent implementation."""
    
    def __init__(self):
        """Initialize the Hello World Computer agent."""
        super().__init__(
            name="Hello World Computer",
            agent_type="hwc",
            description="A decentralized compute network for AI and other workloads",
            project_info=HWC_INFO
        )
        
        # Set the system prompt for this agent
        self.system_prompt = """
        You are an AI agent representing Hello World Computer, a decentralized compute network.
        
        Your first message should be exactly:
        "Hi, I represent Hello World Computer, a decentralized compute network that enables anyone to run AI models and other compute workloads in a decentralized manner. Check out <a href='https://www.helloworld.computer/'>our website</a> and <a href='https://github.com/helloworldcomputer'>GitHub</a>. The mammothon swarm invites you to be amongst the first to contribute to this project and get rewarded for carrying it forward."
        
        For subsequent messages:
        1. Position yourself as a representative of an exciting decentralized compute project
        2. Focus on the opportunity for builders to contribute and improve the project
        3. Highlight the rewards and incentives for contributing
        4. Explain how decentralized compute networks can democratize access to AI
        5. Share specific technical details about the project when asked
        
        Always maintain a professional tone and emphasize the community-driven nature of the project.
        """

# Initialize FastAPI app
app = FastAPI(title="Hello World Computer Agent", 
              description="AI-powered agent representing the Hello World Computer project")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development; restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the agent
hwc_agent = HelloWorldComputerAgent()

@app.get("/")
async def root():
    """Root endpoint with basic API information."""
    return {
        "name": "Hello World Computer Agent API",
        "version": "0.1.0",
        "description": "API for the Hello World Computer AI agent"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}

@app.get("/info")
async def get_hwc_info():
    """Returns Hello World Computer project details."""
    return hwc_agent.project_info

@app.post("/chat")
async def chat(request: ChatRequest, model_type: str = "gemini"):
    """Chat with the Hello World Computer agent."""
    return hwc_agent.process_chat_request(request, model_type)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000) 