# Scripts Directory

This directory contains utility scripts for development, testing, and deployment of the Mammothon Agent Swarm project.

## Available Scripts

### Development Scripts

- **dev.sh**: Starts both the frontend and backend for development.

  ```bash
  ./dev.sh
  ```

- **run-both.js**: Runs both the original static HTML/JS version and the Next.js version side by side for testing and comparison.
  ```bash
  node scripts/run-both.js
  ```

### Testing Scripts

- **check-api.sh**: Checks if the API endpoints are working correctly.
  ```bash
  ./scripts/check-api.sh
  ```

### Cleanup Scripts

- **cleanup.sh**: Cleans up temporary files and prepares the project for deployment.

  ```bash
  ./scripts/cleanup.sh
  ```

- **cleanup-project.sh**: Performs a more thorough cleanup for project restructuring.
  ```bash
  ./scripts/cleanup-project.sh
  ```

## Usage

Most scripts can be run directly from the root directory using the symlinks provided:

```bash
./dev.sh
```

Or by specifying the path to the script:

```bash
./scripts/check-api.sh
```

For JavaScript scripts, use Node.js:

```bash
node scripts/run-both.js
```

## Adding New Scripts

When adding new scripts to this directory, please follow these guidelines:

1. Use descriptive names that indicate the script's purpose
2. Add proper documentation at the beginning of the script
3. Include error handling and user feedback
4. Make shell scripts executable with `chmod +x script-name.sh`
5. Update this README with information about the new script

## Script Conventions

- Shell scripts should use the `.sh` extension
- JavaScript scripts should use the `.js` extension
- All scripts should include a header comment explaining their purpose
- Scripts should provide colored output for better readability
- Scripts should check for prerequisites before running
