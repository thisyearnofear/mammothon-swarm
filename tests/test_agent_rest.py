#!/usr/bin/env python3
import os
import json
import requests
import time

# API key from environment
API_KEY = os.environ.get("SWARMNODE_API_KEY")

# Agent ID from the deployment
AGENT_ID = "8925a9dc-4566-4b2f-9a68-945b57a0058c"

def test_health_endpoint():
    """Test the health endpoint of the agent."""
    print("Testing health endpoint...")
    
    try:
        # Create an execution job
        response = requests.post(
            "https://api.swarmnode.ai/v1/agent-executor-jobs/create/",
            headers={
                "Authorization": f"Bearer {API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "agent_id": AGENT_ID,
                "payload": {
                    "endpoint": "/health",
                    "method": "GET"
                }
            }
        )
        
        if response.status_code not in [200, 201]:
            print(f"Error creating execution job: {response.status_code}")
            print(response.text)
            return None
        
        job_data = response.json()
        job_id = job_data.get("id")
        execution_address = job_data.get("execution_address")
        
        print(f"Execution job created with ID: {job_id}")
        print(f"Execution address: {execution_address}")
        
        # Wait for the execution to complete
        print("Waiting for execution to complete...")
        max_attempts = 10
        attempts = 0
        
        while attempts < max_attempts:
            attempts += 1
            
            # Check if the execution is complete
            try:
                # Try to get the execution result
                response = requests.get(
                    f"https://api.swarmnode.ai/v1/executions/{execution_address}/",
                    headers={"Authorization": f"Bearer {API_KEY}"}
                )
                
                if response.status_code == 200 and response.text:
                    execution_data = response.json()
                    print("Execution result:")
                    print(json.dumps(execution_data, indent=2))
                    return execution_data
                
                print(f"Attempt {attempts}/{max_attempts}: Execution not complete yet. Status code: {response.status_code}")
                print(f"Response: {response.text}")
            except Exception as e:
                print(f"Error checking execution status: {e}")
            
            # Wait before checking again
            time.sleep(3)
        
        print("Execution did not complete within the expected time.")
        return None
    except Exception as e:
        print(f"Error executing agent: {e}")
        return None

def main():
    """Main function to test the agent."""
    print("SwarmNode Agent Test (REST API)")
    print("==============================")
    
    # Test the health endpoint
    execution = test_health_endpoint()
    
    if execution:
        print("\nTest completed successfully!")
    else:
        print("\nTest failed.")

if __name__ == "__main__":
    main() 