# Mammothon Agent Swarm

A reimagining of the Million Dollar Homepage for abandoned hackathon projects. Instead of pixels, we have AI agents representing hackathon projects seeking revival.

## Deployment Status

- Frontend: [![Netlify Status](https://api.netlify.com/api/v1/badges/your-site-id/deploy-status)](https://app.netlify.com/sites/mammothon/deploys)
- Backend: [![Koyeb Status](https://img.shields.io/badge/koyeb-deployed-success)](https://kind-gwenora-papajams-0ddff9e5.koyeb.app/health)

### Live URLs

- Frontend: https://mammothon.netlify.app
- Backend API: https://kind-gwenora-papajams-0ddff9e5.koyeb.app/api

## How It Works

1. **The Homepage**: Five AI agents (plus Wooly, the guide) represent abandoned hackathon projects
2. **Builder Selection**: Each project can select 2 builders from a pool of 10 applicants
3. **Builder Commitment**: Selected builders stake $100 + provide implementation roadmap
4. **NFT Creation**: Each commitment creates a unique NFT (co-owned by agent, project, and builder)
5. **Early Advocates**: Each builder can mint 20 NFTs for early supporters
   - Starting price: $5
   - Price increases with scarcity up to $30
   - NFTs represent % allocation in future token releases
6. **Secondary Market**: Opens after initial development period
   - NFTs tradeable on secondary markets
   - Value tied to project progress and potential token allocations

## Project Structure

```
mammothon-agent-swarm/
├── src/
│   ├── agents/                 # Individual agent implementations
│   │   ├── vocafi_agent.py    # VocaFI project agent
│   │   └── wooly_agent.py     # Project guide agent
│   ├── api/                    # API and server implementations
│   │   └── serve.py           # Main FastAPI server
│   └── static/                # Frontend assets
│       ├── css/
│       │   └── styles.css     # Global styles
│       ├── js/
│       │   └── agents.js      # Agent interaction logic
│       ├── components/        # Reusable UI components
│       └── index.html         # Main application page
├── tests/                     # Test files
├── docs/                      # Documentation
├── .env                      # Environment variables
├── .gitignore
├── requirements.txt          # Python dependencies
└── run_local.py             # Local development server
```

## Current Implementation

### Agents

1. **VocaFI Agent**

   - Voice-controlled DeFi trading project
   - AI-powered chat assistance
   - Staking and NFT minting information

2. **Wooly Agent**
   - Project guide and information hub
   - Explains platform features and architecture
   - Directs users to specific project agents

### Frontend

- Modular agent system with dynamic loading
- Responsive chat interface
- Customizable agent appearances
- Scalable CSS and JavaScript architecture

### Backend

- FastAPI-based server
- Gemini AI integration
- Modular agent routing
- Static file serving

## Development

### Prerequisites

- Python 3.8+
- Node.js (for frontend development)
- Gemini API key

### Environment Setup

1. Create a virtual environment:

   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

3. Set up environment variables in `.env`:
   ```
   GEMINI_API_KEY=your_gemini_api_key
   SWARMNODE_API_KEY=your_swarmnode_key
   OPENAI_API_KEY=your_openai_key
   ```

### Running the Application

1. Start the development server:

   ```bash
   # This will start both the frontend and backend servers
   python run_local.py
   ```

   The application will be available at:

   - Frontend: http://localhost:8001
   - Backend API: http://localhost:8001/api

   Note: The backend server (FastAPI) is located at `src/api/serve.py` and is automatically started by `run_local.py`.

2. If you need to run the backend separately for development:
   ```bash
   # From the project root
   uvicorn src.api.serve:app --reload --port 8001
   ```

### API Endpoints

- `/api/vocafi` - VocaFI agent endpoints
- `/api/wooly` - Wooly agent endpoints
- `/health` - Health check endpoint

## Adding New Agents

1. Create a new agent file in `src/agents/`:

   ```python
   # example_agent.py
   from fastapi import FastAPI
   # ... agent implementation
   ```

2. Add agent configuration in `src/static/js/agents.js`:

   ```javascript
   const agentConfigs = [
     // ... existing agents
     {
       id: "example",
       name: "Example",
       type: "example",
       description: "Example agent description",
     },
   ];
   ```

3. Mount the agent in `src/api/serve.py`:
   ```python
   from agents.example_agent import app as example_app
   app.mount("/api/example", example_app)
   ```

## Future Development

### Phase 1: SwarmNode Integration (Current)

- [ ] Migrate agents to SwarmNode
- [ ] Implement persistent storage
- [ ] Add agent scheduling

### Phase 2: Decentralization

- [ ] Integrate Conduit for data indexing
- [ ] Add Celestia for data storage
- [ ] Implement NFT minting

### Phase 3: Scaling

- [ ] Add more project agents
- [ ] Implement agent discovery
- [ ] Enhanced UI/UX

## Contributing

1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## License

MIT License

## Contact

- Warpcast: [@papa](https://warpcast.com/papa)
- GitHub: [@pallasite99](https://github.com/pallasite99)

---

## Table of Contents

- [Overview](#overview)
- [Core Concepts](#core-concepts)
- [System Architecture](#system-architecture)
  - [Frontend](#frontend)
  - [Backend](#backend)
- [Project Components](#project-components)
  - [1. VocaFI Agent (MVP)](#1-vocafi-agent-mvp)
  - [2. NFT Staking and Incentive System](#2-nft-staking-and-incentive-system)
  - [3. AI Advocacy and Dynamic Updates](#3-ai-advocacy-and-dynamic-updates)
- [Roadmap & Future Phases](#roadmap--future-phases)
- [Getting Started](#getting-started)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

---

## Overview

Mammothon Agent Swarm transforms the idea behind the Million Dollar Homepage into a dynamic digital marketplace for hackathon projects. Instead of buying pixels, users engage with a swarm of AI agents—each representing a previously abandoned project—through which:

- **Builders** stake a nominal amount (e.g., $100) and commit to reviving the project.
- **NFTs** are minted to represent these builder commitments and to reward early advocates.
- **AI Agents** serve as project ambassadors, updating on progress and driving community engagement.

By integrating decentralized backends like Conduit and Celestia, the platform guarantees transparency, scalability, and trustlessness in data storage and execution.

---

## Core Concepts

- **Million Dollar Homepage Provenance:**  
  Inspired by the pixelated, revenue-generating homepage, Mammothon allocates "pixels" to hackathon projects in the form of AI agents, each vying for attention and revival.

- **AI Advocacy:**  
  Each agent is powered by AI (using LangChain and OpenAI) to deliver natural language explanations of its project's vision, technical details, and future potential.

- **Builder Commitment via NFTs:**  
  Builders submit their plans and stake funds to take on a project. Their commitment is recorded by minting a unique NFT. Early advocates can also mint NFTs (priced from $5 up to $30) that later convert to a share in a future token allocation.

- **Decentralized Data and Execution:**  
  Conduit is integrated for indexing and querying on-chain data, while Celestia ensures decentralized and verifiable data storage. This combination secures the platform against centralized failures.

---

## System Architecture

### Frontend

- **Agent Swarm UI:**  
  A dynamic, interactive homepage displays the swarm of AI agents, each representing a hackathon project. Users can click on agents to learn more about the project, view detailed technical write-ups, and participate in NFT minting.

- **User Interaction & Wallet Integration:**  
  Future plans include integrating wallet solutions (e.g., MetaMask, WalletConnect) for secure user authentication and transaction signing. Builders and early advocates interact directly with the platform via a simple web interface.

### Backend

- **SwarmNode Execution Layer:**  
  Agents run on SwarmNode—an environment that allows Python agents to be executed in the cloud without server management. Each agent:

  - Runs a dedicated Python script (with a mandatory `main` function).
  - Has persistent, dedicated storage (using SwarmNode's key-value store).
  - Can be executed manually or scheduled via cron-like expressions.

- **Decentralized Integration:**
  - **Conduit:** Provides real-time indexing of on-chain data and supports automated smart contract interactions.
  - **Celestia:** Acts as the data availability layer for storing project metadata and NFT records in a decentralized manner.

---

## Project Components

### 1. VocaFI Agent (MVP)

VocaFI is the first hackathon project being revived under Mammothon. Originally built for the SAFE Agentathon, it aimed to create a voice-controlled DeFi trading interface. The VocaFI agent:

- **Explains the Project:** Uses an AI model (e.g., `gpt-4o-mini`) to provide simple, natural language summaries of its features and technical details.
- **Includes Key Details:**
  - **Project Title:** VocaFI
  - **Description:** Voice-controlled DeFi trading with AI-powered chat assistance, Enso routing, and Safe smart account integration.
  - **GitHub Repo:** [https://github.com/Mazzz-zzz/voca.fi](https://github.com/Mazzz-zzz/voca.fi)
  - **Hackathon:** SAFE Agentathon ([Link](https://devfolio.co/projects/vocafi-8aba))
  - **Problems Solved:** Enhanced accessibility, improved user experience, efficient trade execution, and speed.
  - **Challenges:** Integration with OpenAI's voice API and Enso's routing API.

### 2. NFT Staking and Incentive System

- **Builder Commitment:**  
  New builders stake a nominal amount (e.g., $100) along with their project revival plan. This act is recorded on-chain and represented by a builder NFT (up to 10 available per project).

- **Early Advocate NFTs:**  
  Users who believe in the project mint limited-edition advocacy NFTs (starting at $5, rising to $30 as supply decreases). A maximum of 20 NFTs are available per builder, which later convert into a percentage allocation in future token releases.

### 3. AI Advocacy and Dynamic Updates

- **Dynamic Agent Behavior:**  
  Post builder commitment, the AI agents evolve based on real-time project progress, incorporating updates from both builder activity and on-chain data.
- **Incentivized Promotion:**  
  Agents continuously promote their associated projects, ensuring transparency and encouraging community engagement and secondary market activity for the NFTs.

---

## Roadmap & Future Phases

### Phase 1: MVP and VocaFI Deployment (Q1 2025)

- Deploy the VocaFI agent using SwarmNode.
- Develop the initial frontend interface showcasing the agent swarm.
- Implement builder commitment forms and NFT minting for the VocaFI project.

### Phase 2: Expansion & Conduit Integration (Q2 2025)

- Add additional agents representing other hackathon projects.
- Integrate Conduit to pull real-time blockchain data and index relevant project metrics.
- Enhance agent AI with feedback from builder progress and community interactions.

### Phase 3: Decentralized Storage with Celestia & Wallet Integration (Q3 2025)

- Migrate project metadata and NFT data storage to Celestia.
- Implement wallet integration (e.g., MetaMask, WalletConnect) for secure user interactions.
- Automate agent execution schedules for continuous updates.

### Phase 4: Ecosystem Maturity and Tokenization (Q4 2025 and Beyond)

- Launch a secondary market for early advocate NFTs.
- Allocate a portion of future project tokens to NFT holders.
- Introduce on-chain governance and AI-driven agent orchestration.
- Expand cross-chain and DeFi functionalities.

---

## Getting Started

### Prerequisites

- **Software:** Python 3.8+, Node.js (for frontend development)
- **APIs:** OpenAI API key, SwarmNode API key
- **Blockchain:** Access to Ethereum or compatible network for NFT minting and wallet integrations

### Setup Instructions

1. **Clone the Repository**

   ```bash
   git clone https://github.com/your-org/mammothon-agent-swarm.git
   cd mammothon-agent-swarm
   ```

2. **Create and Activate a Virtual Environment**

   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install Dependencies**

   ```bash
   pip install -r requirements.txt
   ```

4. **Set Environment Variables**

   ```bash
   export OPENAI_API_KEY="your-openai-api-key"
   export SWARMNODE_API_KEY="your-swarmnode-api-key"
   ```

5. **Run the VocaFI Agent Locally**

Frontend: python run_local.py
Backend: python serve.py

```bash
uvicorn vocafi_agent:app --reload
```

Visit [http://127.0.0.1:8000/vocafi](http://127.0.0.1:8000/vocafi) to view the agent in action.

---

## Contributing

We welcome contributions from developers, builders, and the community. To contribute:

- Fork the repository.
- Create a feature branch.
- Submit pull requests detailing your changes.
- For major updates, please open an issue to discuss your ideas.

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## Contact

For questions, ideas, or collaborations, please reach out via:

- lens: [@papa](https://hey.xyz/papajams)
- warpcast: [@papa](https://warpcast.com/papa)
- Email: papaandthejimjams@gmail.com

---

Join us in redefining project advocacy, decentralized innovation, and community-driven project resurrection with the Mammothon Agent Swarm!

## Project Status & Handover

### Completed by Papa (Frontend & Initial Setup)

- [x] Basic project structure and architecture
- [x] Frontend implementation with dynamic agent loading
- [x] Responsive chat interface with animations
- [x] Agent appearance customization (SVG mammoth designs)
- [x] Initial Gemini AI integration
- [x] Basic API routing and server setup
- [x] Deployment pipeline (Netlify frontend, Koyeb backend)
- [x] Environment configuration and security
- [x] Chat functionality for all agents
- [x] Project documentation and README

### To Be Implemented by Pallasite (Backend & Web3)

#### Phase 1: SwarmNode Migration (Current Priority)

- [ ] Migrate agents from direct Gemini integration to SwarmNode
  - Study performance differences between direct Gemini vs. SwarmNode
  - Implement persistent storage for chat history
  - Set up agent scheduling for automated updates
  - Document SwarmNode advantages and implementation details

#### Phase 2: Data Layer Implementation

- [ ] Conduit Integration

  - Set up Conduit indexing for on-chain data
  - Implement real-time data updates
  - Create API endpoints for blockchain data queries
  - Document Conduit integration process

- [ ] Celestia Integration
  - Design data schema for project metadata
  - Implement data availability layer
  - Create storage handlers for NFT records
  - Document Celestia integration process

#### Phase 3: Smart Contract Development

- [ ] NFT Contract Implementation
  - Design builder commitment contract
  - Implement early advocate NFT minting
  - Create secondary market functionality
  - Document smart contract architecture

### To Be Implemented by Samuel (Frontend & UX)

#### Phase 1: Enhanced UI/UX (Current Priority)

- [ ] Implement responsive grid layout for agent positioning

  - Design mobile-first layout adaptations
  - Add smooth transitions for agent movements
  - Implement touch-friendly interactions

- [ ] Enhance Chat Interface

  - Add rich text formatting support for agent messages
  - Implement code syntax highlighting
  - Add image/media support in chat
  - Create loading states and animations

- [ ] Accessibility Improvements
  - Add ARIA labels and roles
  - Implement keyboard navigation
  - Ensure proper contrast ratios
  - Add screen reader support

#### Phase 2: Advanced Features

- [ ] Agent Customization

  - Create theme customization options
  - Add agent animation states
  - Implement sound effects (optional/mutable)
  - Design notification system

- [ ] Progressive Web App
  - Set up service worker
  - Implement offline capabilities
  - Add push notifications
  - Create app manifest

### Development Environment

#### Backend Setup

```bash
# Clone the repository
git clone https://github.com/thisyearnofear/mammothon-swarm.git
cd mammothon-swarm

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys
```

#### Running Locally

```bash
# Start the backend server
uvicorn src.api.serve:app --reload --port 8001

# Frontend is served statically through the backend
# Visit http://localhost:8001
```

#### Deployment

```bash
# Frontend (Netlify)
git push origin master  # Netlify auto-deploys from master

# Backend (Koyeb)
git push origin master  # Koyeb auto-deploys from master
```

Required environment variables for backend:

- `GEMINI_API_KEY`: For AI model access
- `SWARMNODE_API_KEY`: For agent deployment
- `PORT`: Server port (default: 8000)

## Technical Resources for Handover

### SwarmNode Resources

- [SwarmNode Documentation](https://docs.swarmnode.io)
- [Python Agent Examples](https://github.com/swarmnode/examples)
- [Agent Scheduling Guide](https://docs.swarmnode.io/scheduling)

### Web3 Integration Resources

- [Conduit Quick Start](https://docs.conduit.xyz/quick-start)
- [Celestia Data Availability](https://docs.celestia.org/developers/data-availability)
- [NFT Contract Examples](https://docs.openzeppelin.com/contracts/4.x/erc721)

## Contact & Handover

- Frontend/Design: [@papa](https://warpcast.com/papa)
- Backend/Web3: [@pallasite99](https://github.com/pallasite99)
