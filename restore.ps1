# ContriBlock Restore Script for Windows
# This script restores the database and other important data from a backup

$ErrorActionPreference = "Stop"  # Stop on first error

Write-Host "===== ContriBlock Restore Script =====" -ForegroundColor Green

# Check if backup directory exists
$backupDir = "./backups"
if (-not (Test-Path $backupDir)) {
    Write-Host "Error: Backup directory not found." -ForegroundColor Red
    exit 1
}

# List available backups
Write-Host "Available backup archives:" -ForegroundColor Cyan
$backups = Get-ChildItem -Path $backupDir -Filter "contriblock_backup_*.zip" | Sort-Object LastWriteTime -Descending

if ($backups.Count -eq 0) {
    Write-Host "No backup archives found in $backupDir" -ForegroundColor Red
    exit 1
}

for ($i = 0; $i -lt $backups.Count; $i++) {
    Write-Host "[$i] $($backups[$i].Name) - $($backups[$i].LastWriteTime)" -ForegroundColor White
}

# Ask user to select a backup
$selection = Read-Host "Enter the number of the backup to restore (or 'q' to quit)"

if ($selection -eq 'q') {
    Write-Host "Restore cancelled." -ForegroundColor Yellow
    exit 0
}

$selectedBackup = $backups[$selection]
if (-not $selectedBackup) {
    Write-Host "Invalid selection." -ForegroundColor Red
    exit 1
}

Write-Host "Selected backup: $($selectedBackup.Name)" -ForegroundColor Green

# Extract the backup archive to a temporary directory
$tempDir = "$backupDir/temp_restore_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
Write-Host "Extracting backup to temporary directory..." -ForegroundColor Cyan
try {
    Expand-Archive -Path $selectedBackup.FullName -DestinationPath $tempDir
    Write-Host "✓ Backup extracted" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed to extract backup: $_" -ForegroundColor Red
    exit 1
}

# Get the extracted files
$dbBackup = Get-ChildItem -Path $tempDir -Filter "contriblock_db_*.sql" | Select-Object -First 1
$envBackup = Get-ChildItem -Path $tempDir -Filter "env_*.txt" | Select-Object -First 1
$contractsBackup = Get-ChildItem -Path $tempDir -Filter "deployed_addresses_*.json" | Select-Object -First 1

# Confirm restore
Write-Host "`nReady to restore the following:" -ForegroundColor Cyan
Write-Host "Database: $($dbBackup.Name)" -ForegroundColor White
Write-Host "Environment: $($envBackup.Name)" -ForegroundColor White
if ($contractsBackup) {
    Write-Host "Contract Addresses: $($contractsBackup.Name)" -ForegroundColor White
}

$confirm = Read-Host "Are you sure you want to proceed with the restore? (y/n)"
if ($confirm -ne 'y') {
    Write-Host "Restore cancelled." -ForegroundColor Yellow
    Remove-Item -Path $tempDir -Recurse -Force
    exit 0
}

# Stop running containers
Write-Host "`nStopping running containers..." -ForegroundColor Cyan
docker-compose down
Write-Host "✓ Containers stopped" -ForegroundColor Green

# Restore .env file
if ($envBackup) {
    Write-Host "Restoring .env file..." -ForegroundColor Cyan
    try {
        Copy-Item $envBackup.FullName ".env" -Force
        Write-Host "✓ .env file restored" -ForegroundColor Green
    } catch {
        Write-Host "✗ Failed to restore .env file: $_" -ForegroundColor Red
    }
}

# Restore contract addresses
if ($contractsBackup) {
    Write-Host "Restoring contract addresses..." -ForegroundColor Cyan
    try {
        if (-not (Test-Path "./contracts")) {
            New-Item -ItemType Directory -Path "./contracts" | Out-Null
        }
        Copy-Item $contractsBackup.FullName "./contracts/deployed_addresses.json" -Force
        Write-Host "✓ Contract addresses restored" -ForegroundColor Green
    } catch {
        Write-Host "✗ Failed to restore contract addresses: $_" -ForegroundColor Red
    }
}

# Start the PostgreSQL container only
Write-Host "Starting PostgreSQL container..." -ForegroundColor Cyan
docker-compose up -d postgres
Write-Host "Waiting for PostgreSQL to start..." -ForegroundColor Cyan
Start-Sleep -Seconds 10

# Restore database
if ($dbBackup) {
    Write-Host "Restoring database..." -ForegroundColor Cyan
    try {
        # Drop existing database
        docker exec contriblock_postgres psql -U postgres -c "DROP DATABASE IF EXISTS contriblock;"
        # Create fresh database
        docker exec contriblock_postgres psql -U postgres -c "CREATE DATABASE contriblock;"
        # Restore from backup
        Get-Content $dbBackup.FullName | docker exec -i contriblock_postgres psql -U postgres -d contriblock
        Write-Host "✓ Database restored" -ForegroundColor Green
    } catch {
        Write-Host "✗ Failed to restore database: $_" -ForegroundColor Red
    }
}

# Clean up temporary directory
Write-Host "Cleaning up temporary files..." -ForegroundColor Cyan
Remove-Item -Path $tempDir -Recurse -Force
Write-Host "✓ Temporary files removed" -ForegroundColor Green

# Start all containers
Write-Host "Starting all containers..." -ForegroundColor Cyan
docker-compose up -d
Write-Host "✓ Containers started" -ForegroundColor Green

Write-Host "`n===== Restore Complete =====" -ForegroundColor Green
Write-Host "The ContriBlock platform has been restored from backup." -ForegroundColor White
Write-Host "Please check the system health with ./check_health.ps1" -ForegroundColor White