# ContriBlock Technical Documentation

## Table of Contents
1. [System Architecture](#system-architecture)
2. [Data Flow](#data-flow)
3. [System Components](#system-components)
4. [Development Setup](#development-setup)
5. [Deployment Guide](#deployment-guide)
6. [Runtime Operations](#runtime-operations)

## System Architecture

### Overview
ContriBlock is a full-stack decentralized application (dApp) with the following components:

- **Frontend**: React-based SPA using Material-UI
- **Backend**: FastAPI Python server
- **Smart Contracts**: Solidity contracts on Ethereum
- **Database**: SQL database (configured via DATABASE_URL)
- **Cache**: Redis for performance optimization

### Component Interaction
```mermaid
graph TD
    A[Frontend - React] --> B[Backend - FastAPI]
    B --> C[Database]
    B --> D[Redis Cache]
    A --> E[Smart Contracts]
    B --> E
```

## Data Flow

### Authentication Flow
1. User connects wallet (MetaMask)
2. Backend validates wallet signature
3. JWT token issued for API authentication
4. Protected routes enforce authentication

### Contribution Flow
1. User submits contribution
2. Backend validates and stores data
3. Verifiers review submission
4. Smart contract handles token distribution
5. Impact metrics updated

## System Components

### Frontend Architecture
- **State Management**: React Context API
- **Routing**: React Router with protected routes
- **API Integration**: Axios-based service layer
- **UI Framework**: Material-UI (MUI)

### Backend Architecture
- **API Framework**: FastAPI
- **Database ORM**: SQLAlchemy
- **Authentication**: JWT + Web3
- **Caching**: Redis

### Smart Contracts
- **Token Contract**: ERC20 implementation
- **Controller Contract**: Manages token distribution
- **Deployment**: Hardhat framework

## Development Setup

### Prerequisites
- Node.js (v16+)
- Python (v3.8+)
- Docker & Docker Compose
- MetaMask wallet

### Environment Configuration
1. Create `.env` file from `.env.example`
2. Configure required environment variables:
   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/contriblock
   REDIS_URL=redis://localhost:6379
   JWT_SECRET=your-secret-key
   WEB3_RPC_URL=your-ethereum-rpc-url
   ```

### Local Development
1. Frontend Setup:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

2. Backend Setup:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # or .\venv\Scripts\activate on Windows
   pip install -r requirements.txt
   uvicorn app.main:app --reload
   ```

3. Smart Contracts:
   ```bash
   cd contracts
   npm install
   npx hardhat compile
   npx hardhat test
   ```

## Deployment Guide

### Production Deployment
1. Build Frontend:
   ```bash
   cd frontend
   npm run build
   ```

2. Deploy Backend:
   ```bash
   # Using Docker
   docker-compose up -d
   ```

3. Deploy Smart Contracts:
   ```bash
   cd contracts
   npx hardhat run scripts/deploy.py --network mainnet
   ```

### Configuration Files
- `docker-compose.yml`: Container orchestration
- `hardhat.config.ts`: Smart contract deployment
- `nginx.conf`: Production web server

## Runtime Operations

### Monitoring
- Frontend: Browser DevTools
- Backend: FastAPI logs
- Smart Contracts: Etherscan

### Common Operations
1. Database Migrations:
   ```bash
   alembic upgrade head
   ```

2. Cache Management:
   ```bash
   # Clear Redis cache
   redis-cli FLUSHALL
   ```

3. Contract Verification:
   ```bash
   npx hardhat verify --network mainnet <contract-address>
   ```

### Security Considerations
- JWT token expiration
- Web3 signature validation
- Rate limiting on API endpoints
- Smart contract access controls

### Error Handling
- Frontend error boundaries
- Backend exception handlers
- Smart contract fallback functions

### Performance Optimization
- Redis caching for frequent queries
- Frontend code splitting
- Smart contract gas optimization

### Backup and Recovery
1. Database Backup:
   ```bash
   pg_dump -U postgres contriblock > backup.sql
   ```

2. Environment Recovery:
   ```bash
   # Restore database
   psql -U postgres contriblock < backup.sql
   
   # Rebuild containers
   docker-compose up --build -d
   ```