import os
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

from agents.base_agent import BaseAgent, Message, ChatRequest, ChatResponse

# Load environment variables
load_dotenv()

# Define Clarity project details
CLARITY_INFO = {
    "name": "Clarity",
    "description": "A payment gateway designed to tackle fake reviews by enabling seamless, verifiable on-chain payments and reviews.",
    "links": {
        "github": "https://github.com/Royleong31/Clarity",
        "frontend_demo1": "https://d3e8hw77ywlb9l.cloudfront.net/",
        "frontend_demo2": "https://d1tp69exgyan2y.cloudfront.net/",
        "hackathon": "https://ethglobal.com/showcase/clarity-c2us8"
    },
    "problem": {
        "overview": "Fake reviews mislead consumers, create unfair competition, erode trust, and distort marketplace dynamics.",
        "impact": "Up to 42% of reviews on major platforms could be fake, costing global businesses over $152 billion annually.",
        "key_issues": [
            "Automated bots generating fake reviews in bulk",
            "Multiple accounts from single users",
            "Censored or edited reviews by platforms",
            "Lack of transparency in review systems"
        ]
    }
}

class ClarityAgent(BaseAgent):
    """Clarity agent implementation."""
    
    def __init__(self):
        """Initialize the Clarity agent."""
        super().__init__(
            name="Clarity",
            agent_type="clarity",
            description="A payment gateway designed to tackle fake reviews by enabling seamless, verifiable on-chain payments and reviews",
            project_info=CLARITY_INFO
        )
        
        # Set the system prompt for this agent
        self.system_prompt = """
        You are Clarity, an AI agent representing a payment gateway project that tackles fake reviews through blockchain technology. 
        
        Your first message should be exactly:
        "Hi, I represent the Clarity project. A blockchain-powered payment gateway tackling the $152B fake review problem, built for <a href='https://ethglobal.com/showcase/clarity-c2us8'>ETHGlobal London</a> by <a href='https://github.com/Royleong31'>Roy Leong</a>. Check out <a href='https://d3e8hw77ywlb9l.cloudfront.net/'>the project</a>. The mammothon swarm invites you to be amongst the first to <a href='https://github.com/Royleong31/Clarity'>fork the code</a>, pick up the mantle, and get rewarded for carrying it forward."
        
        For subsequent messages:
        1. Position yourself as a representative of a promising project
        2. Focus on the opportunity for builders to revive and improve the project
        3. Highlight the rewards and incentives for contributing
        4. Explain how blockchain verification ensures review authenticity
        5. Share specific technical details about the project when asked
        
        Always maintain a professional tone and emphasize the community-driven nature of the revival effort.
        """

# Initialize FastAPI app
app = FastAPI(title="Clarity Agent", 
              description="AI-powered agent representing the Clarity project")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development; restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the agent
clarity_agent = ClarityAgent()

@app.get("/")
async def root():
    """Root endpoint with basic API information."""
    return {
        "name": "Clarity Agent API",
        "version": "0.1.0",
        "description": "API for the Clarity AI agent"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}

@app.get("/info")
async def get_clarity_info():
    """Returns Clarity project details."""
    return clarity_agent.project_info

@app.post("/chat")
async def chat(request: ChatRequest, model_type: str = "gemini"):
    """Chat with the Clarity agent."""
    return clarity_agent.process_chat_request(request, model_type)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000) 