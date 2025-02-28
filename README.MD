# Mammothon Agent Swarm

A platform for reviving hackathon projects through AI agents and community staking.

## Overview

Mammothon Agent Swarm is a platform that aims to give new life to promising hackathon projects. The platform uses AI agents to represent these projects, allowing users to interact with them and learn about their potential. Users can stake on projects they believe in, incentivizing builders to revive and continue development.

## Project Structure

```
mammothon-agent-swarm/
├── frontend/                # Next.js frontend application
│   ├── lib/                 # Shared libraries
│   ├── pages/               # Next.js pages
│   ├── public/              # Static assets
│   └── styles/              # CSS styles
├── scripts/                 # Utility scripts
│   ├── check-api.sh         # Script to check API status
│   ├── cleanup.sh           # Script to clean up temporary files
│   └── dev.sh               # Development startup script
├── src/                     # Backend Python code
│   ├── agents/              # Agent implementations
│   │   ├── base_agent.py    # Base agent class
│   │   ├── mammothon_agent.py # Mammothon agent
│   │   └── vocafi_agent.py  # VocaFI agent
│   └── api/                 # API endpoints
│       └── serve.py         # FastAPI server
└── dev.sh                   # Symbolic link to scripts/dev.sh
```

## Prerequisites

- Python 3.9+
- Node.js 18+
- npm or yarn

## Development

To start the development environment:

```bash
# Make the development script executable
chmod +x dev.sh

# Run the development script
./dev.sh
```

This will:

1. Create a Python virtual environment if it doesn't exist
2. Install Python dependencies
3. Install frontend dependencies
4. Start both the backend and frontend servers

## Available Scripts

- `./dev.sh` - Start the development environment
- `./scripts/check-api.sh` - Check if the API is running
- `./scripts/cleanup.sh` - Clean up temporary files

## Agent Architecture

The project uses a modular agent architecture:

1. **Base Agent Class** (`src/agents/base_agent.py`): Provides common functionality for all agents, including:

   - Chat message handling
   - Model integration (OpenAI and Gemini)
   - Project information management

2. **Agent Implementations**:

   - `VocaFIAgent` - Represents the VocaFI voice-controlled DeFi trading platform
   - `MammothonAgent` - Represents the Mammothon Agent Swarm platform itself

3. **Frontend Integration**:
   - The frontend communicates with agents through a REST API
   - Each agent has its own chat interface
   - Messages support HTML formatting, including hyperlinks

## API Endpoints

- `/health` - Health check endpoint
- `/agents` - List all available agents
- `/agents/{agent_name}` - Access a specific agent's API
- `/agents/{agent_name}/chat` - Chat with a specific agent

## Deployment

The application is designed to be deployed as two separate services:

1. **Backend API** - Python FastAPI application
2. **Frontend** - Next.js application

Both can be deployed to platforms like Vercel, Netlify, or any cloud provider.

## License

MIT

## Contact

For questions or feedback, please open an issue on GitHub.
