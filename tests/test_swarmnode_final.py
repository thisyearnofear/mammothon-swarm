#!/usr/bin/env python3
import os
import json
import time
import swarmnode

# Set the API key
swarmnode.api_key = os.environ.get("SWARMNODE_API_KEY")
if not swarmnode.api_key:
    raise ValueError("SWARMNODE_API_KEY environment variable is not set")

# Agent ID from the deployment
AGENT_ID = "8925a9dc-4566-4b2f-9a68-945b57a0058c"

def test_agent_info():
    """Get information about the agent"""
    print("\nGetting agent information...")
    try:
        # According to the docs, use retrieve method
        agent = swarmnode.Agent.retrieve(id=AGENT_ID)
        print(f"Agent ID: {agent.id}")
        print(f"Agent name: {agent.name}")
        print(f"Agent created: {agent.created}")
        print(f"Agent store ID: {agent.store_id}")
        return agent
    except Exception as e:
        print(f"Error getting agent info: {e}")
        return None

def test_direct_execution():
    """Test executing the agent directly"""
    print("\nTesting direct agent execution...")
    try:
        # According to the docs, first retrieve the agent
        agent = swarmnode.Agent.retrieve(id=AGENT_ID)
        
        # Then execute it with a payload
        print("Executing agent...")
        execution = agent.execute(
            payload={"endpoint": "/health", "method": "GET"},
            wait=True  # Wait for execution to complete
        )
        
        print("Execution completed!")
        print(f"Execution result: {execution}")
        
        # Try to access logs and return value if available
        try:
            print(f"Logs: {getattr(execution, 'logs', 'No logs available')}")
            print(f"Return value: {getattr(execution, 'return_value', 'No return value available')}")
        except Exception as e:
            print(f"Error accessing execution details: {e}")
        
        return execution
    except Exception as e:
        print(f"Error during direct execution: {e}")
        return None

def test_job_execution():
    """Test executing the agent via a job"""
    print("\nTesting agent execution via job...")
    try:
        # Create an execution job
        print("Creating execution job...")
        job = swarmnode.AgentExecutorJob.create(
            agent_id=AGENT_ID,
            payload={"endpoint": "/health", "method": "GET"}
        )
        
        print(f"Job created with ID: {job.id}")
        print(f"Execution address: {job.execution_address}")
        
        # Wait for the execution to complete
        print("Waiting for execution to complete...")
        max_attempts = 10
        for attempt in range(1, max_attempts + 1):
            try:
                # Try to get the execution result
                print(f"Attempt {attempt}/{max_attempts}: Checking execution status...")
                execution = swarmnode.Execution.retrieve(id=job.execution_address)
                
                # Check if execution has completed
                status = getattr(execution, 'status', None)
                print(f"Execution status: {status}")
                
                if status == "completed":
                    print("Execution completed successfully!")
                    print(f"Return value: {getattr(execution, 'return_value', 'No return value available')}")
                    return execution
                
                # If not completed, wait before next attempt
                time.sleep(5)
            except Exception as e:
                print(f"Error checking execution status: {e}")
                time.sleep(5)
        
        print("Execution did not complete within the expected time.")
        return job
    except Exception as e:
        print(f"Error creating execution job: {e}")
        return None

def test_rest_api():
    """Test executing the agent using direct REST API calls"""
    print("\nTesting agent execution via REST API...")
    import requests
    
    # Endpoint for direct agent execution
    url = f"https://api.swarmnode.ai/v1/agents/{AGENT_ID}/execute/"
    
    # Headers for API requests
    headers = {
        "Authorization": f"Bearer {swarmnode.api_key}",
        "Content-Type": "application/json"
    }
    
    # Payload for health check
    payload = {
        "payload": {
            "endpoint": "/health",
            "method": "GET"
        },
        "wait": True
    }
    
    try:
        print(f"Making POST request to: {url}")
        response = requests.post(url, headers=headers, json=payload)
        
        print(f"Status code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code in (200, 201, 202):
            print("REST API execution successful!")
            return response.json()
        else:
            print("REST API execution failed.")
            return None
    except Exception as e:
        print(f"Error during REST API execution: {e}")
        return None

def main():
    print("SwarmNode Final Test")
    print("===================")
    
    # Get agent info
    agent = test_agent_info()
    
    if agent:
        print("\nAgent retrieved successfully. Testing execution methods...")
        
        # Try all execution methods
        direct_result = test_direct_execution()
        job_result = test_job_execution()
        rest_result = test_rest_api()
        
        if direct_result or job_result or rest_result:
            print("\nAt least one execution method succeeded!")
        else:
            print("\nAll execution methods failed.")
    else:
        print("\nFailed to retrieve agent. Cannot proceed with execution tests.")

if __name__ == "__main__":
    main() 