# ContriBlock

A Blockchain Based Contribution Mining And Exchange Platform that allows users to submit contributions, get them verified, earn tokens based on impact, and trade premium content.

## Architecture

ContriBlock consists of the following components:

- **Backend API**: FastAPI application that handles API requests and business logic
- **Database**: PostgreSQL for storing application data
- **Redis**: For rate limiting and caching
- **IPFS**: For storing contribution files and content
- **Blockchain**: Ethereum-compatible blockchain for smart contracts
- **Smart Contracts**: ContriToken (ERC20) and Controller for managing contributions and tokens

## Prerequisites

- Docker and Docker Compose
- Git

## Setup

1. Clone the repository:

```bash
git clone https://github.com/yourusername/contriblock.git
cd contriblock
```

2. Create a `.env` file based on the example:

```bash
cp .env.example .env
```

3. Edit the `.env` file and set your own values for the environment variables.

4. Build and start the Docker containers:

```bash
docker-compose up -d
```

5. The smart contracts will be automatically deployed to the local blockchain. The contract addresses will be saved to `contracts/deployed_addresses.json`.

6. Update your `.env` file with the deployed contract addresses.

## Services

After starting the Docker containers, the following services will be available:

- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs
- IPFS Gateway: http://localhost:8080
- IPFS API: http://localhost:5001
- Blockchain RPC: http://localhost:8545

## Development

### Backend

The backend code is located in the `backend` directory. It's a FastAPI application with the following structure:

- `app/api`: API endpoints
- `app/core`: Core functionality (config, security, dependencies)
- `app/db`: Database models and schemas
- `app/services`: External services integration (IPFS, Web3)

### Smart Contracts

The smart contracts are located in the `contracts` directory. They're written in Solidity and use Hardhat for development and deployment.

- `src`: Smart contract source code
- `script`: Deployment scripts
