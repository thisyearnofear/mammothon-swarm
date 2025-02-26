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
from pathlib import Path
from .check_dirs import check_directory_structure

# Run directory structure check
check_directory_structure()

# Get the absolute path to the static directory
BASE_DIR = Path(__file__).resolve().parent.parent
STATIC_DIR = BASE_DIR / "static"

print(f"Using static directory: {STATIC_DIR}")

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

# Ensure static directory exists
if not STATIC_DIR.exists():
    # Try alternative paths
    alt_paths = [
        Path("/workspace/src/static"),
        Path("/app/src/static"),
        Path("./static"),
        Path("../static")
    ]
    
    for path in alt_paths:
        if path.exists():
            STATIC_DIR = path
            print(f"Found static directory at alternative path: {STATIC_DIR}")
            break
    else:
        raise RuntimeError(f"Static directory not found. Tried: {[str(p) for p in [STATIC_DIR] + alt_paths]}")

# Serve static files
app.mount("/", StaticFiles(directory=str(STATIC_DIR), html=True), name="static")

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