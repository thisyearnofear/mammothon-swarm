/**
 * Script to deploy the ProjectStaking contract to Monad testnet
 * Run with: node scripts/deploy-project-staking.js
 *
 * Make sure to set your private key in the .env file:
 * PRIVATE_KEY=your_private_key_here
 */

require("dotenv").config();
const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");
const { CONTRACT_ADDRESSES } = require("../src/lib/contracts");

// Read the contract ABI and bytecode
const contractPath = path.join(
  __dirname,
  "../../artifacts/contracts/ProjectStaking.sol/ProjectStaking.json"
);
const contractJson = JSON.parse(fs.readFileSync(contractPath, "utf8"));
const abi = contractJson.abi;
const bytecode = contractJson.bytecode;

async function deployContract() {
  try {
    if (!process.env.PRIVATE_KEY) {
      console.error("Please set your PRIVATE_KEY in the .env file");
      return;
    }

    console.log("Deploying ProjectStaking contract to Monad testnet...");

    // Connect to Monad testnet
    const provider = new ethers.providers.JsonRpcProvider(
      "https://testnet-rpc.monad.xyz"
    );

    // Create wallet from private key
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    console.log(`Deploying from address: ${wallet.address}`);

    // Check balance
    const balance = await provider.getBalance(wallet.address);
    console.log(`Account balance: ${ethers.utils.formatEther(balance)} MON`);

    if (balance.eq(0)) {
      console.error(
        "Account has no MON. Please fund your account before deploying."
      );
      return;
    }

    // Create contract factory
    const factory = new ethers.ContractFactory(abi, bytecode, wallet);

    // Deploy contract with constructor arguments (BuilderNFT address)
    console.log(`Using BuilderNFT address: ${CONTRACT_ADDRESSES.BUILDER_NFT}`);
    const contract = await factory.deploy(CONTRACT_ADDRESSES.BUILDER_NFT);

    console.log(`Transaction hash: ${contract.deployTransaction.hash}`);
    console.log("Waiting for deployment confirmation...");

    // Wait for deployment to be confirmed
    await contract.deployed();

    console.log(`ProjectStaking contract deployed at: ${contract.address}`);
    console.log(
      "\nIMPORTANT: Update the PROJECT_STAKING address in frontend/src/lib/contracts.js with this new address"
    );

    // Verify the projects were initialized
    const projectIds = await contract.getAllProjectIds();
    console.log("\nInitialized projects:");
    console.log(projectIds);

    for (const projectId of projectIds) {
      const project = await contract.getProject(projectId);
      console.log(`- ${project.id}: ${project.name}`);
    }

    console.log("\nDeployment completed successfully");
  } catch (error) {
    console.error("Error deploying contract:", error);
  }
}

// Run the script
deployContract().catch(console.error);
