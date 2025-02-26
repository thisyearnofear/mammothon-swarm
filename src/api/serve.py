import os
import uvicorn
from fastapi import FastAPI, Request, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
from agents.vocafi_agent import app as vocafi_app
from agents.wooly_agent import app as wooly_app
from agents.clarity_agent import app as clarity_app
from agents.hello_world_computer_agent import app as hwc_app

# Create a new FastAPI app for serving both API and static files
app = FastAPI(title="Mammothon Agent Swarm",
             description="AI-powered agents representing hackathon projects")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development; restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount the agents
app.mount("/api/vocafi", vocafi_app)
app.mount("/api/wooly", wooly_app)
app.mount("/api/clarity", clarity_app)
app.mount("/api/hwc", hwc_app)

# Serve static files and images
app.mount("/images", StaticFiles(directory="public/images"), name="images")
app.mount("/static", StaticFiles(directory="src/static", html=True), name="static")

# Serve the index.html file
@app.get("/", response_class=HTMLResponse)
async def read_root():
    """Serve the main HTML file."""
    try:
        with open("src/static/index.html", "r", encoding="utf-8") as f:
            return f.read()
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="index.html not found")

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8001))
    uvicorn.run(app, host="0.0.0.0", port=port) 