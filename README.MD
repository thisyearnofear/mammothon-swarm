# Mammothon Agent Swarm

A platform for reviving abandoned hackathon projects through AI agents and community staking.

## Overview

Mammothon Agent Swarm is a platform that aims to give new life to promising hackathon projects. The platform uses AI agents to represent these projects, allowing users to interact with them and learn about their potential. Users can stake on projects they believe in, incentivizing builders to revive and continue development.

A reimagining of the Million Dollar Homepage except instead of pixels, we have AI agents representing hackathon projects on the cusp of greatness. As builders commit to projects, and nudge them along, they gather momentum in the form of stakers & minters of their NFTs (who get access to the project and its potential over time). Our agents offer a marketing function as well as a way to track the progress of projects building on good ideas over time.

## How It Works (MVP)

- **The Homepage**: Five AI agents represent promising hackathon projects:

  - VocaFI - Voice-controlled DeFi trading with AI-powered chat assistance
  - Clarity - A payment gateway designed to tackle fake reviews
  - Hello World Computer - A decentralized compute network for AI workloads
  - Mammothon - The platform itself
  - Wooly - The guide to help users navigate the platform

- **Builder Selection**: It's trustless, builders can just fork code and start building.
- **Git tracking**: If you want the agent to start tracking your fork, mint an NFT.
- **NFT Creation**: An agent project can have many unique NFTs representing builders who've forked the project.
- **Early Advocates**: Users can stake testnet ETH on Optimism on the project + builder NFTs.
- **NFT staking** represents the ability to earn allocation in future token airdrop.
- **Multiplier**: actions + time + the more staked = more allocation.
- **Actions**: are set by the builder + project agent for community to undertake.
- **Secondary Market**: opens once a month for one day.
- **Value options**: remove stake = reimbursed ETH, lose rewards. Sell on secondary (along with rewards i.e. allocation earned). Keep for valhalla & help project succeed.

## Current Implementation

### Architecture

The project is implemented as a three-part system:

1. **Backend API (Python FastAPI)**

   - Deployed on Koyeb
   - Provides agent communication via Google's Gemini API
   - Exposes RESTful endpoints for agent interaction
   - Modular design with base agent class and specific agent implementations
   - GitHub activity tracking for projects

2. **Frontend (Next.js)**

   - Deployed on Vercel
   - Interactive UI for agent selection and chat
   - Responsive design for mobile and desktop
   - Real-time communication with backend API
   - Web3 integration for blockchain features

3. **Blockchain Components (Zora Testnet)**
   - Smart contracts for NFT minting and project staking
   - Builder NFTs to recognize project contributors
   - Project staking mechanism for community support
   - Deployed on Zora Sepolia testnet

### Live Deployment

- **Frontend**: [https://mammothon-swarm.vercel.app](https://mammothon-swarm.vercel.app)
- **Backend API**: [https://mammothon-backend-papajams-d9d0dedd.koyeb.app](https://mammothon-backend-papajams-d9d0dedd.koyeb.app)
- **Smart Contracts (Zora Sepolia Testnet)**:
  - Builder NFT: [0xfbe99dcd3b2d93b1c8ffabc26427383daaba05d1](https://explorer.sepolia.zora.energy/address/0xfbe99dcd3b2d93b1c8ffabc26427383daaba05d1)
  - Project Staking: [0x8B62D610c83C42Ea8A8fC10F80581d9B7701cd37](https://explorer.sepolia.zora.energy/address/0x8B62D610c83C42Ea8A8fC10F80581d9B7701cd37)

### API Endpoints

- `/health` - Health check endpoint
- `/agents` - List all available agents
- `/agents/{agent_name}` - Access a specific agent's API
- `/agents/{agent_name}/chat` - Chat with a specific agent
- `/github/projects` - List tracked GitHub projects
- `/github/activity` - Get GitHub activity for all tracked projects

## Roadmap to Full MVP

### Phase 1: Core Infrastructure (Completed)

- ✅ AI Agent implementation with Gemini API
- ✅ Backend API deployment on Koyeb
- ✅ Frontend deployment on Vercel
- ✅ Agent chat functionality
- ✅ GitHub activity tracking

### Phase 2: Blockchain Integration (In Progress)

- ✅ Deploy smart contracts on Zora Sepolia testnet
  - ✅ Builder NFT contract for recognizing contributors
  - ✅ Project staking contract for community support
- ✅ Frontend integration with blockchain

  - ✅ Web3 connection for wallet integration
  - ✅ NFT ownership verification
  - ✅ Project staking interface

- [ ] Integrate Conduit for data indexing

  - Track project forks and contributions
  - Monitor community engagement
  - Index on-chain activity related to projects

- [ ] Add Celestia for decentralized data storage
  - Store agent knowledge bases
  - Maintain project metadata
  - Enable decentralized content delivery

### Phase 3: Staking and Rewards (Partially Implemented)

- ✅ Deploy staking contracts on Zora Sepolia testnet
- ✅ Create basic staking interface
- [ ] Implement reward calculation based on project activity
- [ ] Create a comprehensive dashboard for tracking stakes and rewards
- [ ] Enable secondary market functionality

### Phase 4: Community Features

- [ ] Add project action tracking
- [ ] Implement builder-community communication channels
- [ ] Create leaderboards for projects and contributors
- [ ] Develop analytics for project momentum

## Blockchain Features

### Builder NFTs

Builder NFTs are ERC-721 tokens that represent contributions to projects in the Mammothon ecosystem. These NFTs serve as:

- Recognition for valuable contributions to projects
- Proof of participation in the ecosystem
- Potential for future governance rights and rewards

The BuilderNFT contract includes features such as:

- Tracking GitHub usernames associated with NFTs
- Mapping NFTs to specific projects
- Tracking repositories associated with contributions
- Flexible uniqueness checks that can be configured by the contract owner
- Support for multiple NFTs for different repositories under the same GitHub username/project combination
- Simplified interface with a single minting function that accepts repository names

### Project Staking

The Project Staking contract allows community members to stake ETH on projects they believe in. Features include:

- Staking ETH on specific projects
- Tracking total staked amount and number of stakers per project
- Unstaking functionality with proper accounting
- Project management by contract owner

## Development Setup

### Prerequisites

- Python 3.9+
- Node.js 18+
- npm or yarn
- Google Gemini API key
- MetaMask or another Web3 wallet

### Backend Setup

```bash
# Clone the repository
git clone https://github.com/thisyearnofear/mammothon-swarm.git
cd mammothon-agent-swarm

# Set up environment variables
cp .env.example .env
# Edit .env to add your Gemini API key

# Deploy to Koyeb (if you have Koyeb CLI installed)
koyeb deploy backend_deploy mammothon-backend/backend-api --ports 8000:http --routes /:8000 --archive-builder docker --archive-docker-dockerfile Dockerfile.backend --env "GEMINI_API_KEY=your_key_here" --env "PORT=8000"
```

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local to add your API and blockchain configuration

# Run development server
npm run dev

# Deploy to Vercel (if you have Vercel CLI installed)
vercel --prod
```

### Smart Contract Interaction

To interact with the deployed smart contracts:

1. Connect your wallet to the Zora Sepolia testnet
2. Get some testnet ETH from a faucet
3. Visit the Project Staking page to stake on projects
4. Check the Builder NFTs page to view your NFTs

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Contact

For questions or feedback, please open an issue on GitHub.
