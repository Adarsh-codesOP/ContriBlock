#!/bin/bash

# Change to the backend directory
cd "$(dirname "$0")"

# Check if pytest is installed
python -c "import pytest" 2>/dev/null
if [ $? -ne 0 ]; then
    echo "Installing pytest..."
    python -m pip install pytest pytest-cov
fi

# Run the tests with coverage report
echo "Running tests with coverage report..."
python -m pytest tests/ -v --cov=app --cov-report=term-missing

# Check if tests passed
if [ $? -eq 0 ]; then
    echo -e "\e[32mAll tests passed successfully!\e[0m"
else
    echo -e "\e[31mSome tests failed. Please check the output above for details.\e[0m"
fi