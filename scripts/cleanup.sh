#!/bin/bash

# Colors for console output
RESET="\033[0m"
BOLD="\033[1m"
RED="\033[31m"
GREEN="\033[32m"
YELLOW="\033[33m"
BLUE="\033[34m"
CYAN="\033[36m"

echo -e "${BOLD}${CYAN}=== Mammothon Agent Swarm Cleanup Script ===${RESET}\n"

# Create backup of static files
echo -e "${YELLOW}Creating backup of static files...${RESET}"
mkdir -p backup
cp -r src/static backup/static-backup

# List files that will be removed
echo -e "\n${BOLD}The following files/directories will be removed:${RESET}"
echo -e "${YELLOW}1. src/static/ (original static frontend)${RESET}"
echo -e "${YELLOW}2. Any temporary files (.DS_Store, etc.)${RESET}"

# Ask for confirmation
echo -e "\n${BOLD}${RED}WARNING: This action cannot be undone. A backup will be created in backup/static-backup/${RESET}"
read -p "Do you want to proceed with cleanup? (y/n): " confirm

if [[ $confirm != "y" && $confirm != "Y" ]]; then
    echo -e "\n${YELLOW}Cleanup cancelled.${RESET}"
    exit 0
fi

# Remove static directory
echo -e "\n${YELLOW}Removing static directory...${RESET}"
rm -rf src/static

# Remove temporary files
echo -e "\n${YELLOW}Removing temporary files...${RESET}"
find . -name ".DS_Store" -delete
find . -name "*.pyc" -delete
find . -name "__pycache__" -type d -exec rm -rf {} +

# Check for agent initialization issues
echo -e "\n${BOLD}${CYAN}Checking for agent initialization issues...${RESET}"
echo -e "${YELLOW}Examining frontend agent initialization code...${RESET}"

# Check if the frontend agent initialization file exists
if [ -f "frontend/lib/agents.ts" ]; then
    echo -e "${GREEN}Found frontend/lib/agents.ts${RESET}"
    echo -e "${YELLOW}Checking for initialization code...${RESET}"
    grep -n "agentsInitialized" frontend/lib/agents.ts || echo -e "${RED}No agentsInitialized flag found in frontend/lib/agents.ts${RESET}"
else
    echo -e "${RED}frontend/lib/agents.ts not found${RESET}"
fi

# Check API endpoints
echo -e "\n${YELLOW}Checking API endpoints in serve.py...${RESET}"
grep -n "mount.*api" src/api/serve.py || echo -e "${RED}No API endpoints found in serve.py${RESET}"

echo -e "\n${GREEN}Cleanup complete!${RESET}"
echo -e "${BOLD}Next steps:${RESET}"
echo -e "1. Run the application with ${YELLOW}./dev.sh${RESET} to test"
echo -e "2. Check the browser console for any errors"
echo -e "3. Verify that the API endpoints are working correctly"
echo -e "4. Push your changes to GitHub" 