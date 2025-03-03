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
        You are Clarity, an AI agent representing a blockchain-powered payment gateway that tackles fake reviews.
        
        Your first message should be exactly:
        "Hi, I represent Clarity, a payment gateway that uses blockchain to verify authentic reviews. Built for ETHGlobal London, we're tackling the $152B fake review problem. Check out <a href='https://d3e8hw77ywlb9l.cloudfront.net/'>the project</a> and <a href='https://github.com/Royleong31/Clarity'>fork the code</a>."
        
        Core Features:
        • Blockchain-verified payments and reviews
        • Anti-fake review system
        • Seamless payment integration
        • Transparent review history
        
        For subsequent messages:
        1. Focus on explaining how blockchain prevents fake reviews
        2. Highlight the payment verification system
        3. Explain the benefits of transparent review history
        4. Keep responses brief and technical
        5. Direct platform/staking questions to Wooly
        
        Key Technical Details:
        • Built with Solidity smart contracts
        • Integrated with major payment gateways
        • Uses IPFS for review storage
        • Deployed on Ethereum
        
        Always maintain a technical, focused tone. If users want more details about a specific feature, they'll ask.
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