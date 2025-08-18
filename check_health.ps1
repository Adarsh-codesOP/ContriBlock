# ContriBlock Health Check Script for Windows
# This script checks the health of the deployed ContriBlock services

$ErrorActionPreference = "Stop"  # Stop on first error

Write-Host "===== ContriBlock Health Check =====" -ForegroundColor Green

# Check if Docker is running
try {
    docker info | Out-Null
    Write-Host "✓ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "✗ Docker is not running. Please start Docker Desktop." -ForegroundColor Red
    exit 1
}

# Check if containers are running
Write-Host "`nChecking container status..." -ForegroundColor Cyan
$containers = docker-compose ps

$services = @("backend", "postgres", "redis", "ipfs", "ganache", "contracts")
foreach ($service in $services) {
    if ($containers -match "$service.*Up") {
        Write-Host "✓ $service is running" -ForegroundColor Green
    } else {
        Write-Host "✗ $service is not running" -ForegroundColor Red
    }
}

# Check API health
Write-Host "`nChecking API health..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/api/v1/sectors" -Method GET -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "✓ Backend API is healthy" -ForegroundColor Green
    } else {
        Write-Host "✗ Backend API returned status code $($response.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "✗ Backend API is not accessible" -ForegroundColor Red
}

# Check IPFS health
Write-Host "`nChecking IPFS health..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5001/api/v0/version" -Method GET -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "✓ IPFS API is healthy" -ForegroundColor Green
    } else {
        Write-Host "✗ IPFS API returned status code $($response.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "✗ IPFS API is not accessible" -ForegroundColor Red
}

# Check Blockchain health
Write-Host "`nChecking Blockchain health..." -ForegroundColor Cyan
try {
    $body = @{
        jsonrpc = "2.0"
        method = "eth_blockNumber"
        params = @()
        id = 1
    } | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri "http://localhost:8545" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing -TimeoutSec 5
    $result = $response.Content | ConvertFrom-Json
    
    if ($result.result) {
        Write-Host "✓ Blockchain RPC is healthy (Block number: $($result.result))" -ForegroundColor Green
    } else {
        Write-Host "✗ Blockchain RPC returned an invalid response" -ForegroundColor Red
    }
} catch {
    Write-Host "✗ Blockchain RPC is not accessible" -ForegroundColor Red
}

# Check Redis health
Write-Host "`nChecking Redis health..." -ForegroundColor Cyan
try {
    $redisCheck = docker exec contriblock_redis redis-cli ping
    if ($redisCheck -eq "PONG") {
        Write-Host "✓ Redis is healthy" -ForegroundColor Green
    } else {
        Write-Host "✗ Redis returned an invalid response" -ForegroundColor Red
    }
} catch {
    Write-Host "✗ Redis is not accessible" -ForegroundColor Red
}

# Check PostgreSQL health
Write-Host "`nChecking PostgreSQL health..." -ForegroundColor Cyan
try {
    $pgCheck = docker exec contriblock_postgres pg_isready
    if ($pgCheck -match "accepting connections") {
        Write-Host "✓ PostgreSQL is healthy" -ForegroundColor Green
    } else {
        Write-Host "✗ PostgreSQL is not ready" -ForegroundColor Red
    }
} catch {
    Write-Host "✗ PostgreSQL is not accessible" -ForegroundColor Red
}

Write-Host "`n===== Health Check Complete =====" -ForegroundColor Green