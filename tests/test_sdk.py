import os
import json
import time
from swarmnode import Agent, AgentExecutorJob, Execution
import swarmnode

# Set API key
swarmnode.api_key = os.environ.get("SWARMNODE_API_KEY")
if not swarmnode.api_key:
    raise ValueError("SWARMNODE_API_KEY environment variable is not set")

# Agent ID from config
agent_id = "8925a9dc-4566-4b2f-9a68-945b57a0058c"

def get_agent_info():
    """Get information about the agent"""
    print(f"\nGetting information about agent {agent_id}...")
    try:
        agent = Agent.retrieve(id=agent_id)
        print(f"Agent name: {agent.name}")
        print(f"Agent created: {agent.created}")
        print(f"Agent store ID: {agent.store_id}")
        return True
    except Exception as e:
        print(f"Error getting agent info: {str(e)}")
        return False

def execute_agent_directly():
    """Execute the agent directly"""
    print("\nExecuting agent directly...")
    
    # Payload for health check
    payload = {
        "endpoint": "/health",
        "method": "GET"
    }
    
    try:
        # Execute the agent
        print("Executing agent...")
        result = Agent.execute(id=agent_id, payload=payload, wait=True)
        print(f"Execution result: {result}")
        return True
    except Exception as e:
        print(f"Error executing agent: {str(e)}")
        return False

def execute_agent_with_job():
    """Execute the agent using AgentExecutorJob"""
    print("\nExecuting agent using AgentExecutorJob...")
    
    # Payload for health check
    payload = {
        "endpoint": "/health",
        "method": "GET"
    }
    
    try:
        # Create the job
        print("Creating execution job...")
        job = AgentExecutorJob.create(agent_id=agent_id, payload=payload)
        print(f"Job created: {job.id}")
        print(f"Execution address: {job.execution_address}")
        
        # Wait for execution to complete
        print("Waiting for execution to complete...")
        max_attempts = 10
        for attempt in range(1, max_attempts + 1):
            print(f"Attempt {attempt}/{max_attempts}: Checking execution status...")
            
            try:
                # Try to get the execution result
                execution = Execution.retrieve(id=job.execution_address)
                print(f"Execution status: {getattr(execution, 'status', 'unknown')}")
                print(f"Execution result: {getattr(execution, 'result', 'unknown')}")
                return True
            except Exception as e:
                print(f"Error checking execution: {str(e)}")
            
            # Wait before next attempt
            if attempt < max_attempts:
                time.sleep(5)
        
        print("Execution did not complete within the expected time.")
        return False
    except Exception as e:
        print(f"Error during job creation: {str(e)}")
        return False

def main():
    print("SwarmNode SDK Test")
    print("=================")
    
    # Get agent info
    get_agent_info()
    
    # Execute the agent directly
    execute_agent_directly()
    
    # Execute the agent with job
    execute_agent_with_job()

if __name__ == "__main__":
    main() 