# PowerShell script to run tests for the ContriBlock backend

# Change to the backend directory
Set-Location -Path "$PSScriptRoot"

# Check if pytest is installed
$pythonCmd = "python"
try {
    & $pythonCmd -c "import pytest" 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Installing pytest..."
        & $pythonCmd -m pip install pytest pytest-cov
    }
} catch {
    Write-Host "Error checking for pytest. Make sure Python is installed and in your PATH."
    exit 1
}

# Run the tests with coverage report
Write-Host "Running tests with coverage report..."
& $pythonCmd -m pytest tests/ -v --cov=app --cov-report=term-missing

# Check if tests passed
if ($LASTEXITCODE -eq 0) {
    Write-Host "All tests passed successfully!" -ForegroundColor Green
} else {
    Write-Host "Some tests failed. Please check the output above for details." -ForegroundColor Red
}