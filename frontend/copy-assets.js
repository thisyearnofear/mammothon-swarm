const fs = require("fs");
const path = require("path");

// Source and destination directories
const sourceDir = path.join(__dirname, "..", "src", "static");
const destDir = path.join(__dirname, "public");

// Create destination directory if it doesn't exist
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

// Check if source directory exists
if (!fs.existsSync(sourceDir)) {
  console.log(`Source directory ${sourceDir} does not exist.`);
  console.log("Creating necessary directories in public...");

  // Create common directories that might be needed
  const dirsToCreate = ["css", "js", "images", "components"];

  for (const dir of dirsToCreate) {
    const dirPath = path.join(destDir, dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`Created directory: ${dirPath}`);
    }
  }

  // Create a simple verification file to confirm the process worked
  fs.writeFileSync(
    path.join(destDir, "copy-verification.txt"),
    `Assets directory setup at ${new Date().toISOString()}`
  );
  console.log("Created verification file.");
  console.log("Done setting up public directory.");
  process.exit(0);
}

// Function to copy a directory recursively
function copyDir(src, dest) {
  // Create destination directory if it doesn't exist
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  // Read source directory
  const entries = fs.readdirSync(src, { withFileTypes: true });

  // Copy each entry
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    // Skip index.html and test.html
    if (entry.name === "index.html" || entry.name === "test.html") {
      continue;
    }

    if (entry.isDirectory()) {
      // Recursively copy directory
      copyDir(srcPath, destPath);
    } else {
      // Copy file
      fs.copyFileSync(srcPath, destPath);
      console.log(`Copied ${srcPath} to ${destPath}`);
    }
  }
}

// Copy favicon.ico specifically if it exists
const faviconSrc = path.join(sourceDir, "favicon.ico");
const faviconDest = path.join(destDir, "favicon.ico");
if (fs.existsSync(faviconSrc)) {
  fs.copyFileSync(faviconSrc, faviconDest);
  console.log(`Copied ${faviconSrc} to ${faviconDest}`);
}

// Start copying
console.log("Copying static assets to public directory...");
copyDir(sourceDir, destDir);
console.log("Done copying static assets.");

// Create a simple verification file to confirm the copy process worked
fs.writeFileSync(
  path.join(destDir, "copy-verification.txt"),
  `Assets copied at ${new Date().toISOString()}`
);
console.log("Created verification file.");
