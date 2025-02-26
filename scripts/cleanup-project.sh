#!/bin/bash

# Colors for console output
RESET="\033[0m"
BOLD="\033[1m"
RED="\033[31m"
GREEN="\033[32m"
YELLOW="\033[33m"
BLUE="\033[34m"
CYAN="\033[36m"

echo -e "${BOLD}${CYAN}=== Mammothon Agent Swarm Project Cleanup ===${RESET}\n"

# Create backup of static files
echo -e "${YELLOW}Creating backup of static files...${RESET}"
mkdir -p backup
if [ -d "src/static" ]; then
  cp -r src/static backup/static-backup
  echo -e "${GREEN}Backup created at backup/static-backup/${RESET}"
else
  echo -e "${YELLOW}No static directory found, skipping backup${RESET}"
fi

# List files that will be removed
echo -e "\n${BOLD}The following files/directories will be removed:${RESET}"
echo -e "${YELLOW}1. src/static/ (original static frontend)${RESET}"
echo -e "${YELLOW}2. Any temporary files (.DS_Store, __pycache__, etc.)${RESET}"
echo -e "${YELLOW}3. Any leftover build artifacts (.next, node_modules, etc.)${RESET}"

# Ask for confirmation
echo -e "\n${BOLD}${RED}WARNING: This action cannot be undone. A backup will be created in backup/static-backup/${RESET}"
read -p "Do you want to proceed with cleanup? (y/n): " confirm

if [[ $confirm != "y" && $confirm != "Y" ]]; then
    echo -e "\n${YELLOW}Cleanup cancelled.${RESET}"
    exit 0
fi

# Remove static directory
if [ -d "src/static" ]; then
  echo -e "\n${YELLOW}Removing static directory...${RESET}"
  rm -rf src/static
  echo -e "${GREEN}Static directory removed${RESET}"
else
  echo -e "\n${YELLOW}No static directory found, skipping removal${RESET}"
fi

# Remove temporary files
echo -e "\n${YELLOW}Removing temporary files...${RESET}"
find . -name ".DS_Store" -delete
find . -name "*.pyc" -delete
find . -name "__pycache__" -type d -exec rm -rf {} +
echo -e "${GREEN}Temporary files removed${RESET}"

# Check for unnecessary build artifacts
echo -e "\n${YELLOW}Checking for unnecessary build artifacts...${RESET}"

# Ask if user wants to remove node_modules
if [ -d "frontend/node_modules" ]; then
  read -p "Do you want to remove frontend/node_modules? (y/n): " remove_node_modules
  if [[ $remove_node_modules == "y" || $remove_node_modules == "Y" ]]; then
    echo -e "${YELLOW}Removing frontend/node_modules...${RESET}"
    rm -rf frontend/node_modules
    echo -e "${GREEN}frontend/node_modules removed${RESET}"
  fi
fi

# Ask if user wants to remove .next
if [ -d "frontend/.next" ]; then
  read -p "Do you want to remove frontend/.next? (y/n): " remove_next
  if [[ $remove_next == "y" || $remove_next == "Y" ]]; then
    echo -e "${YELLOW}Removing frontend/.next...${RESET}"
    rm -rf frontend/.next
    echo -e "${GREEN}frontend/.next removed${RESET}"
  fi
fi

# Check for Python virtual environment
if [ -d "venv" ]; then
  read -p "Do you want to remove the Python virtual environment (venv)? (y/n): " remove_venv
  if [[ $remove_venv == "y" || $remove_venv == "Y" ]]; then
    echo -e "${YELLOW}Removing Python virtual environment...${RESET}"
    rm -rf venv
    echo -e "${GREEN}Python virtual environment removed${RESET}"
  fi
fi

# Make scripts executable
echo -e "\n${YELLOW}Making scripts executable...${RESET}"
chmod +x dev.sh
chmod +x cleanup.sh
echo -e "${GREEN}Scripts are now executable${RESET}"

# Final verification
echo -e "\n${YELLOW}Verifying project structure...${RESET}"
echo -e "${CYAN}Checking for frontend directory...${RESET}"
if [ -d "frontend" ]; then
  echo -e "${GREEN}✓ Frontend directory exists${RESET}"
else
  echo -e "${RED}✗ Frontend directory not found${RESET}"
fi

echo -e "${CYAN}Checking for backend files...${RESET}"
if [ -d "src/api" ] && [ -d "src/agents" ]; then
  echo -e "${GREEN}✓ Backend directories exist${RESET}"
else
  echo -e "${RED}✗ Backend directories not found${RESET}"
fi

echo -e "${CYAN}Checking for documentation...${RESET}"
if [ -f "README.md" ] && [ -f "transition-guide.md" ]; then
  echo -e "${GREEN}✓ Documentation files exist${RESET}"
else
  echo -e "${RED}✗ Documentation files not found${RESET}"
fi

echo -e "\n${GREEN}Cleanup complete!${RESET}"
echo -e "${BOLD}Next steps:${RESET}"
echo -e "1. Run the application with ${YELLOW}./dev.sh${RESET} to test"
echo -e "2. Check the browser console for any errors"
echo -e "3. Verify that the API endpoints are working correctly"
echo -e "4. Push your changes to GitHub with:"
echo -e "   ${YELLOW}git add .${RESET}"
echo -e "   ${YELLOW}git commit -m \"Complete migration to Next.js\"${RESET}"
echo -e "   ${YELLOW}git push origin main${RESET}" 