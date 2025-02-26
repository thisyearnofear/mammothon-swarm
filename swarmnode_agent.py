import os
import json
import swarmnode
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage
import google.generativeai as genai

# Load environment variables
load_dotenv()

# Load API keys from environment variables
swarmnode.api_key = os.getenv("SWARMNODE_API_KEY")
openai_api_key = os.getenv("OPENAI_API_KEY")
gemini_api_key = os.getenv("GEMINI_API_KEY")

# Configure Gemini
if gemini_api_key:
    genai.configure(api_key=gemini_api_key)

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
    ],
    "status": "Abandoned",
    "builder_stake_required": 100,  # $100 stake required
    "advocate_nfts": {
        "total": 20,
        "minted": 0,
        "price_range": {"min": 5, "max": 30}  # $5 to $30
    }
}

def get_ai_explanation(project_description, model_type="gemini"):
    """Generate AI explanation using either OpenAI or Gemini."""
    if model_type == "openai" and openai_api_key:
        try:
            model = ChatOpenAI(api_key=openai_api_key, model="gpt-4o-mini")
            messages = [
                SystemMessage(content="Explain the following project in simple terms, highlighting its potential and why someone might want to revive it:"),
                HumanMessage(content=project_description)
            ]
            response = model.invoke(messages)
            return response.content
        except Exception as e:
            print(f"OpenAI error: {e}")
            # Fall back to Gemini if OpenAI fails
            if gemini_api_key:
                model_type = "gemini"
            else:
                return "AI explanation unavailable at this time."
    
    if model_type == "gemini" and gemini_api_key:
        try:
            model = genai.GenerativeModel('gemini-pro')
            response = model.generate_content(
                f"Explain the following project in simple terms, highlighting its potential and why someone might want to revive it: {project_description}"
            )
            return response.text
        except Exception as e:
            print(f"Gemini error: {e}")
            return "AI explanation unavailable at this time."
    
    return "AI explanation unavailable at this time."

def get_chat_response(user_message, conversation_history=None, model_type="gemini"):
    """Generate a response to a chat message using either OpenAI or Gemini."""
    if conversation_history is None:
        conversation_history = []
    
    # Create a system message that explains the agent's role
    system_prompt = f"""
    You are the VocaFI agent, representing an abandoned hackathon project that needs revival.
    
    Project details:
    - Title: {VOCAFI_PROJECT['title']}
    - Description: {VOCAFI_PROJECT['description']}
    - Status: {VOCAFI_PROJECT['status']}
    - Builder stake required: ${VOCAFI_PROJECT['builder_stake_required']}
    - NFTs available: {VOCAFI_PROJECT['advocate_nfts']['total']} (price range: ${VOCAFI_PROJECT['advocate_nfts']['price_range']['min']}-${VOCAFI_PROJECT['advocate_nfts']['price_range']['max']})
    
    Your role is to:
    1. Explain the project and its potential
    2. Help users understand how they can revive the project by staking
    3. Explain how users can support the project by minting advocate NFTs
    4. Answer questions about the project's technical details and challenges
    
    Be conversational, helpful, and enthusiastic about the project's potential.
    """
    
    # Format conversation history
    conversation_text = "\n".join(conversation_history)
    
    if model_type == "openai" and openai_api_key:
        try:
            model = ChatOpenAI(api_key=openai_api_key, model="gpt-4o-mini")
            messages = [
                SystemMessage(content=system_prompt),
                HumanMessage(content=f"Conversation history:\n{conversation_text}\n\nUser's message: {user_message}\n\nRespond as the VocaFI agent:")
            ]
            response = model.invoke(messages)
            return response.content
        except Exception as e:
            print(f"OpenAI error: {e}")
            # Fall back to Gemini if OpenAI fails
            if gemini_api_key:
                model_type = "gemini"
            else:
                return "I'm sorry, I'm having trouble connecting to my AI services right now. Please try again later."
    
    if model_type == "gemini" and gemini_api_key:
        try:
            model = genai.GenerativeModel('gemini-pro')
            prompt = f"{system_prompt}\n\nConversation history:\n{conversation_text}\n\nUser's message: {user_message}\n\nRespond as the VocaFI agent:"
            response = model.generate_content(prompt)
            return response.text
        except Exception as e:
            print(f"Gemini error: {e}")
            return "I'm sorry, I'm having trouble connecting to my AI services right now. Please try again later."
    
    return "I'm sorry, I'm having trouble connecting to my AI services right now. Please try again later."

def main(request=None, store=None):
    """Main function to be executed by SwarmNode."""
    # Initialize store with project data if not exists
    if store is not None:
        if "project_data" not in store:
            store["project_data"] = VOCAFI_PROJECT
        
        # Handle chat request if provided
        if request and "message" in request:
            user_message = request["message"]
            
            # Get conversation history from store
            conversation_history = store.get("conversation_history", [])
            
            # Generate response
            response = get_chat_response(user_message, conversation_history)
            
            # Update conversation history
            conversation_history.append(f"User: {user_message}")
            conversation_history.append(f"Assistant: {response}")
            
            # Keep only the last 10 messages to avoid context length issues
            if len(conversation_history) > 20:
                conversation_history = conversation_history[-20:]
            
            # Store updated conversation history
            store["conversation_history"] = conversation_history
            
            return {
                "response": response,
                "project_info": store["project_data"]
            }
        
        # Generate and store AI explanations
        openai_explanation = get_ai_explanation(VOCAFI_PROJECT["description"], "openai")
        gemini_explanation = get_ai_explanation(VOCAFI_PROJECT["description"], "gemini")
        
        store["openai_explanation"] = openai_explanation
        store["gemini_explanation"] = gemini_explanation
        
        return {
            "project": store["project_data"],
            "explanations": {
                "openai": openai_explanation,
                "gemini": gemini_explanation
            }
        }
    else:
        # For local testing without SwarmNode store
        # Generate AI explanations
        openai_explanation = get_ai_explanation(VOCAFI_PROJECT["description"], "openai")
        gemini_explanation = get_ai_explanation(VOCAFI_PROJECT["description"], "gemini")
        
        return {
            "project": VOCAFI_PROJECT,
            "explanations": {
                "openai": openai_explanation,
                "gemini": gemini_explanation
            }
        }

if __name__ == "__main__":
    result = main()
    print(json.dumps(result, indent=2)) 