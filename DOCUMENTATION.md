# ContriBlock Platform Documentation

## Table of Contents

1. [Introduction](#introduction)
2. [Architecture Overview](#architecture-overview)
3. [Setup and Installation](#setup-and-installation)
4. [API Reference](#api-reference)
5. [Smart Contracts](#smart-contracts)
6. [Deployment](#deployment)
7. [Maintenance](#maintenance)
8. [Troubleshooting](#troubleshooting)

## Introduction

ContriBlock is a blockchain-based platform for tracking and verifying social impact contributions. It allows users to submit impact projects, get them verified, and receive tokens as rewards. These tokens can be used in the marketplace to purchase goods and services.

### Key Features

- **Decentralized Verification**: Contributions are verified by trusted verifiers
- **Tokenized Impact**: Verified impact is rewarded with ContriTokens
- **Transparent Tracking**: All contributions and impact records are stored on the blockchain
- **Marketplace**: Users can spend their tokens on goods and services
- **IPFS Integration**: Evidence and documentation are stored on IPFS for decentralized access

## Architecture Overview

ContriBlock consists of the following components:

### Backend API (FastAPI)

The backend API handles all the business logic, database operations, and interaction with the blockchain and IPFS. It's built with FastAPI, a modern Python web framework.

### Database (PostgreSQL)

PostgreSQL stores all the application data, including users, contributions, impact records, and marketplace items.

### Caching (Redis)

Redis is used for caching and storing temporary data like authentication nonces.

### Storage (IPFS)

IPFS (InterPlanetary File System) stores all the files and evidence related to contributions and impact records.

### Blockchain (Ethereum)

The Ethereum blockchain is used to store the immutable record of contributions, impact, and token transactions.

### Smart Contracts

- **ContriToken**: An ERC20 token that represents impact value
- **Controller**: Manages the registration of contributions and distribution of tokens

## Setup and Installation

### Prerequisites

- Docker and Docker Compose
- Git

### Installation Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/contriblock.git
   cd contriblock
   ```

2. Create a `.env` file from the example:
   ```bash
   cp .env.example .env
   ```

3. Edit the `.env` file with your configuration.

4. Start the application using Docker Compose:
   ```bash
   # For Linux/macOS
   ./deploy.sh
   
   # For Windows
   .\deploy.ps1
   ```

5. Check the health of the services:
   ```bash
   # For Windows
   .\check_health.ps1
   ```

## API Reference

### Authentication

#### Get Nonce

```
POST /api/v1/auth/nonce
```

Request body:
```json
{
  "wallet": "0x..."
}
```

Response:
```json
{
  "nonce": "random-nonce-string"
}
```

#### Verify Signature

```
POST /api/v1/auth/verify
```

Request body:
```json
{
  "wallet": "0x...",
  "message": "siwe-message-with-nonce",
  "signature": "0x..."
}
```

Response:
```json
{
  "id": 1,
  "wallet": "0x...",
  "role": "USER",
  "kyc_status": "PENDING",
  "name": null,
  "email": null,
  "reputation": 0,
  "created_at": "2023-01-01T00:00:00",
  "access_token": "jwt-token",
  "token_type": "bearer"
}
```

### Users

#### Get Current User

```
GET /api/v1/users/me
```

Response:
```json
{
  "id": 1,
  "wallet": "0x...",
  "role": "USER",
  "kyc_status": "PENDING",
  "name": "John Doe",
  "email": "john@example.com",
  "reputation": 0,
  "created_at": "2023-01-01T00:00:00"
}
```

#### Update User Info

```
PUT /api/v1/users/me
```

Request body:
```json
{
  "name": "John Doe",
  "email": "john@example.com"
}
```

### Sectors

#### Get All Sectors

```
GET /api/v1/sectors
```

Response:
```json
[
  {
    "id": 1,
    "name": "Education",
    "description": "Educational initiatives",
    "created_at": "2023-01-01T00:00:00"
  },
  {
    "id": 2,
    "name": "Healthcare",
    "description": "Healthcare initiatives",
    "created_at": "2023-01-01T00:00:00"
  }
]
```

### Contributions

#### Create Contribution

```
POST /api/v1/contrib
```

Request (multipart/form-data):
- `title`: string
- `description`: string
- `sector_id`: integer
- `target_amount`: float
- `file`: file upload

Response:
```json
{
  "id": 1,
  "title": "Clean Water Project",
  "description": "Providing clean water to rural areas",
  "sector_id": 3,
  "user_id": 1,
  "target_amount": 1000.0,
  "status": "PENDING",
  "rejection_reason": null,
  "created_at": "2023-01-01T00:00:00",
  "metadata": {
    "id": 1,
    "contribution_id": 1,
    "ipfs_hash": "Qm...",
    "file_name": "proposal.pdf",
    "file_type": "application/pdf",
    "created_at": "2023-01-01T00:00:00"
  }
}
```

#### Get Contribution

```
GET /api/v1/contrib/{contribution_id}
```

### Verification

#### Get Pending Verifications

```
GET /api/v1/verify/pending
```

#### Approve Contribution

```
POST /api/v1/verify/{contribution_id}/approve
```

#### Reject Contribution

```
POST /api/v1/verify/{contribution_id}/reject
```

Request body:
```json
{
  "reason": "Insufficient documentation"
}
```

### Impact

#### Create Impact Record

```
POST /api/v1/impact
```

Request (multipart/form-data):
- `contribution_id`: integer
- `description`: string
- `impact_value`: float
- `file`: file upload

#### Verify Impact Record

```
POST /api/v1/impact/{impact_id}/verify
```

Request body:
```json
{
  "token_amount": 100.0
}
```

### Marketplace

#### Get Marketplace Items

```
GET /api/v1/market/items
```

#### Purchase Item

```
POST /api/v1/market/purchase
```

Request body:
```json
{
  "item_id": 1,
  "quantity": 1
}
```

## Smart Contracts

### ContriToken

The ContriToken is an ERC20 token that represents impact value. It can be earned by creating verified impact and spent in the marketplace.

#### Key Functions

- `mint(address to, uint256 amount)`: Mints new tokens to the specified address
- `burn(uint256 amount)`: Burns tokens from the sender's address
- `transfer(address to, uint256 amount)`: Transfers tokens to another address

### Controller

The Controller manages the registration of contributions and distribution of tokens.

#### Key Functions

- `registerContribution(uint256 id, address contributor, uint256 amount)`: Registers a new contribution
- `distributeTokens(address to, uint256 amount, uint256 impactId)`: Distributes tokens for verified impact
- `processPurchase(address from, uint256 amount, uint256 purchaseId)`: Processes a marketplace purchase

## Deployment

### Production Deployment

For production deployment, follow these steps:

1. Set up a server with Docker and Docker Compose installed
2. Clone the repository and configure the `.env` file for production
3. Run the deployment script:
   ```bash
   # For Linux/macOS
   ./deploy.sh
   
   # For Windows
   .\deploy.ps1
   ```

### Backup and Restore

#### Creating a Backup

To create a backup of the database and configuration:

```bash
# For Windows
.\backup.ps1
```

This will create a backup in the `backups` directory.

#### Restoring from a Backup

To restore from a backup:

```bash
# For Windows
.\restore.ps1
```

Follow the prompts to select and restore a backup.

## Maintenance

### Monitoring

You can monitor the health of the services using the health check script:

```bash
# For Windows
.\check_health.ps1
```

### Logs

To view the logs of the services:

```bash
docker-compose logs -f [service_name]
```

Where `[service_name]` can be one of: `backend`, `postgres`, `redis`, `ipfs`, `ganache`, or `contracts`.

### Updating

To update the application:

1. Pull the latest changes from the repository
2. Run the deployment script again

## Troubleshooting

### Common Issues

#### Services Not Starting

If some services fail to start, check the logs:

```bash
docker-compose logs [service_name]
```

#### Database Connection Issues

If the backend can't connect to the database, check the `DATABASE_URL` in the `.env` file and make sure the PostgreSQL container is running.

#### Smart Contract Deployment Failures

If the smart contracts fail to deploy, check the logs of the `contracts` service:

```bash
docker-compose logs contracts
```

#### IPFS Connection Issues

If the backend can't connect to IPFS, check the `IPFS_API_URL` in the `.env` file and make sure the IPFS container is running.

---

For more information or support, please contact the ContriBlock team.





to run the frontend 

cd frontend; npm run dev

to run the backend

//cd backend; uvicorn main:app --host 0.0.0.0 --port 8000
docker-compose up -d backend postgres redis ipfs blockchain 
cd backend && python -m pip install -r requirements.txt 
cd backend; python -m pip install -r requirements.txt 
cd backend; python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload 
