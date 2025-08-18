#!/bin/bash

# ContriBlock Deployment Script
# This script automates the deployment process for the ContriBlock platform

set -e  # Exit immediately if a command exits with a non-zero status

echo "===== ContriBlock Deployment Script ====="

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "Error: .env file not found. Please create it from .env.example"
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "Error: Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "Error: Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Build and start the containers
echo "Building and starting Docker containers..."
docker-compose build
docker-compose up -d

# Wait for services to be ready
echo "Waiting for services to be ready..."
sleep 10

# Check if services are running
echo "Checking if services are running..."
if ! docker-compose ps | grep -q "Up"; then
    echo "Error: Some services failed to start. Check the logs with 'docker-compose logs'"
    exit 1
fi

echo "Waiting for smart contracts to be deployed..."
sleep 20

# Check if the backend is accessible
echo "Checking if the backend API is accessible..."
if ! curl -s http://localhost:8000/api/v1/sectors > /dev/null; then
    echo "Warning: Backend API is not accessible. Check the logs with 'docker-compose logs backend'"
fi

# Print service URLs
echo "\n===== ContriBlock Services ====="
echo "Backend API: http://localhost:8000"
echo "IPFS Gateway: http://localhost:8080/ipfs/"
echo "Blockchain RPC: http://localhost:8545"

echo "\n===== Deployment Complete ====="
echo "You can access the services at the URLs above."
echo "To view logs, use 'docker-compose logs -f'"
echo "To stop the services, use 'docker-compose down'"