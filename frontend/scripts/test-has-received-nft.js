/**
 * Script to test the hasReceivedNFT function on the BuilderNFT contract
 * Run with: node scripts/test-has-received-nft.js
 */

const { ethers } = require("ethers");
const { CONTRACT_ADDRESSES, BUILDER_NFT_ABI } = require("../src/lib/contracts");

async function testHasReceivedNFT() {
  try {
    console.log("Testing hasReceivedNFT function on Monad testnet...");
    console.log(`Contract address: ${CONTRACT_ADDRESSES.BUILDER_NFT}`);

    // Connect to Monad testnet
    const provider = new ethers.providers.JsonRpcProvider(
      "https://testnet-rpc.monad.xyz"
    );

    // Create contract instance
    const contract = new ethers.Contract(
      CONTRACT_ADDRESSES.BUILDER_NFT,
      BUILDER_NFT_ABI,
      provider
    );

    // Test parameters
    const githubUsername = "thisyearnofear";
    const projectId = "vocafi";

    console.log(
      `Testing with GitHub username: ${githubUsername}, Project ID: ${projectId}`
    );

    try {
      // Check if the function exists in the ABI
      const hasFunction = BUILDER_NFT_ABI.some(
        (item) => typeof item === "string" && item.includes("hasReceivedNFT")
      );

      console.log(`hasReceivedNFT function exists in ABI: ${hasFunction}`);

      if (!hasFunction) {
        console.log("Adding hasReceivedNFT function to ABI...");
        // Create a new contract instance with the function added to the ABI
        const extendedABI = [
          ...BUILDER_NFT_ABI,
          "function hasReceivedNFT(string calldata githubUsername, string calldata projectId) public view returns (bool hasTokens, uint256 tokenCount)",
        ];

        const contractWithExtendedABI = new ethers.Contract(
          CONTRACT_ADDRESSES.BUILDER_NFT,
          extendedABI,
          provider
        );

        // Call the function
        const result = await contractWithExtendedABI.hasReceivedNFT(
          githubUsername,
          projectId
        );
        console.log(
          `Result: hasTokens=${
            result.hasTokens
          }, tokenCount=${result.tokenCount.toString()}`
        );
      } else {
        // Call the function
        const result = await contract.hasReceivedNFT(githubUsername, projectId);
        console.log(
          `Result: hasTokens=${
            result.hasTokens
          }, tokenCount=${result.tokenCount.toString()}`
        );
      }
    } catch (error) {
      console.error("Error calling hasReceivedNFT:", error.message);

      // Try calling getHashValues as a fallback
      try {
        console.log("Trying getHashValues as a fallback...");
        const hashValues = await contract.getHashValues(
          githubUsername,
          projectId
        );
        console.log("Hash values retrieved successfully:");
        console.log(`GitHub username hash: ${hashValues.githubHash}`);
        console.log(`Project ID hash: ${hashValues.projectHash}`);
      } catch (hashError) {
        console.error("Error calling getHashValues:", hashError.message);
      }
    }

    console.log("Test completed");
  } catch (error) {
    console.error("Error testing hasReceivedNFT:", error);
  }
}

// Run the test
testHasReceivedNFT().catch(console.error);
