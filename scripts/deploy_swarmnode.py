#!/usr/bin/env python3
import os
import sys
import json
import requests

# Initialize SwarmNode
import swarmnode
from swarmnode import Agent

def check_env_vars():
    """Check if required environment variables are set."""
    required_vars = ["SWARMNODE_API_KEY", "OPENAI_API_KEY"]
    missing_vars = [var for var in required_vars if not os.environ.get(var)]
    
    if missing_vars:
        print(f"Error: The following environment variables are not set: {', '.join(missing_vars)}")
        print("Please set them with: export VARIABLE_NAME=value")
        sys.exit(1)
    
    print("✅ Environment variables are set.")

def create_store():
    """Create a new SwarmNode store."""
    print("Creating SwarmNode store...")
    
    # Set the API key
    swarmnode.api_key = os.environ.get("SWARMNODE_API_KEY")
    
    # Create a store using direct API call (since Store is not exposed in the SDK)
    try:
        response = requests.post(
            "https://api.swarmnode.ai/v1/stores/create/",
            headers={
                "Authorization": f"Bearer {os.environ.get('SWARMNODE_API_KEY')}",
                "Content-Type": "application/json"
            },
            json={"name": "Mammothon Agent Store"}
        )
        
        # HTTP 201 Created is a success
        if response.status_code not in [200, 201]:
            print(f"Error creating store: {response.status_code}")
            print(response.text)
            sys.exit(1)
        
        store_data = response.json()
        store_id = store_data.get("id")
        
        if not store_id:
            print("Error: Store ID not found in response.")
            sys.exit(1)
        
        print(f"✅ Store created with ID: {store_id}")
        return store_id
    except Exception as e:
        print(f"Error creating store: {e}")
        sys.exit(1)

def create_agent(store_id):
    """Create a new SwarmNode agent."""
    print("Creating SwarmNode agent...")
    
    # Read the agent script
    with open("swarmnode_agent.py", "r") as f:
        script_content = f.read()
    
    # Read the requirements file
    with open("swarmnode_requirements.txt", "r") as f:
        requirements = f.read()
    
    # Create the agent using direct API call to include store_id
    try:
        response = requests.post(
            "https://api.swarmnode.ai/v1/agents/create/",
            headers={
                "Authorization": f"Bearer {os.environ.get('SWARMNODE_API_KEY')}",
                "Content-Type": "application/json"
            },
            json={
                "name": "Mammothon Agent Swarm API",
                "script": script_content,
                "requirements": requirements,
                "env_vars": f"OPENAI_API_KEY={os.environ.get('OPENAI_API_KEY')}",
                "python_version": "3.9",
                "store_id": store_id
            }
        )
        
        # HTTP 201 Created is a success
        if response.status_code not in [200, 201]:
            print(f"Error creating agent: {response.status_code}")
            print(response.text)
            sys.exit(1)
        
        agent_data = response.json()
        agent_id = agent_data.get("id")
        
        if not agent_id:
            print("Error: Agent ID not found in response.")
            sys.exit(1)
        
        print(f"✅ Agent created with ID: {agent_id}")
        return agent_id
    except Exception as e:
        print(f"Error creating agent: {e}")
        sys.exit(1)

def update_frontend_config(agent_id):
    """Update the frontend configuration with the agent ID."""
    print("Updating frontend configuration...")
    
    config_file = "frontend/src/lib/config.ts"
    
    # Read the current config
    with open(config_file, "r") as f:
        config_content = f.read()
    
    # Replace the placeholder with the actual agent ID
    updated_content = config_content.replace("YOUR_AGENT_ID_HERE", agent_id)
    
    # Write the updated config
    with open(config_file, "w") as f:
        f.write(updated_content)
    
    print(f"✅ Updated {config_file} with agent ID: {agent_id}")

def main():
    """Main function to deploy the SwarmNode agent."""
    print("Mammothon Agent Swarm - SwarmNode Deployment")
    print("============================================")
    
    # Check environment variables
    check_env_vars()
    
    # Create a store
    store_id = create_store()
    
    # Create the agent with the store ID
    agent_id = create_agent(store_id)
    
    # Update the frontend config
    update_frontend_config(agent_id)
    
    # Print next steps
    print("\nDeployment complete!")
    print(f"API URL: https://api.swarmnode.ai/v1/agent/execute/{agent_id}")
    print("\nNext steps:")
    print("1. Build and deploy your frontend")
    print("2. Test the API by sending a request to the health endpoint:")
    print(f"   curl -X POST https://api.swarmnode.ai/v1/agent/execute/{agent_id} \\")
    print("     -H 'Content-Type: application/json' \\")
    print("     -d '{\"payload\": {\"endpoint\": \"/health\", \"method\": \"GET\"}}'")
    print("\nFor more information, see SWARMNODE_README.md")

if __name__ == "__main__":
    main() 