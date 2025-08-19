FROM node:18-slim

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
RUN pip3 install web3 python-dotenv

# Compile contracts
RUN npx hardhat compile

# Set environment variables
ENV NODE_ENV=production

# Command to run deployment script
CMD ["python3", "script/deploy.py"]