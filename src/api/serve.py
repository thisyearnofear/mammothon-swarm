import os
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, RedirectResponse
import importlib.util
import sys

# Create FastAPI app
app = FastAPI(
    title="Mammothon Agent Swarm API",
    description="API for AI-powered agents representing hackathon projects",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development; restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "version": "1.0.0"
    }

# API documentation redirect
@app.get("/")
async def root():
    """Redirect to API documentation."""
    return {
        "message": "Welcome to the Mammothon Agent Swarm API",
        "documentation": "/docs"
    }

# Import and mount agent apps
def import_agent_module(agent_name):
    """Dynamically import an agent module."""
    try:
        # Construct the module path
        module_path = f"src.agents.{agent_name}_agent"
        
        # Import the module
        module = __import__(module_path, fromlist=['app'])
        
        # Return the FastAPI app from the module
        return module.app
    except ImportError as e:
        print(f"Error importing agent module {agent_name}: {e}")
        return None
    except AttributeError as e:
        print(f"Error accessing app in agent module {agent_name}: {e}")
        return None

# List of available agents
AVAILABLE_AGENTS = ["vocafi", "wooly", "clarity", "hwc", "mammothon"]

# Mount each agent's API
for agent_name in AVAILABLE_AGENTS:
    agent_app = import_agent_module(agent_name)
    if agent_app:
        app.mount(f"/agents/{agent_name}", agent_app)
        print(f"Mounted {agent_name} agent at /agents/{agent_name}")
    else:
        print(f"Failed to mount {agent_name} agent")

# Get list of available agents
@app.get("/agents")
async def list_agents():
    """List all available agents."""
    agents = []
    
    # Map of agent names to their instance variable names
    agent_instance_names = {
        "vocafi": "vocafi_agent",
        "wooly": "wooly_agent",
        "clarity": "clarity_agent",
        "hwc": "hwc_agent",
        "mammothon": "mammothon_agent"
    }
    
    for agent_name in AVAILABLE_AGENTS:
        try:
            # Import the agent module to get its info
            module_path = f"src.agents.{agent_name}_agent"
            module = __import__(module_path, fromlist=[agent_instance_names[agent_name]])
            
            # Get the agent instance using the correct variable name
            agent_instance = getattr(module, agent_instance_names[agent_name])
            
            # Add agent info to the list
            agents.append({
                "name": agent_instance.name,
                "type": agent_instance.type,
                "description": agent_instance.description,
                "endpoint": f"/agents/{agent_name}",
                "project_info": agent_instance.project_info
            })
        except (ImportError, AttributeError) as e:
            print(f"Error getting info for {agent_name} agent: {e}")
            # Add minimal info if we can't get the full details
            agents.append({
                "name": agent_name.capitalize(),
                "type": agent_name,
                "description": "Agent information unavailable",
                "endpoint": f"/agents/{agent_name}"
            })
    
    return {"agents": agents}

# Error handler for 404 Not Found
@app.exception_handler(404)
async def not_found_handler(request: Request, exc: HTTPException):
    """Handle 404 errors."""
    return JSONResponse(
        status_code=404,
        content={
            "error": "Not Found",
            "message": "The requested resource was not found.",
            "available_endpoints": [
                "/",
                "/health",
                "/agents",
                "/agents/{agent_name}",
                "/docs",
                "/redoc"
            ]
        }
    )

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run(app, host="0.0.0.0", port=port) 