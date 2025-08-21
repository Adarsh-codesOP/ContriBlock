FROM node:20-slim

WORKDIR /app

# Install Python for deployment script
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

# Install Hardhat and other dependencies
COPY package*.json ./
RUN npm install

# Copy contract source code and scripts
COPY . .

# Install Python dependencies for deployment script
RUN pip3 install web3 python-dotenv --break-system-packages

# Compile contracts
RUN mkdir -p artifacts cache && chmod -R 777 . && npx hardhat compile --force

# Create directories for artifacts if they don't exist
RUN mkdir -p /app/artifacts/contracts/ContriToken.sol /app/artifacts/contracts/Controller.sol

# Copy specific contract artifacts to their expected locations
RUN cp -v /app/artifacts/contracts/ContriToken.sol/ContriToken.json /app/artifacts/contracts/ContriToken.sol/ || echo "ContriToken.json not found"
RUN cp -v /app/artifacts/contracts/Controller.sol/Controller.json /app/artifacts/contracts/Controller.sol/ || echo "Controller.json not found"

# List artifacts to verify they exist
RUN ls -la /app/artifacts/contracts/ContriToken.sol/ || echo "ContriToken directory empty"
RUN ls -la /app/artifacts/contracts/Controller.sol/ || echo "Controller directory empty"

# Set environment variables
ENV NODE_ENV=production

# Command to run deployment script
CMD ["python3", "script/deploy.py"]