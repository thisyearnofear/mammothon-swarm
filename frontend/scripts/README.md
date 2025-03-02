# Project Scripts

This directory contains utility scripts for managing the project's blockchain interactions.

## Setup

Before running any scripts, make sure to:

1. Install dependencies:

   ```
   cd frontend
   npm install
   ```

2. Create a `.env` file in the `frontend` directory with your private key:
   ```
   PRIVATE_KEY=your_private_key_here
   ```

## Available Scripts

### Compiling Contracts

```
node scripts/compile-contracts.js
```

Compiles all Solidity contracts in the project using Hardhat.

### Deploying ProjectStaking Contract

```
node scripts/deploy-project-staking.js
```

Deploys the ProjectStaking contract to the Monad testnet with automatic project initialization. After deployment, update the contract address in `frontend/src/lib/contracts.js`.

### Adding Projects to ProjectStaking

```
node scripts/add-projects.js
```

Adds predefined projects to the ProjectStaking contract if they don't already exist.

### Checking Projects

```
node scripts/check-projects.js
```

Lists all projects currently registered in the ProjectStaking contract.

### Testing Project ID Normalization

```
node scripts/test-project-ids.js
```

Tests the project ID normalization functionality in the ProjectStaking contract.

### Checking Monad Contract

```
node scripts/check-monad-contract.js
```

Checks the status of the BuilderNFT contract on the Monad testnet.

### Testing NFT Ownership

```
node scripts/test-has-received-nft.js
```

Tests if a specific address has received an NFT for a given project.

## Workflow for Updating the ProjectStaking Contract

1. Modify the `ProjectStaking.sol` contract as needed
2. Compile the contracts: `node scripts/compile-contracts.js`
3. Deploy the updated contract: `node scripts/deploy-project-staking.js`
4. Update the contract address in `frontend/src/lib/contracts.js`
5. Verify the deployment: `node scripts/check-projects.js`
6. Test project ID normalization: `node scripts/test-project-ids.js`

## Troubleshooting

- If you encounter errors about missing dependencies, run `npm install` in the frontend directory.
- If transactions fail, ensure your account has sufficient MON for gas fees on the Monad testnet.
- If contract deployment fails, check that your private key is correctly set in the `.env` file.
- If you can't see your NFTs for staking, verify that the project exists in the ProjectStaking contract using `check-projects.js`.
