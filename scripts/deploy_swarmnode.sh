#!/bin/bash

# SwarmNode Deployment Script
# This script helps deploy the Mammothon Agent Swarm backend to SwarmNode

echo "Mammothon Agent Swarm - SwarmNode Deployment"
echo "============================================"

# Check if swarmnode CLI is installed
if ! command -v swarmnode &> /dev/null; then
    echo "SwarmNode CLI not found. Installing..."
    pip install swarmnode
fi

# Check if API key is set
if [ -z "$SWARMNODE_API_KEY" ]; then
    echo "SWARMNODE_API_KEY environment variable not set."
    echo "Please set it with: export SWARMNODE_API_KEY=your_api_key"
    exit 1
fi

# Create the agent
echo "Creating SwarmNode agent..."
AGENT_ID=$(swarmnode agent create \
    --name "Mammothon Agent Swarm API" \
    --script swarmnode_agent.py \
    --requirements swarmnode_requirements.txt \
    --env-vars "OPENAI_API_KEY=$OPENAI_API_KEY" \
    --python-version 3.9 \
    --output json | jq -r '.id')

if [ -z "$AGENT_ID" ]; then
    echo "Failed to create agent."
    exit 1
fi

echo "Agent created with ID: $AGENT_ID"

# Update the frontend config
echo "Updating frontend configuration..."
sed -i '' "s/YOUR_AGENT_ID_HERE/$AGENT_ID/g" frontend/src/lib/config.ts

echo "Deployment complete!"
echo "API URL: https://api.swarmnode.ai/v1/agent/execute/$AGENT_ID"
echo ""
echo "Next steps:"
echo "1. Build and deploy your frontend"
echo "2. Test the API by sending a request to the health endpoint:"
echo "   curl -X POST https://api.swarmnode.ai/v1/agent/execute/$AGENT_ID \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"payload\": {\"endpoint\": \"/health\", \"method\": \"GET\"}}'"
echo ""
echo "For more information, see SWARMNODE_README.md" 