#!/usr/bin/env python3
import os
import json
import time
import requests

# Get API key from environment
api_key = os.environ.get("SWARMNODE_API_KEY")
if not api_key:
    raise ValueError("SWARMNODE_API_KEY environment variable is not set")

# Agent ID from config
AGENT_ID = "8925a9dc-4566-4b2f-9a68-945b57a0058c"

# Base URL for SwarmNode API
BASE_URL = "https://api.swarmnode.ai/v1"

# Headers for API requests
HEADERS = {
    "Authorization": f"Bearer {api_key}",
    "Content-Type": "application/json"
}

def get_agent_info():
    """Get information about the agent using REST API"""
    print("\nGetting agent information...")
    url = f"{BASE_URL}/agents/{AGENT_ID}/"
    
    try:
        response = requests.get(url, headers=HEADERS)
        
        print(f"Status code: {response.status_code}")
        
        if response.status_code == 200:
            agent_data = response.json()
            print(f"Agent ID: {agent_data.get('id')}")
            print(f"Agent name: {agent_data.get('name')}")
            print(f"Agent created: {agent_data.get('created')}")
            print(f"Agent store ID: {agent_data.get('store_id')}")
            return agent_data
        else:
            print(f"Failed to get agent info. Response: {response.text}")
            return None
    except Exception as e:
        print(f"Error getting agent info: {e}")
        return None

def execute_agent():
    """Execute the agent using the REST API"""
    print("\nExecuting agent via REST API...")
    url = f"{BASE_URL}/agents/{AGENT_ID}/execute/"
    
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
        print(f"With payload: {json.dumps(payload)}")
        
        response = requests.post(url, headers=HEADERS, json=payload)
        
        print(f"Status code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code in (200, 201, 202):
            print("Agent execution successful!")
            return response.json()
        else:
            print("Agent execution failed.")
            return None
    except Exception as e:
        print(f"Error executing agent: {e}")
        return None

def create_execution_job():
    """Create an execution job using the REST API"""
    print("\nCreating execution job...")
    url = f"{BASE_URL}/agent-executor-jobs/"
    
    # Payload for creating the job
    payload = {
        "agent_id": AGENT_ID,
        "payload": {
            "endpoint": "/health",
            "method": "GET"
        }
    }
    
    try:
        print(f"Making POST request to: {url}")
        print(f"With payload: {json.dumps(payload)}")
        
        response = requests.post(url, headers=HEADERS, json=payload)
        
        print(f"Status code: {response.status_code}")
        
        if response.status_code == 201:
            job_data = response.json()
            print(f"Job created with ID: {job_data.get('id')}")
            print(f"Execution address: {job_data.get('execution_address')}")
            
            # Check execution result
            check_execution_result(job_data.get('execution_address'))
            
            return job_data
        else:
            print(f"Failed to create job. Response: {response.text}")
            return None
    except Exception as e:
        print(f"Error creating execution job: {e}")
        return None

def check_execution_result(execution_address):
    """Check the result of an execution"""
    if not execution_address:
        print("No execution address provided.")
        return None
    
    print(f"\nChecking execution result for {execution_address}...")
    url = f"{BASE_URL}/executions/{execution_address}/"
    
    max_attempts = 10
    for attempt in range(1, max_attempts + 1):
        try:
            print(f"Attempt {attempt}/{max_attempts}: Checking execution status...")
            
            response = requests.get(url, headers=HEADERS)
            
            print(f"Status code: {response.status_code}")
            
            if response.status_code == 200:
                execution_data = response.json()
                status = execution_data.get('status')
                print(f"Execution status: {status}")
                
                if status == "completed":
                    print("Execution completed successfully!")
                    print(f"Result: {execution_data.get('result')}")
                    return execution_data
                
                # If not completed, wait before next attempt
                time.sleep(5)
            else:
                print(f"Failed to get execution result. Response: {response.text}")
                time.sleep(5)
        except Exception as e:
            print(f"Error checking execution result: {e}")
            time.sleep(5)
    
    print("Execution did not complete within the expected time.")
    return None

def test_health_endpoint():
    """Test the health endpoint directly"""
    print("\nTesting health endpoint directly...")
    url = f"{BASE_URL}/agent/execute/{AGENT_ID}"
    
    # Payload for health check
    payload = {
        "payload": {
            "endpoint": "/health",
            "method": "GET"
        }
    }
    
    try:
        print(f"Making POST request to: {url}")
        print(f"With payload: {json.dumps(payload)}")
        
        response = requests.post(url, headers=HEADERS, json=payload)
        
        print(f"Status code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            print("Health check successful!")
            return response.json()
        else:
            print("Health check failed.")
            return None
    except Exception as e:
        print(f"Error during health check: {e}")
        return None

def main():
    print("SwarmNode REST API Test")
    print("======================")
    
    # Get agent info
    agent_data = get_agent_info()
    
    if agent_data:
        print("\nAgent retrieved successfully. Testing execution methods...")
        
        # Try all execution methods
        direct_result = execute_agent()
        job_result = create_execution_job()
        health_result = test_health_endpoint()
        
        if direct_result or job_result or health_result:
            print("\nAt least one execution method succeeded!")
        else:
            print("\nAll execution methods failed.")
    else:
        print("\nFailed to retrieve agent. Cannot proceed with execution tests.")

if __name__ == "__main__":
    main() 