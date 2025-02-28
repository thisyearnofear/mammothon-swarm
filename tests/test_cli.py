import os
import subprocess
import json
import time

# Agent ID from config
agent_id = "8925a9dc-4566-4b2f-9a68-945b57a0058c"

def run_command(command):
    """Run a shell command and return the output"""
    print(f"Running command: {command}")
    result = subprocess.run(command, shell=True, capture_output=True, text=True)
    print(f"Exit code: {result.returncode}")
    
    if result.stdout:
        print(f"Output: {result.stdout}")
    
    if result.stderr:
        print(f"Error: {result.stderr}")
    
    return result

def check_cli_installed():
    """Check if SwarmNode CLI is installed"""
    print("Checking if SwarmNode CLI is installed...")
    result = run_command("swarmnode --version")
    return result.returncode == 0

def install_cli():
    """Install SwarmNode CLI"""
    print("Installing SwarmNode CLI...")
    result = run_command("pip install swarmnode")
    return result.returncode == 0

def execute_agent():
    """Execute the agent using the CLI"""
    print("\nExecuting agent using SwarmNode CLI...")
    
    # Create a temporary JSON file with the payload
    with open("payload.json", "w") as f:
        json.dump({
            "endpoint": "/health",
            "method": "GET"
        }, f)
    
    # Execute the agent
    result = run_command(f"swarmnode agent execute {agent_id} --payload-file payload.json")
    
    # Clean up
    os.remove("payload.json")
    
    return result.returncode == 0

def list_agents():
    """List all agents"""
    print("\nListing all agents...")
    result = run_command("swarmnode agent list")
    return result.returncode == 0

def get_agent_info():
    """Get information about the agent"""
    print(f"\nGetting information about agent {agent_id}...")
    result = run_command(f"swarmnode agent get {agent_id}")
    return result.returncode == 0

def main():
    print("SwarmNode CLI Test")
    print("=================")
    
    # Check if CLI is installed
    if not check_cli_installed():
        print("SwarmNode CLI not installed. Installing...")
        if not install_cli():
            print("Failed to install SwarmNode CLI.")
            return
    
    # List all agents
    list_agents()
    
    # Get agent info
    get_agent_info()
    
    # Execute the agent
    execute_agent()

if __name__ == "__main__":
    main() 