import os
import requests
import time
import json

# Get API key from environment
api_key = os.environ.get("SWARMNODE_API_KEY")
if not api_key:
    raise ValueError("SWARMNODE_API_KEY environment variable is not set")

# Agent ID from config
agent_id = "8925a9dc-4566-4b2f-9a68-945b57a0058c"

# Base URL for SwarmNode API
base_url = "https://api.swarmnode.ai/v1"

# Headers for API requests
headers = {
    "Authorization": f"Bearer {api_key}",
    "Content-Type": "application/json"
}

def execute_agent():
    """Execute the agent directly using the execute endpoint"""
    print("\nTesting direct agent execution...")
    
    # Endpoint for direct agent execution
    url = f"{base_url}/agent/execute/{agent_id}"
    
    # Payload for health check
    payload = {
        "payload": {
            "endpoint": "/health",
            "method": "GET"
        }
    }
    
    try:
        print(f"Making request to: {url}")
        print(f"With payload: {json.dumps(payload)}")
        
        # Make the request
        response = requests.post(url, headers=headers, json=payload)
        
        print(f"Status code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            print("Direct execution successful!")
            return True
        else:
            print("Direct execution failed.")
            return False
    except Exception as e:
        print(f"Error during direct execution: {str(e)}")
        return False

def create_execution_job():
    """Create an execution job and check its result"""
    print("\nTesting execution job creation...")
    
    # Endpoint for creating execution jobs
    url = f"{base_url}/agent-executor-jobs/"
    
    # Payload for creating the job
    payload = {
        "agent_id": agent_id,
        "payload": {
            "endpoint": "/health",
            "method": "GET"
        }
    }
    
    try:
        # Create the job
        print("Creating execution job...")
        response = requests.post(url, headers=headers, json=payload)
        
        if response.status_code != 201:
            print(f"Failed to create job. Status code: {response.status_code}")
            print(f"Response: {response.text}")
            return False
        
        job_data = response.json()
        job_id = job_data.get("id")
        execution_address = job_data.get("execution_address")
        
        print(f"Job created: {job_id}")
        print(f"Execution address: {execution_address}")
        
        # Check execution result
        execution_url = f"{base_url}/executions/{execution_address}/"
        
        print("Waiting for execution to complete...")
        max_attempts = 10
        for attempt in range(1, max_attempts + 1):
            print(f"Attempt {attempt}/{max_attempts}: Checking execution status...")
            
            execution_response = requests.get(execution_url, headers=headers)
            print(f"Status code: {execution_response.status_code}")
            
            if execution_response.status_code == 200:
                execution_data = execution_response.json()
                print(f"Execution data: {json.dumps(execution_data, indent=2)}")
                return True
            else:
                print(f"Response: {execution_response.text}")
            
            # Wait before next attempt
            if attempt < max_attempts:
                time.sleep(5)
        
        print("Execution did not complete within the expected time.")
        return False
    except Exception as e:
        print(f"Error during job creation or execution check: {str(e)}")
        return False

def check_agent_status():
    """Check the status of the agent"""
    print("\nChecking agent status...")
    
    url = f"{base_url}/agents/{agent_id}/"
    
    try:
        response = requests.get(url, headers=headers)
        
        print(f"Status code: {response.status_code}")
        
        if response.status_code == 200:
            agent_data = response.json()
            print(f"Agent status: {agent_data.get('status')}")
            print(f"Agent data: {json.dumps(agent_data, indent=2)}")
            return True
        else:
            print(f"Failed to get agent status. Response: {response.text}")
            return False
    except Exception as e:
        print(f"Error checking agent status: {str(e)}")
        return False

def main():
    print("SwarmNode Direct API Test")
    print("========================")
    
    # First check the agent status
    check_agent_status()
    
    # Try both methods
    direct_success = execute_agent()
    job_success = create_execution_job()
    
    if direct_success or job_success:
        print("\nTest completed with at least one successful method!")
    else:
        print("\nAll test methods failed.")

if __name__ == "__main__":
    main() 