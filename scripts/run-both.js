/**
 * Run Both Versions
 *
 * This script runs both the original static HTML/JS version and the Next.js version
 * side by side for testing and comparison.
 */

const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
};

// Print a header
console.log(
  `${colors.bright}${colors.cyan}=== Running Both Versions Side by Side ===${colors.reset}\n`
);
console.log(
  `${colors.yellow}Original Version:${colors.reset} http://localhost:8001`
);
console.log(
  `${colors.green}Next.js Version:${colors.reset} http://localhost:3000\n`
);

// Check if Python is available
try {
  const pythonVersion = spawn("python", ["--version"]);
  pythonVersion.on("error", () => {
    console.error(
      `${colors.red}Error: Python is not installed or not in PATH${colors.reset}`
    );
    process.exit(1);
  });
} catch (error) {
  console.error(
    `${colors.red}Error: Python is not installed or not in PATH${colors.reset}`
  );
  process.exit(1);
}

// Check if Node.js is available
try {
  const nodeVersion = spawn("node", ["--version"]);
  nodeVersion.on("error", () => {
    console.error(
      `${colors.red}Error: Node.js is not installed or not in PATH${colors.reset}`
    );
    process.exit(1);
  });
} catch (error) {
  console.error(
    `${colors.red}Error: Node.js is not installed or not in PATH${colors.reset}`
  );
  process.exit(1);
}

// Start the original version
console.log(`${colors.yellow}Starting the original version...${colors.reset}`);
const originalProcess = spawn("python", ["run_local.py"], {
  cwd: path.join(__dirname),
  stdio: ["ignore", "pipe", "pipe"],
});

originalProcess.stdout.on("data", (data) => {
  console.log(
    `${colors.yellow}[Original] ${colors.reset}${data.toString().trim()}`
  );
});

originalProcess.stderr.on("data", (data) => {
  console.error(
    `${colors.yellow}[Original] ${colors.red}${data.toString().trim()}${
      colors.reset
    }`
  );
});

originalProcess.on("error", (error) => {
  console.error(
    `${colors.yellow}[Original] ${colors.red}Failed to start: ${error.message}${colors.reset}`
  );
});

originalProcess.on("close", (code) => {
  console.log(
    `${colors.yellow}[Original] Process exited with code ${code}${colors.reset}`
  );
});

// Start the Next.js version
console.log(`${colors.green}Starting the Next.js version...${colors.reset}`);
const nextjsProcess = spawn("npm", ["run", "dev"], {
  cwd: path.join(__dirname, "frontend"),
  stdio: ["ignore", "pipe", "pipe"],
});

nextjsProcess.stdout.on("data", (data) => {
  console.log(
    `${colors.green}[Next.js] ${colors.reset}${data.toString().trim()}`
  );
});

nextjsProcess.stderr.on("data", (data) => {
  console.error(
    `${colors.green}[Next.js] ${colors.red}${data.toString().trim()}${
      colors.reset
    }`
  );
});

nextjsProcess.on("error", (error) => {
  console.error(
    `${colors.green}[Next.js] ${colors.red}Failed to start: ${error.message}${colors.reset}`
  );
});

nextjsProcess.on("close", (code) => {
  console.log(
    `${colors.green}[Next.js] Process exited with code ${code}${colors.reset}`
  );
});

// Handle process termination
process.on("SIGINT", () => {
  console.log(
    `\n${colors.bright}${colors.cyan}=== Shutting down both versions ===${colors.reset}`
  );
  originalProcess.kill();
  nextjsProcess.kill();
  process.exit(0);
});

console.log(
  `\n${colors.bright}${colors.cyan}Both versions are now running. Press Ctrl+C to stop.${colors.reset}`
);
