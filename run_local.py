import os
import sys
from dotenv import load_dotenv
import uvicorn

# Add src directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), "src"))

# Load environment variables
load_dotenv()

if __name__ == "__main__":
    print("Starting Mammothon Agent Swarm Backend API locally...")
    print(f"SwarmNode API Key: {'✓ Set' if os.getenv('SWARMNODE_API_KEY') else '✗ Not Set'}")
    print(f"OpenAI API Key: {'✓ Set' if os.getenv('OPENAI_API_KEY') else '✗ Not Set'}")
    print(f"Gemini API Key: {'✓ Set' if os.getenv('GEMINI_API_KEY') else '✗ Not Set'}")
    
    # Run the server
    uvicorn.run("src.api.serve:app", host="0.0.0.0", port=8001, reload=True) 