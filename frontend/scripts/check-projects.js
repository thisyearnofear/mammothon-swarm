/**
 * Script to check the current projects in the ProjectStaking contract on Monad testnet
 * Run with: node scripts/check-projects.js
 */

const { ethers } = require("ethers");
const {
  CONTRACT_ADDRESSES,
  PROJECT_STAKING_ABI,
} = require("../src/lib/contracts");

async function checkProjects() {
  try {
    console.log(
      "Checking projects in ProjectStaking contract on Monad testnet..."
    );
    console.log(`Contract address: ${CONTRACT_ADDRESSES.PROJECT_STAKING}`);

    // Connect to Monad testnet
    const provider = new ethers.providers.JsonRpcProvider(
      "https://testnet-rpc.monad.xyz"
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

    // Create contract instance
    const contract = new ethers.Contract(
      CONTRACT_ADDRESSES.PROJECT_STAKING,
      PROJECT_STAKING_ABI,
      provider
    );

    // Get all project IDs
    const projectIds = await contract.getAllProjectIds();
    console.log("Project IDs:", projectIds);

    // Get details for each project
    console.log("\nProject Details:");
    for (const projectId of projectIds) {
      try {
        const project = await contract.getProject(projectId);
        console.log(`\nProject ID: ${project.id}`);
        console.log(`Name: ${project.name}`);
        console.log(
          `Total Staked: ${ethers.utils.formatEther(project.totalStaked)} MON`
        );
        console.log(`Stakers Count: ${project.stakersCount.toString()}`);
        console.log(`Active: ${project.active}`);
      } catch (error) {
        console.error(
          `Error getting details for project ${projectId}:`,
          error.message
        );
      }
    }

    console.log("\nProject check completed");
  } catch (error) {
    console.error("Error checking projects:", error);
  }
}

// Run the script
checkProjects().catch(console.error);
