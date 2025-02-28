#!/usr/bin/env python3
import os
import json
import time
import swarmnode
from swarmnode import Agent, AgentExecutorJob

# Set the API key
swarmnode.api_key = os.environ.get("SWARMNODE_API_KEY")

# Agent ID from the deployment
AGENT_ID = "8925a9dc-4566-4b2f-9a68-945b57a0058c"

def test_health_endpoint_with_agent():
    """Test the health endpoint using the Agent.execute method."""
    print("\nTesting health endpoint using Agent.execute...")
    
    try:
        # Retrieve the agent
        agent = Agent.retrieve(id=AGENT_ID)
        print(f"Agent retrieved: {agent.id}")
        
        # Execute the agent with the health endpoint
        print("Executing agent...")
        execution = agent.execute(
            wait=True,
            payload={"endpoint": "/health", "method": "GET"}
        )
        
        # Print the result
        print("Execution result:")
        print(json.dumps(execution.__dict__, indent=2))
        
        return execution
    except Exception as e:
        print(f"Error executing agent: {e}")
        return None

def test_health_endpoint_with_job():
    """Test the health endpoint using the AgentExecutorJob.create method."""
    print("\nTesting health endpoint using AgentExecutorJob.create...")
    
    try:
        # Create an execution job
        print("Creating execution job...")
        job = AgentExecutorJob.create(
            agent_id=AGENT_ID,
            payload={"endpoint": "/health", "method": "GET"}
        )
        
        print(f"Job created: {job.id}")
        print(f"Execution address: {job.execution_address}")
        
        # Wait for the execution to complete
        print("Waiting for execution to complete...")
        max_attempts = 10
        attempts = 0
        
        while attempts < max_attempts:
            attempts += 1
            
            # Check if the execution is complete
            try:
                # Try to get the execution result using the REST API
                import requests
                response = requests.get(
                    f"https://api.swarmnode.ai/v1/executions/{job.execution_address}/",
                    headers={"Authorization": f"Bearer {os.environ.get('SWARMNODE_API_KEY')}"}
                )
                
                if response.status_code == 200 and response.text and response.text != '{"message":"","code":"","extra":{}}':
                    execution_data = response.json()
                    print("Execution result:")
                    print(json.dumps(execution_data, indent=2))
                    return execution_data
                
                print(f"Attempt {attempts}/{max_attempts}: Execution not complete yet. Status code: {response.status_code}")
                if response.text:
                    print(f"Response: {response.text}")
            except Exception as e:
                print(f"Error checking execution status: {e}")
            
            # Wait before checking again
            time.sleep(3)
        
        print("Execution did not complete within the expected time.")
        return job
    except Exception as e:
        print(f"Error creating execution job: {e}")
        return None

def main():
    """Main function to test the agent."""
    print("SwarmNode Agent Test")
    print("===================")
    
    # Test the health endpoint using Agent.execute
    try:
        execution = test_health_endpoint_with_agent()
    except Exception as e:
        print(f"Agent.execute test failed: {e}")
        execution = None
    
    # Test the health endpoint using AgentExecutorJob.create
    try:
        job_result = test_health_endpoint_with_job()
    except Exception as e:
        print(f"AgentExecutorJob.create test failed: {e}")
        job_result = None
    
    if execution or job_result:
        print("\nTest completed with at least one successful method!")
    else:
        print("\nTest failed with both methods.")

if __name__ == "__main__":
    main() 