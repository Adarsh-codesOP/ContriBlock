#!/usr/bin/env python3

import os
import json
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Path to the .env file
env_file = Path("../../.env")

# Path to the deployed addresses file
addresses_file = Path("../deployed_addresses.json")

# Check if the deployed addresses file exists
if not addresses_file.exists():
    print("Deployed addresses file not found")
    exit(1)

# Load the deployed addresses
with open(addresses_file) as f:
    addresses = json.load(f)

# Check if the .env file exists
if not env_file.exists():
    print(".env file not found")
    exit(1)

# Read the .env file
with open(env_file) as f:
    env_lines = f.readlines()

# Update the environment variables
updated_lines = []
token_updated = False
controller_updated = False

for line in env_lines:
    if line.startswith("TOKEN_ADDRESS="):
        updated_lines.append(f"TOKEN_ADDRESS={addresses.get('token')}\n")
        token_updated = True
    elif line.startswith("CONTROLLER_ADDRESS="):
        updated_lines.append(f"CONTROLLER_ADDRESS={addresses.get('controller')}\n")
        controller_updated = True
    else:
        updated_lines.append(line)

# Add the variables if they don't exist
if not token_updated:
    updated_lines.append(f"TOKEN_ADDRESS={addresses.get('token')}\n")
if not controller_updated:
    updated_lines.append(f"CONTROLLER_ADDRESS={addresses.get('controller')}\n")

# Write the updated .env file
with open(env_file, "w") as f:
    f.writelines(updated_lines)

print("Environment variables updated successfully")