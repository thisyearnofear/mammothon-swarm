/**
 * Script to test project ID normalization in the ProjectStaking contract
 * Run with: node scripts/test-project-ids.js
 */

const { ethers } = require("ethers");
const {
  CONTRACT_ADDRESSES,
  PROJECT_STAKING_ABI,
} = require("../src/lib/contracts");

async function testProjectIds() {
  try {
    console.log(
      "Testing project ID normalization in ProjectStaking contract..."
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

    // Test variations of project IDs
    const testCases = [
      { input: "vocafi", expected: "vocafi" },
      { input: "VOCAFI", expected: "vocafi" },
      { input: "VocaFI", expected: "vocafi" },
      { input: "clarity", expected: "clarity" },
      { input: "CLARITY", expected: "clarity" },
      { input: "worldie", expected: "worldie" },
      { input: "WORLDIE", expected: "worldie" },
      { input: "mammothon", expected: "mammothon" },
      { input: "MAMMOTHON", expected: "mammothon" },
      { input: "nonexistent", expected: null },
    ];

    console.log("\nTesting project ID variations:");
    for (const testCase of testCases) {
      try {
        // Check if the project exists
        const exists = await contract.projectExists(testCase.input);

        if (exists) {
          // Get project details
          const project = await contract.getProject(testCase.input);
          console.log(`\nInput: "${testCase.input}"`);
          console.log(`Project exists: ${exists}`);
          console.log(`Resolved ID: ${project.id}`);
          console.log(`Name: ${project.name}`);
          console.log(`Expected: ${testCase.expected}`);
          console.log(
            `Result: ${
              project.id === testCase.expected ? "✅ PASS" : "❌ FAIL"
            }`
          );
        } else {
          console.log(`\nInput: "${testCase.input}"`);
          console.log(`Project exists: ${exists}`);
          console.log(
            `Expected: ${
              testCase.expected === null ? "not found" : testCase.expected
            }`
          );
          console.log(
            `Result: ${testCase.expected === null ? "✅ PASS" : "❌ FAIL"}`
          );
        }
      } catch (error) {
        console.error(
          `Error testing project ID "${testCase.input}":`,
          error.message
        );
      }
    }

    console.log("\nProject ID testing completed");
  } catch (error) {
    console.error("Error testing project IDs:", error);
  }
}

// Run the script
testProjectIds().catch(console.error);
