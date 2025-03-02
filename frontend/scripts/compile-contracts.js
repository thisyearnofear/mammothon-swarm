/**
 * Script to compile Solidity contracts
 * Run with: node scripts/compile-contracts.js
 */

const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");

async function compileContracts() {
  try {
    console.log("Compiling Solidity contracts...");

    // Get the root directory (one level up from frontend)
    const rootDir = path.join(__dirname, "../..");

    // Check if hardhat.config.js exists
    const hardhatConfigPath = path.join(rootDir, "hardhat.config.js");
    if (!fs.existsSync(hardhatConfigPath)) {
      console.error("hardhat.config.js not found in the root directory");
      return;
    }

    // Run npx hardhat compile
    console.log("Running npx hardhat compile...");
    execSync("npx hardhat compile", {
      cwd: rootDir,
      stdio: "inherit",
    });

    console.log("\nCompilation completed successfully");

    // Check if artifacts directory exists
    const artifactsDir = path.join(rootDir, "artifacts/contracts");
    if (!fs.existsSync(artifactsDir)) {
      console.error(
        "Artifacts directory not found. Compilation may have failed."
      );
      return;
    }

    // List compiled contracts
    console.log("\nCompiled contracts:");
    const contracts = fs.readdirSync(artifactsDir);
    contracts.forEach((contract) => {
      console.log(`- ${contract}`);
    });

    console.log(
      "\nYou can now deploy the contracts using the deployment scripts"
    );
  } catch (error) {
    console.error("Error compiling contracts:", error);
  }
}

// Run the script
compileContracts().catch(console.error);
