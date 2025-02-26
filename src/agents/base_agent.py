import os
import swarmnode
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import google.generativeai as genai
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage

# Load environment variables
load_dotenv()

# Load API keys from environment variables
swarmnode.api_key = os.getenv("SWARMNODE_API_KEY")
openai_api_key = os.getenv("OPENAI_API_KEY")
gemini_api_key = os.getenv("GEMINI_API_KEY")

# Configure Gemini
if gemini_api_key:
    genai.configure(api_key=gemini_api_key)
    # Set default safety settings
    safety_settings = {
        "HARM_CATEGORY_HARASSMENT": "BLOCK_NONE",
        "HARM_CATEGORY_HATE_SPEECH": "BLOCK_NONE",
        "HARM_CATEGORY_SEXUALLY_EXPLICIT": "BLOCK_NONE",
        "HARM_CATEGORY_DANGEROUS_CONTENT": "BLOCK_NONE",
    }

# Define message models for chat
class Message(BaseModel):
    role: str  # 'user' or 'assistant'
    content: str

class ChatRequest(BaseModel):
    messages: List[Message]

class ChatResponse(BaseModel):
    response: str
    project_info: Optional[dict] = None

class BaseAgent:
    """Base class for all agents in the Mammothon Agent Swarm."""
    
    def __init__(self, name: str, agent_type: str, description: str, project_info: Dict[str, Any]):
        """Initialize the agent with basic information."""
        self.name = name
        self.type = agent_type
        self.description = description
        self.project_info = project_info
        self.system_prompt = ""
        
        # Set up links for the agent
        self.links_html = self._generate_links_html()
    
    def _generate_links_html(self) -> str:
        """Generate HTML for project links."""
        links_html = '<div class="agent-links">'
        
        if "github_repo" in self.project_info:
            links_html += f'<p><strong>GitHub:</strong> <a href="{self.project_info["github_repo"]}" target="_blank" rel="noopener noreferrer">{self.project_info["github_repo"]}</a></p>'
        
        if "project_url" in self.project_info:
            links_html += f'<p><strong>Project:</strong> <a href="{self.project_info["project_url"]}" target="_blank" rel="noopener noreferrer">{self.project_info["project_url"]}</a></p>'
        
        if "hackathon_link" in self.project_info:
            links_html += f'<p><strong>Hackathon:</strong> <a href="{self.project_info["hackathon_link"]}" target="_blank" rel="noopener noreferrer">View Submission</a></p>'
        
        links_html += '</div>'
        return links_html
    
    def get_chat_response(self, messages: List[Message], model_type: str = "gemini") -> str:
        """Generate a response to a chat message using either OpenAI or Gemini."""
        if not self.system_prompt:
            raise NotImplementedError("System prompt must be defined in the child class")
        
        # Extract just the content from the messages
        conversation_history = []
        for msg in messages:
            if msg.role == "user":
                conversation_history.append(f"User: {msg.content}")
            else:
                conversation_history.append(f"Assistant: {msg.content}")
        
        conversation_text = "\n".join(conversation_history)
        
        # Get the last user message
        last_user_message = next((msg.content for msg in reversed(messages) if msg.role == "user"), "")
        
        if model_type == "openai" and openai_api_key:
            try:
                model = ChatOpenAI(api_key=openai_api_key, model="gpt-4o-mini")
                messages_for_model = [
                    SystemMessage(content=self.system_prompt),
                    HumanMessage(content=f"Conversation history:\n{conversation_text}\n\nUser's latest message: {last_user_message}\n\nRespond as the {self.name} agent:")
                ]
                response = model.invoke(messages_for_model)
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
                model = genai.GenerativeModel('gemini-1.5-pro')
                prompt = f"{self.system_prompt}\n\nConversation history:\n{conversation_text}\n\nUser's latest message: {last_user_message}\n\nRespond as the {self.name} agent:"
                response = model.generate_content(
                    prompt,
                    safety_settings=safety_settings,
                    generation_config={
                        "temperature": 0.7,
                        "top_p": 0.8,
                        "top_k": 40
                    }
                )
                return response.text
            except Exception as e:
                print(f"Gemini error: {e}")
                return "I'm sorry, I'm having trouble connecting to my AI services right now. Please try again later."
        
        return "I'm sorry, I'm having trouble connecting to my AI services right now. Please try again later."
    
    def process_chat_request(self, request: ChatRequest, model_type: str = "gemini") -> ChatResponse:
        """Process a chat request and return a response."""
        if model_type not in ["openai", "gemini"]:
            raise HTTPException(status_code=400, detail="Invalid model type. Use 'openai' or 'gemini'.")
        
        # Generate response
        response = self.get_chat_response(request.messages, model_type)
        
        # For the first message, add project links if they're not already included
        is_first_message = len(request.messages) <= 1
        if is_first_message and "<a href='" not in response:
            response += self.links_html
        
        return ChatResponse(
            response=response,
            project_info=self.project_info if is_first_message else None
        ) 