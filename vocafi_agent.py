import os
import swarmnode
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage
from fastapi import FastAPI

# Load API keys from environment variables
swarmnode.api_key = os.getenv("SWARMNODE_API_KEY")
openai_api_key = os.getenv("OPENAI_API_KEY")

# Initialize FastAPI app
app = FastAPI()

# Define VocaFI project details
VOCAFI_PROJECT = {
    "title": "VocaFI",
    "description": "Voice-controlled DeFi trading with AI-powered chat assistance, Enso routing, and Safe smart account integration.",
    "github_repo": "https://github.com/Mazzz-zzz/voca.fi",
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
    ]
}

# AI Model
model = ChatOpenAI(api_key=openai_api_key, model="gpt-4o-mini")

@app.get("/vocafi")
async def get_vocafi_info():
    """Returns VocaFI project details and an AI-generated summary."""

    # Generate AI explanation
    messages = [
        SystemMessage("Explain the VocaFI project in simple terms."),
        HumanMessage(VOCAFI_PROJECT["description"])
    ]
    response = model.invoke(messages)

    return {
        "title": VOCAFI_PROJECT["title"],
        "description": VOCAFI_PROJECT["description"],
        "github_repo": VOCAFI_PROJECT["github_repo"],
        "hackathon": VOCAFI_PROJECT["hackathon"],
        "hackathon_link": VOCAFI_PROJECT["hackathon_link"],
        "problems_solved": VOCAFI_PROJECT["problems_solved"],
        "challenges": VOCAFI_PROJECT["challenges"],
        "ai_explanation": response.content
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
