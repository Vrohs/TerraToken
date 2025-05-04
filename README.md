# TerraToken: Carbon Credit Trading Platform

TerraToken is a blockchain-based platform that allows people to buy and sell carbon credits (certificates representing reduced carbon emissions) using both traditional web technology and blockchain to ensure transactions are transparent and trustworthy.

## Why It Matters

Companies need carbon credits to offset emissions, but current markets lack transparency. Our platform solves this by recording all transactions on a blockchain where they cannot be altered.

## Simplified Demo Setup Guide

For a quick and easy demo setup, use our simplified script:

```bash
# Make the script executable
chmod +x setup-demo-simple.js

# Run the simplified setup
node setup-demo-simple.js
```

This will guide you through:
1. Starting a local Ethereum blockchain
2. Compiling and deploying smart contracts
3. Generating demo data
4. Starting the application

### Manual Setup

If you prefer to set up manually, follow these steps:

#### 1. Install Dependencies

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd frontend/project && npm install
```

#### 2. Configure Environment

```bash
# Copy sample .env file
cp backend/.env.example backend/.env
```

#### 3. Compile Smart Contracts

```bash
npx hardhat compile
```

#### 4. Deploy Contracts Locally

```bash
# Start a local Hardhat node
npx hardhat node

# In a new terminal, deploy contracts
npx hardhat run scripts/deploy.js --network localhost
```

#### 5. Generate Demo Data

```bash
cd backend
node src/utils/demo-data.js
```

#### 6. Start the Application

```bash
# Start the backend server
cd backend
npm start

# In a new terminal, start the frontend
cd frontend/project
npm run dev
```

## Demo Accounts

For demonstration purposes, the following accounts are available:

1. **Project Developer**
   - Email: developer@terratoken.com
   - Password: password123
   - Wallet: 0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266 (Hardhat #0)

2. **Verifier**
   - Email: verifier@terratoken.com
   - Password: password123
   - Wallet: 0x70997970c51812dc3a010c7d01b50e0d17dc79c8 (Hardhat #1)

3. **Trader**
   - Email: trader@terratoken.com
   - Password: password123
   - Wallet: 0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc (Hardhat #2)

## Demo Flow

1. **Project Registration**:
   - Login as Project Developer
   - Submit a new carbon reduction project
   - Upload project documentation

2. **Project Verification**:
   - Login as Verifier
   - Review submitted project
   - Approve project and issue carbon credits

3. **Marketplace Trading**:
   - Login as Trader
   - Browse available carbon credits
   - Purchase credits from the marketplace

4. **Credit Retirement**:
   - Login as Trader
   - Retire carbon credits to offset emissions

## For Developers

### Smart Contracts

The platform uses three main smart contracts:

1. **CarbonCredit.sol**: ERC-721 token representing carbon credits
2. **Verification.sol**: Manages project verification and credit issuance
3. **CarbonCreditMarket.sol**: Handles marketplace listings and purchases

### Testing

```bash
# Run smart contract tests
npx hardhat test

# Run backend tests
cd backend && npm test
```

## Contact

For questions or support with this demo, please contact the team at info@terratoken.com.




















