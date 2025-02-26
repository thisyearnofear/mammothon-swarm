#!/bin/bash

# Colors for console output
RESET="\033[0m"
BOLD="\033[1m"
RED="\033[31m"
GREEN="\033[32m"
YELLOW="\033[33m"
BLUE="\033[34m"
CYAN="\033[36m"

echo -e "${BOLD}${CYAN}=== Mammothon Agent Swarm Development Environment ===${RESET}\n"

# Check if Python is available
if ! command -v python &> /dev/null; then
    echo -e "${RED}Error: Python is not installed or not in PATH${RESET}"
    exit 1
fi

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is not installed or not in PATH${RESET}"
    exit 1
fi

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo -e "${YELLOW}Creating Python virtual environment...${RESET}"
    python -m venv venv
fi

# Activate virtual environment
echo -e "${YELLOW}Activating Python virtual environment...${RESET}"
source venv/bin/activate

# Install Python dependencies if needed
if [ ! -f "venv/.dependencies_installed" ]; then
    echo -e "${YELLOW}Installing Python dependencies...${RESET}"
    pip install -r requirements.txt
    touch venv/.dependencies_installed
fi

# Check if frontend dependencies are installed
if [ ! -d "frontend/node_modules" ]; then
    echo -e "${GREEN}Installing frontend dependencies...${RESET}"
    (cd frontend && npm install)
fi

# Start backend and frontend in separate terminals
echo -e "${BOLD}${CYAN}Starting development environment...${RESET}\n"
echo -e "${YELLOW}Backend:${RESET} http://localhost:8001"
echo -e "${GREEN}Frontend:${RESET} http://localhost:3000\n"

# Use different approaches based on OS
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    osascript -e 'tell application "Terminal" to do script "cd '$(pwd)' && source venv/bin/activate && python run_local.py"'
    (cd frontend && npm run dev)
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    if command -v gnome-terminal &> /dev/null; then
        gnome-terminal -- bash -c "cd $(pwd) && source venv/bin/activate && python run_local.py; exec bash"
        (cd frontend && npm run dev)
    else
        echo -e "${YELLOW}Starting backend in background...${RESET}"
        (source venv/bin/activate && python run_local.py) &
        BACKEND_PID=$!
        (cd frontend && npm run dev)
        kill $BACKEND_PID
    fi
else
    # Windows or other
    echo -e "${YELLOW}Starting backend in background...${RESET}"
    (source venv/bin/activate && python run_local.py) &
    BACKEND_PID=$!
    (cd frontend && npm run dev)
    kill $BACKEND_PID
fi 