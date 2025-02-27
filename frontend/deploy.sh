#!/bin/bash

# Simple deployment script for the Mammothon frontend

# Make sure we're in the frontend directory
cd "$(dirname "$0")"

# Display help message
show_help() {
  echo "Mammothon Frontend Deployment Script"
  echo ""
  echo "Usage: ./deploy.sh [option]"
  echo ""
  echo "Options:"
  echo "  vercel       Deploy to Vercel (recommended)"
  echo "  docker       Build and run Docker container locally"
  echo "  docker-push  Build and push Docker image to registry"
  echo "  help         Show this help message"
  echo ""
}

# Check if Vercel CLI is installed
check_vercel() {
  if ! command -v vercel &> /dev/null; then
    echo "Vercel CLI not found. Installing..."
    npm install -g vercel
  fi
}

# Deploy to Vercel
deploy_vercel() {
  check_vercel
  echo "Deploying to Vercel..."
  vercel
}

# Build and run Docker container locally
deploy_docker() {
  echo "Building and running Docker container locally..."
  if [ -f "docker-compose.yml" ]; then
    docker-compose up -d
    echo "Container started. Access at http://localhost:3000"
    echo "To view logs: docker-compose logs -f"
    echo "To stop: docker-compose down"
  else
    docker build -t mammothon-frontend .
    docker run -d -p 3000:3000 --name mammothon-frontend mammothon-frontend
    echo "Container started. Access at http://localhost:3000"
    echo "To view logs: docker logs -f mammothon-frontend"
    echo "To stop: docker stop mammothon-frontend && docker rm mammothon-frontend"
  fi
}

# Build and push Docker image to registry
deploy_docker_push() {
  echo "Enter Docker registry username:"
  read -r username
  
  echo "Enter image name (default: mammothon-frontend):"
  read -r image_name
  image_name=${image_name:-mammothon-frontend}
  
  echo "Enter tag (default: latest):"
  read -r tag
  tag=${tag:-latest}
  
  echo "Building and pushing Docker image to $username/$image_name:$tag..."
  docker build -t "$username/$image_name:$tag" .
  docker push "$username/$image_name:$tag"
  
  echo "Image pushed successfully!"
}

# Main script logic
case "$1" in
  vercel)
    deploy_vercel
    ;;
  docker)
    deploy_docker
    ;;
  docker-push)
    deploy_docker_push
    ;;
  help|--help|-h)
    show_help
    ;;
  *)
    echo "Please specify a deployment option."
    show_help
    exit 1
    ;;
esac 