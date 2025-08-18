# ContriBlock Deployment Script for Windows
# This script automates the deployment process for the ContriBlock platform

$ErrorActionPreference = "Stop"  # Stop on first error

Write-Host "===== ContriBlock Deployment Script =====" -ForegroundColor Green

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "Error: .env file not found. Please create it from .env.example" -ForegroundColor Red
    exit 1
}

# Check if Docker is installed
try {
    docker --version | Out-Null
} catch {
    Write-Host "Error: Docker is not installed. Please install Docker Desktop for Windows first." -ForegroundColor Red
    exit 1
}

# Check if Docker Compose is installed
try {
    docker-compose --version | Out-Null
} catch {
    Write-Host "Error: Docker Compose is not installed. Please install Docker Desktop for Windows which includes Docker Compose." -ForegroundColor Red
    exit 1
}

# Build and start the containers
Write-Host "Building and starting Docker containers..." -ForegroundColor Cyan
docker-compose build
docker-compose up -d

# Wait for services to be ready
Write-Host "Waiting for services to be ready..." -ForegroundColor Cyan
Start-Sleep -Seconds 10

# Check if services are running
Write-Host "Checking if services are running..." -ForegroundColor Cyan
$services = docker-compose ps
if (-not ($services -match "Up")) {
    Write-Host "Error: Some services failed to start. Check the logs with 'docker-compose logs'" -ForegroundColor Red
    exit 1
}

Write-Host "Waiting for smart contracts to be deployed..." -ForegroundColor Cyan
Start-Sleep -Seconds 20

# Check if the backend is accessible
Write-Host "Checking if the backend API is accessible..." -ForegroundColor Cyan
try {
    Invoke-WebRequest -Uri "http://localhost:8000/api/v1/sectors" -Method GET -UseBasicParsing -TimeoutSec 5 | Out-Null
} catch {
    Write-Host "Warning: Backend API is not accessible. Check the logs with 'docker-compose logs backend'" -ForegroundColor Yellow
}

# Print service URLs
Write-Host "`n===== ContriBlock Services =====" -ForegroundColor Green
Write-Host "Backend API: http://localhost:8000" -ForegroundColor Cyan
Write-Host "IPFS Gateway: http://localhost:8080/ipfs/" -ForegroundColor Cyan
Write-Host "Blockchain RPC: http://localhost:8545" -ForegroundColor Cyan

Write-Host "`n===== Deployment Complete =====" -ForegroundColor Green
Write-Host "You can access the services at the URLs above." -ForegroundColor White
Write-Host "To view logs, use 'docker-compose logs -f'" -ForegroundColor White
Write-Host "To stop the services, use 'docker-compose down'" -ForegroundColor White