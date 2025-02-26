# Mammothon Agent Swarm

Mammothon Agent Swarm reimagines the spirit of the Million Dollar Homepage by turning abandoned hackathon projects into dynamic, AI-powered agents. These agents explain each project's vision and technical details, invite new builders to take over via a staking mechanism, and incentivize early community advocates through limited-edition NFTs. By combining decentralized data layers (Conduit and Celestia) with AI advocacy, Mammothon creates a trustless ecosystem for resurrecting and growing innovative projects.

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
  Each agent is powered by AI (using LangChain and OpenAI) to deliver natural language explanations of its project’s vision, technical details, and future potential.

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

- GitHub Issues
- [Discord](https://discord.gg/mammothon)
- Email: contact@mammothon.io

---

Join us in redefining project advocacy, decentralized innovation, and community-driven project resurrection with the Mammothon Agent Swarm!
