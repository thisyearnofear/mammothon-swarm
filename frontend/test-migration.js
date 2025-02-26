/**
 * Migration Test Script
 *
 * This script verifies that the migration from static HTML/JS to Next.js is complete.
 * It checks for the existence of all necessary files and directories.
 */

const fs = require("fs");
const path = require("path");

// Define the expected structure
const expectedStructure = {
  directories: ["components", "lib", "pages", "public", "styles"],
  files: [
    "next.config.js",
    "package.json",
    "tsconfig.json",
    ".env.local",
    "netlify.toml",
    "README.md",
    "MIGRATION.md",
    "components/WalletConnect.tsx",
    "lib/agents.ts",
    "lib/config.ts",
    "pages/_app.tsx",
    "pages/_document.tsx",
    "pages/index.tsx",
    "styles/globals.css",
    "styles/Home.module.css",
  ],
};

// Check if a file or directory exists
function checkExists(relativePath) {
  const fullPath = path.join(__dirname, relativePath);
  try {
    fs.accessSync(fullPath);
    return true;
  } catch (err) {
    return false;
  }
}

// Run the tests
function runTests() {
  console.log("Running migration tests...\n");

  let allPassed = true;

  // Check directories
  console.log("Checking directories:");
  for (const dir of expectedStructure.directories) {
    const exists = checkExists(dir);
    console.log(`  ${exists ? "✅" : "❌"} ${dir}`);
    if (!exists) allPassed = false;
  }

  // Check files
  console.log("\nChecking files:");
  for (const file of expectedStructure.files) {
    const exists = checkExists(file);
    console.log(`  ${exists ? "✅" : "❌"} ${file}`);
    if (!exists) allPassed = false;
  }

  // Final result
  console.log("\nTest result:");
  if (allPassed) {
    console.log("✅ All tests passed! The migration is complete.");
    console.log("You can now run the Next.js app with:");
    console.log("  npm run dev");
  } else {
    console.log(
      "❌ Some tests failed. Please check the missing files or directories."
    );
  }
}

// Run the tests
runTests();
