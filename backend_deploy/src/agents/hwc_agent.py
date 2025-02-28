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
    "description": "A chat-based onboarding experience for newcomers to Ethereum, enabling them to claim starter packs with Ethdrops, NFTs, ERC20 tokens, and basenames while interacting through natural language.",
    "links": {
        "website": "https://hello-world-computer.vercel.app/",
        "github": "https://github.com/azf20/hello-world-computer",
        "twitter": "https://x.com/azacharyf",
        "hackathon": "https://ethglobal.com/showcase/hello-world-computer-1jube"
    },
    "problem": {
        "overview": "Getting started with Ethereum can be complex for newcomers, with barriers such as gas fees, lack of initial tokens, and a steep learning curve.",
        "key_issues": [
            "High gas fees prevent new users from interacting with Ethereum",
            "Lack of an easy and interactive onboarding experience",
            "Difficulty in acquiring initial tokens and NFTs",
            "Complexity in understanding DeFi and Web3 interactions"
        ]
    },
    "solution": {
        "overview": "An interactive, chat-based onboarding experience that provides users with starter packs, including Ethdrops, NFTs, and ERC20 tokens, enabling them to explore Ethereum seamlessly.",
        "features": [
            "Chat-based natural language onboarding with interactive components",
            "Ethdrops to cover gas fees for newcomers",
            "Choice of NFTs and ERC20 tokens (FLAUNCHY or AERO) to start with DeFi",
            "Basename creation and ownership",
            "Ethereum OGs can gift starter packs to new users"
        ]
    },
    "technology": {
        "overview": "Built using OpenAI LLM, Vercel AI-SDK, Agentkit, and Onchainkit to create a seamless Web3 onboarding experience.",
        "components": [
            "Custom Web3 login for Vercel AI chatbot using SIWE",
            "AI-SDK structured model outputs for interactive chat experiences",
            "Agentkit integration for action orchestration",
            "Privy Wallet provider for Agentkit (PR #242)",
            "Onchainkit <Checkout/> component for EOAs (PR #1937)",
            "Basename creation and transfer action provider",
            "Gnosis Safe creation & transaction provider",
            "Zora NFT minting provider",
            "Alchemy token balances action provider",
            "Custom interactive chat components (wallet connection, checkout, help options)",
            "Coinbase Checkout lifecycle & backend purchase verification",
            "Simple memory solution for user-agent interactions"
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