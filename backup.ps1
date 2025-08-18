# ContriBlock Backup Script for Windows
# This script creates backups of the database and other important data

$ErrorActionPreference = "Stop"  # Stop on first error

# Create backup directory if it doesn't exist
$backupDir = "./backups"
if (-not (Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir | Out-Null
}

# Get current timestamp for backup files
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"

Write-Host "===== ContriBlock Backup Script =====" -ForegroundColor Green
Write-Host "Creating backup with timestamp: $timestamp" -ForegroundColor Cyan

# Backup PostgreSQL database
Write-Host "Backing up PostgreSQL database..." -ForegroundColor Cyan
try {
    docker exec contriblock_postgres pg_dump -U postgres -d contriblock > "$backupDir/contriblock_db_$timestamp.sql"
    Write-Host "✓ Database backup created: $backupDir/contriblock_db_$timestamp.sql" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed to backup PostgreSQL database: $_" -ForegroundColor Red
}

# Backup .env file
Write-Host "Backing up .env file..." -ForegroundColor Cyan
try {
    Copy-Item ".env" "$backupDir/env_$timestamp.txt"
    Write-Host "✓ .env backup created: $backupDir/env_$timestamp.txt" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed to backup .env file: $_" -ForegroundColor Red
}

# Backup smart contract addresses
Write-Host "Backing up smart contract addresses..." -ForegroundColor Cyan
try {
    if (Test-Path "./contracts/deployed_addresses.json") {
        Copy-Item "./contracts/deployed_addresses.json" "$backupDir/deployed_addresses_$timestamp.json"
        Write-Host "✓ Contract addresses backup created: $backupDir/deployed_addresses_$timestamp.json" -ForegroundColor Green
    } else {
        Write-Host "✗ deployed_addresses.json not found" -ForegroundColor Yellow
    }
} catch {
    Write-Host "✗ Failed to backup contract addresses: $_" -ForegroundColor Red
}

# Create a compressed backup archive
Write-Host "Creating compressed backup archive..." -ForegroundColor Cyan
try {
    Compress-Archive -Path "$backupDir/*_$timestamp*" -DestinationPath "$backupDir/contriblock_backup_$timestamp.zip"
    Write-Host "✓ Compressed backup created: $backupDir/contriblock_backup_$timestamp.zip" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed to create compressed backup: $_" -ForegroundColor Red
}

Write-Host "`n===== Backup Complete =====" -ForegroundColor Green
Write-Host "Backup files are stored in the $backupDir directory." -ForegroundColor White
Write-Host "Full backup archive: $backupDir/contriblock_backup_$timestamp.zip" -ForegroundColor White