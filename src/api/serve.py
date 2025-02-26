import os
import uvicorn
from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
from agents.vocafi_agent import app as vocafi_app
from agents.wooly_agent import app as wooly_app

# Create a new FastAPI app for serving both API and static files
app = FastAPI(title="Mammothon Agent Swarm")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development; restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
app.mount("/public", StaticFiles(directory="src/static"), name="public")

# Mount the API apps
app.mount("/api/vocafi", vocafi_app)
app.mount("/api/wooly", wooly_app)

# Serve the index.html file
@app.get("/", response_class=HTMLResponse)
async def read_index():
    with open("src/static/index.html", "r") as f:
        html_content = f.read()
    
    # No need to update the API endpoint in the HTML as it's already using /api/chat
    return HTMLResponse(content=html_content)

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8001))
    uvicorn.run(app, host="0.0.0.0", port=port) 