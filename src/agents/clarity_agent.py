import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import google.generativeai as genai
from pydantic import BaseModel
from typing import List, Optional

# Load environment variables
load_dotenv()

# Configure Gemini
gemini_api_key = os.getenv("GEMINI_API_KEY")
if gemini_api_key:
    genai.configure(api_key=gemini_api_key)
    safety_settings = {
        "HARM_CATEGORY_HARASSMENT": "BLOCK_NONE",
        "HARM_CATEGORY_HATE_SPEECH": "BLOCK_NONE",
        "HARM_CATEGORY_SEXUALLY_EXPLICIT": "BLOCK_NONE",
        "HARM_CATEGORY_DANGEROUS_CONTENT": "BLOCK_NONE",
    }

# Initialize FastAPI app
app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define message models for chat
class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[Message]

class ChatResponse(BaseModel):
    response: str
    project_info: Optional[dict] = None

# Project information
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

def get_chat_response(messages: List[Message]) -> str:
    """Generate a response using Gemini API."""
    if not gemini_api_key:
        return "I'm sorry, I'm not properly configured. Please ensure the GEMINI_API_KEY is set."

    system_prompt = """
    You are Clarity, an AI agent representing a payment gateway project that tackles fake reviews through blockchain technology. 
    
    Your first message should be similar to this format:
    "Tired of fake reviews? Clarity is a blockchain-powered payment gateway that ensures review authenticity, tackling a $152B problem. Try our <a href='https://d3e8hw77ywlb9l.cloudfront.net/'>demo</a>, check out our <a href='https://github.com/Royleong31/Clarity'>GitHub repository</a>, or learn about our <a href='https://ethglobal.com/showcase/clarity-c2us8'>ETHGlobal submission</a>. Ready to bring trust back to reviews?"
    
    For subsequent messages:
    1. Explain how blockchain verification ensures review authenticity
    2. Help users understand how they can revive the project by staking
    3. Focus on the practical impact of solving the fake review problem
    
    Be concise, clear, and focused on the mission to restore trust in online reviews.
    """

    try:
        # Format conversation history
        conversation = []
        for msg in messages:
            prefix = "User: " if msg.role == "user" else "Assistant: "
            conversation.append(f"{prefix}{msg.content}")
        
        conversation_text = "\n".join(conversation)
        
        # Get the last user message
        last_user_message = next((msg.content for msg in reversed(messages) if msg.role == "user"), "")
        
        # Generate response using Gemini
        model = genai.GenerativeModel('gemini-1.5-pro')
        prompt = f"{system_prompt}\n\nConversation history:\n{conversation_text}\n\nUser's latest message: {last_user_message}\n\nRespond as Clarity:"
        
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
        print(f"Error generating response: {e}")
        return "I apologize, but I'm having trouble processing your request right now. Please try again."

@app.get("/")
async def root():
    """Root endpoint with basic information about Clarity."""
    return CLARITY_INFO

@app.post("/chat")
async def chat(request: ChatRequest):
    """Chat with Clarity."""
    response = get_chat_response(request.messages)
    
    # Include project info only in the first message
    include_project_info = len(request.messages) <= 1
    
    return ChatResponse(
        response=response,
        project_info=CLARITY_INFO if include_project_info else None
    )

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000) 