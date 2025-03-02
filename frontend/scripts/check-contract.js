/**
 * Script to check the BuilderNFT contract state
 *
 * Run with: node scripts/check-contract.js
 */

const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

// Hardcoded minimal ABI for the BuilderNFT contract
// This includes just the functions we need to check the contract state
const contractABI = [
  // State variables
  "function mintingEnabled() view returns (bool)",
  "function mintPrice() view returns (uint256)",
  "function owner() view returns (address)",

  // Functions
  "function getTotalTokens() view returns (uint256)",
  "function hasReceivedNFT(string calldata githubUsername, string calldata projectId) view returns (bool hasTokens, uint256 tokenCount)",
  "function getTokensByGithubUsername(string calldata githubUsername) view returns (uint256[])",
  "function getTokensByProject(string calldata projectId) view returns (uint256[])",
  "function uri(uint256 tokenId) view returns (string memory)",
];

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

async function checkContract() {
  try {
    // Connect to Zora Sepolia
    const provider = new ethers.providers.JsonRpcProvider(
      "https://sepolia.rpc.zora.energy"
    );

    // Create contract instance
    const contract = new ethers.Contract(
      contractAddress,
      contractABI,
      provider
    );

    console.log("Checking BuilderNFT contract state...");
    console.log("Contract address:", contractAddress);

    // Check if contract exists
    const code = await provider.getCode(contractAddress);
    if (code === "0x") {
      console.error("Contract does not exist at this address!");
      return;
    }

    console.log("Contract exists at the specified address");

    // Check contract state
    try {
      // Check mintingEnabled (as a state variable)
      const mintingEnabled = await contract.mintingEnabled();
      console.log("Minting enabled:", mintingEnabled);
    } catch (error) {
      console.error("Error checking mintingEnabled:", error.message);
    }

    try {
      // Check mint price
      const mintPrice = await contract.mintPrice();
      console.log("Mint price:", ethers.utils.formatEther(mintPrice), "ETH");
    } catch (error) {
      console.error("Error checking mintPrice:", error.message);
    }

    try {
      // Check total tokens
      const totalTokens = await contract.getTotalTokens();
      console.log("Total tokens:", totalTokens.toString());
    } catch (error) {
      console.error("Error checking totalTokens:", error.message);
    }

    try {
      // Check contract balance
      const balance = await provider.getBalance(contractAddress);
      console.log(
        "Contract balance:",
        ethers.utils.formatEther(balance),
        "ETH"
      );
    } catch (error) {
      console.error("Error checking contract balance:", error.message);
    }

    try {
      // Check contract owner
      const owner = await contract.owner();
      console.log("Contract owner:", owner);
    } catch (error) {
      console.error("Error checking contract owner:", error.message);
    }

    console.log("Contract check completed");
  } catch (error) {
    console.error("Error checking contract:", error);
  }
}

// Run the check
checkContract()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
