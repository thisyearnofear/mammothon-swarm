/**
 * Script to add projects to the ProjectStaking contract on Monad testnet
 * Run with: node scripts/add-projects.js
 */

const { ethers } = require("ethers");
const {
  CONTRACT_ADDRESSES,
  PROJECT_STAKING_ABI,
} = require("../src/lib/contracts");
require("dotenv").config();

// Define the projects to add
const projects = [
  { id: "vocafi", name: "VocaFI" },
  { id: "clarity", name: "Clarity" },
  { id: "worldie", name: "Hello World Computer" },
  { id: "mammothon", name: "Mammothon" },
];

async function addProjects() {
  try {
    console.log(
      "Adding projects to ProjectStaking contract on Monad testnet..."
    );
    console.log(`Contract address: ${CONTRACT_ADDRESSES.PROJECT_STAKING}`);

    // You need a private key to sign transactions
    // This should be in your .env file as PRIVATE_KEY
    if (!process.env.PRIVATE_KEY) {
      console.error(
        "No private key found in .env file. Please add PRIVATE_KEY=your_private_key to your .env file."
      );
      return;
    }

    // Connect to Monad testnet
    const provider = new ethers.providers.JsonRpcProvider(
      "https://testnet-rpc.monad.xyz"
    );

    // Create a wallet with the private key
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

    // Create contract instance with signer
    const contract = new ethers.Contract(
      CONTRACT_ADDRESSES.PROJECT_STAKING,
      PROJECT_STAKING_ABI,
      wallet
    );

    // Check if the contract exists
    const code = await provider.getCode(CONTRACT_ADDRESSES.PROJECT_STAKING);
    if (code === "0x") {
      console.error(
        "Contract does not exist at the specified address on Monad testnet"
      );
      return;
    }

    console.log("Contract exists at the specified address");

    // Get existing project IDs
    const existingProjectIds = await contract.getAllProjectIds();
    console.log("Existing projects:", existingProjectIds);

    // Add each project if it doesn't already exist
    for (const project of projects) {
      if (!existingProjectIds.includes(project.id)) {
        console.log(`Adding project: ${project.id} (${project.name})`);
        try {
          const tx = await contract.addProject(project.id, project.name);
          console.log(`Transaction sent: ${tx.hash}`);
          await tx.wait();
          console.log(`Project ${project.id} added successfully`);
        } catch (error) {
          console.error(`Error adding project ${project.id}:`, error.message);
        }
      } else {
        console.log(`Project ${project.id} already exists`);
      }
    }

    // Verify all projects were added
    const updatedProjectIds = await contract.getAllProjectIds();
    console.log("Updated projects:", updatedProjectIds);

    console.log("Project addition completed");
  } catch (error) {
    console.error("Error adding projects:", error);
  }
}

// Run the script
addProjects().catch(console.error);
