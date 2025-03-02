/**
 * Simple script to check if minting is enabled on the BuilderNFT contract
 *
 * Run with: node scripts/check-minting.js
 */

const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

// Load contract address from contracts file
const contractsFile = fs.readFileSync(
  path.join(__dirname, "../src/lib/contracts.js"),
  "utf8"
);

// Extract the BUILDER_NFT address using regex
const contractAddressMatch = contractsFile.match(
  /BUILDER_NFT:\s*['"]([^'"]+)['"]/
);
const contractAddress = contractAddressMatch ? contractAddressMatch[1] : null;

if (!contractAddress) {
  console.error("Could not find BUILDER_NFT address in contracts.js");
  process.exit(1);
}

// Minimal ABI for just checking mintingEnabled
const minimalABI = ["function mintingEnabled() view returns (bool)"];

async function checkMintingEnabled() {
  try {
    console.log("Checking if minting is enabled on BuilderNFT contract...");
    console.log("Contract address:", contractAddress);

    // Connect to Zora Sepolia
    const provider = new ethers.providers.JsonRpcProvider(
      "https://sepolia.rpc.zora.energy"
    );

    // Check if contract exists
    const code = await provider.getCode(contractAddress);
    if (code === "0x") {
      console.error("Contract does not exist at this address!");
      return;
    }

    // Create contract instance with minimal ABI
    const contract = new ethers.Contract(contractAddress, minimalABI, provider);

    // Check if minting is enabled
    const mintingEnabled = await contract.mintingEnabled();
    console.log("Minting enabled:", mintingEnabled);

    return mintingEnabled;
  } catch (error) {
    console.error("Error checking if minting is enabled:", error.message);
    return null;
  }
}

// Run the check
checkMintingEnabled()
  .then((enabled) => {
    if (enabled !== null) {
      console.log(
        `\nMinting is currently ${
          enabled ? "ENABLED" : "DISABLED"
        } on the contract.`
      );
    }
    process.exit(0);
  })
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
