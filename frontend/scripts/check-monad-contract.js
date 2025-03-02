/**
 * Script to check if the BuilderNFT contract is working correctly on Monad testnet
 * Run with: node scripts/check-monad-contract.js
 */

const { ethers } = require("ethers");
const { CONTRACT_ADDRESSES, BUILDER_NFT_ABI } = require("../src/lib/contracts");

async function checkMonadContract() {
  try {
    console.log("Checking BuilderNFT contract on Monad testnet...");
    console.log(`Contract address: ${CONTRACT_ADDRESSES.BUILDER_NFT}`);

    // Connect to Monad testnet
    const provider = new ethers.providers.JsonRpcProvider(
      "https://testnet-rpc.monad.xyz"
    );

    // Check if the contract exists
    const code = await provider.getCode(CONTRACT_ADDRESSES.BUILDER_NFT);
    if (code === "0x") {
      console.error(
        "Contract does not exist at the specified address on Monad testnet"
      );
      return;
    }

    console.log("Contract exists at the specified address");

    // Create contract instance
    const contract = new ethers.Contract(
      CONTRACT_ADDRESSES.BUILDER_NFT,
      BUILDER_NFT_ABI,
      provider
    );

    // Check contract state
    try {
      const mintingEnabled = await contract.mintingEnabled();
      console.log(`Minting enabled: ${mintingEnabled}`);
    } catch (error) {
      console.error("Error checking if minting is enabled:", error.message);
    }

    try {
      const mintPrice = await contract.mintPrice();
      console.log(`Mint price: ${ethers.utils.formatEther(mintPrice)} MON`);
    } catch (error) {
      console.error("Error checking mint price:", error.message);
    }

    try {
      const totalTokens = await contract.getTotalTokens();
      console.log(`Total tokens: ${totalTokens.toString()}`);
    } catch (error) {
      console.error("Error checking total tokens:", error.message);
    }

    // Check contract balance
    const balance = await provider.getBalance(CONTRACT_ADDRESSES.BUILDER_NFT);
    console.log(`Contract balance: ${ethers.utils.formatEther(balance)} MON`);

    console.log("Contract check completed");
  } catch (error) {
    console.error("Error checking contract:", error);
  }
}

// Run the check
checkMonadContract().catch(console.error);
