#!/bin/bash

# Cleanup script for Mammothon Agent Swarm project
# This script removes files that are no longer needed after deployment

echo "Starting cleanup process..."

# Create a backup directory
echo "Creating backup directory..."
mkdir -p backup_before_cleanup
date_str=$(date +"%Y%m%d_%H%M%S")
backup_dir="backup_before_cleanup/backup_$date_str"
mkdir -p "$backup_dir"

# Backup files before removing
echo "Backing up files before removal..."
cp -r Dockerfile "$backup_dir"/ 2>/dev/null || true
cp -r koyeb.yaml "$backup_dir"/ 2>/dev/null || true
cp -r deploy.sh "$backup_dir"/ 2>/dev/null || true
cp -r netlify.toml "$backup_dir"/ 2>/dev/null || true
cp -r .buildpacks "$backup_dir"/ 2>/dev/null || true
cp -r run_local.py "$backup_dir"/ 2>/dev/null || true
cp -r dev.sh "$backup_dir"/ 2>/dev/null || true
cp -r package.json "$backup_dir"/ 2>/dev/null || true
cp -r package-lock.json "$backup_dir"/ 2>/dev/null || true

# Backup src directory if it exists
if [ -d "src" ]; then
  echo "Backing up src directory..."
  cp -r src "$backup_dir"/ 2>/dev/null || true
fi

# Remove deployment-related files
echo "Removing deployment-related files..."
rm -f Dockerfile 2>/dev/null || true
rm -f koyeb.yaml 2>/dev/null || true
rm -f deploy.sh 2>/dev/null || true
rm -f netlify.toml 2>/dev/null || true
rm -f .buildpacks 2>/dev/null || true

# Remove local development files
echo "Removing local development files..."
rm -f run_local.py 2>/dev/null || true
rm -f dev.sh 2>/dev/null || true
rm -rf __pycache__ 2>/dev/null || true

# Remove Node.js related files
echo "Removing Node.js related files..."
rm -f package.json 2>/dev/null || true
rm -f package-lock.json 2>/dev/null || true

# Ask before removing large directories
read -p "Do you want to remove the node_modules directory? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo "Removing node_modules directory..."
  rm -rf node_modules 2>/dev/null || true
fi

read -p "Do you want to remove the src directory? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo "Removing src directory..."
  rm -rf src 2>/dev/null || true
fi

read -p "Do you want to remove the venv directory? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo "Removing venv directory..."
  rm -rf venv 2>/dev/null || true
fi

echo "Cleanup completed!"
echo "A backup of removed files has been created in: $backup_dir"
echo "If you need to restore any files, you can find them in the backup directory." 