# Deployment Guide: Private Cargo Tracking

## Table of Contents
1. [Deployment Overview](#deployment-overview)
2. [Prerequisites](#prerequisites)
3. [Local Testing](#local-testing)
4. [Sepolia Testnet Deployment](#sepolia-testnet-deployment)
5. [Frontend Deployment](#frontend-deployment)
6. [Verification and Testing](#verification-and-testing)
7. [Production Deployment](#production-deployment)

## Deployment Overview

### Deployment Environments

| Environment | Purpose | Network | Cost |
|------------|---------|---------|------|
| Local Node | Development testing | Hardhat | Free |
| Sepolia | Public testing | Ethereum Sepolia | Free (test ETH) |
| Mainnet | Production | Ethereum Mainnet | Real ETH |

### Current Status

**Current Deployment**:
- Network: Ethereum Sepolia Testnet
- Contract Address: `0x1846d67Dcf544B374D59F6d9a9adE4e37719D57A`
- Status: Verified and Active
- Frontend: Deployed on Vercel

## Prerequisites

### Required Tools

```bash
# Node.js and npm
node --version          # Should be >= 18.0.0
npm --version          # Should be >= 9.0.0

# Git for version control
git --version          # Should be >= 2.0.0

# Hardhat (install in project)
npm install --save-dev hardhat
```

### Required Accounts

1. **MetaMask Wallet**
   - Download: https://metamask.io/
   - Create account or import existing
   - Write down seed phrase securely

2. **Infura Account (for RPC)**
   - Sign up: https://infura.io/
   - Create project
   - Get API key

3. **Etherscan Account (for verification)**
   - Sign up: https://etherscan.io/
   - Get API key from settings

4. **Vercel Account (for frontend)**
   - Sign up: https://vercel.com/
   - Connect GitHub repository

## Local Testing

### Setup Local Node

```bash
# Start Hardhat local network
npx hardhat node

# Output:
# Accounts:
# 0x0000... (deployer)
# 0x0000... (account 1)
# ...
#
# WARNING: These accounts are public
```

### Deploy to Local Node

Create file: `scripts/deploy-local.js`

```javascript
const hre = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", await deployer.getBalance());

  // Deploy contract
  const PrivateCargoTracking = await ethers.getContractFactory(
    "PrivateCargoTracking"
  );

  console.log("Deploying contract...");
  const contract = await PrivateCargoTracking.deploy();
  await contract.deployed();

  console.log("✓ Contract deployed to:", contract.address);

  // Save for tests
  const fs = require('fs');
  fs.writeFileSync(
    'local-contract.json',
    JSON.stringify({
      address: contract.address,
      network: 'localhost',
      timestamp: new Date().toISOString()
    }, null, 2)
  );
}

main()
  .catch(error => {
    console.error(error);
    process.exitCode = 1;
  });
```

Deploy:
```bash
npx hardhat run scripts/deploy-local.js --network localhost
```

### Run Local Tests

```bash
# Run all tests
npx hardhat test

# Run with verbose output
npx hardhat test --verbose

# Run specific test file
npx hardhat test test/PrivateCargoTracking.test.ts

# Watch mode (re-run on changes)
npx hardhat test --watch
```

Expected output:
```
✓ Should create a single cargo successfully (123ms)
✓ Should reject cargo to self (45ms)
✓ Should grant authorization (234ms)
...

23 passing (2.1s)
```

## Sepolia Testnet Deployment

### Step 1: Get Test ETH

```bash
# Visit faucet
https://sepoliafaucet.com/

# Enter your wallet address
# Claim 0.5 ETH
# Wait for confirmation (usually instant)

# Verify in MetaMask
# You should see 0.5 ETH in Sepolia network
```

### Step 2: Configure Hardhat

Edit `hardhat.config.ts`:

```typescript
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  networks: {
    sepolia: {
      url: SEPOLIA_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 11155111,
    },
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
};

export default config;
```

### Step 3: Create Environment Variables

Create `.env` file (DO NOT COMMIT):

```env
# Infura RPC endpoint
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY

# Your wallet private key
PRIVATE_KEY=0x...

# Etherscan API for verification
ETHERSCAN_API_KEY=YOUR_ETHERSCAN_API_KEY
```

⚠️ **SECURITY WARNING**:
- Never commit `.env` file
- Add to `.gitignore`
- Keep private keys secret
- Use separate accounts for different networks

### Step 4: Deploy to Sepolia

Create `scripts/deploy-sepolia.js`:

```javascript
const hre = require("hardhat");

async function main() {
  console.log("Deploying to Sepolia...\n");

  const [deployer] = await ethers.getSigners();
  console.log("Deployer address:", deployer.address);

  // Check balance
  const balance = await deployer.getBalance();
  console.log("Account balance:", ethers.utils.formatEther(balance), "ETH");

  if (balance.lt(ethers.utils.parseEther("0.1"))) {
    console.error("❌ Insufficient balance for deployment");
    return;
  }

  // Deploy
  console.log("\n⏳ Deploying PrivateCargoTracking contract...");
  const PrivateCargoTracking = await ethers.getContractFactory(
    "PrivateCargoTracking"
  );

  const contract = await PrivateCargoTracking.deploy();
  await contract.deployed();

  console.log("✅ Contract deployed!");
  console.log("Address:", contract.address);
  console.log("Etherscan: https://sepolia.etherscan.io/address/" + contract.address);

  // Save deployment info
  const fs = require('fs');
  fs.writeFileSync(
    'deployment-sepolia.json',
    JSON.stringify({
      address: contract.address,
      network: 'sepolia',
      deployer: deployer.address,
      timestamp: new Date().toISOString(),
      transactionHash: contract.deployTransaction.hash
    }, null, 2)
  );

  console.log("\n⏳ Waiting for confirmation...");
  await contract.deployTransaction.wait(5);

  console.log("✅ Deployment confirmed!");

  // Verify on Etherscan
  console.log("\n⏳ Verifying contract on Etherscan...");
  try {
    await hre.run("verify:verify", {
      address: contract.address,
      constructorArguments: [],
    });
    console.log("✅ Contract verified on Etherscan!");
  } catch (error) {
    console.log("⚠️ Verification pending - verify manually later");
  }
}

main()
  .catch(error => {
    console.error(error);
    process.exitCode = 1;
  });
```

Deploy:
```bash
# Set environment variables
export SEPOLIA_RPC_URL="https://sepolia.infura.io/v3/YOUR_KEY"
export PRIVATE_KEY="0x..."
export ETHERSCAN_API_KEY="YOUR_KEY"

# Or on Windows:
set SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
set PRIVATE_KEY=0x...
set ETHERSCAN_API_KEY=YOUR_KEY

# Deploy
npx hardhat run scripts/deploy-sepolia.js --network sepolia
```

### Step 5: Verify Deployment

Visit Etherscan:
```
https://sepolia.etherscan.io/address/{CONTRACT_ADDRESS}
```

Check:
- ✓ Contract code visible
- ✓ Can call read functions
- ✓ Transaction history shows creation

## Frontend Deployment

### Step 1: Update Contract Address

Edit `index.html`:

```javascript
const CONTRACT_ADDRESS = "0x1846d67Dcf544B374D59F6d9a9adE4e37719D57A";
const CONTRACT_ABI = [/* ... */];  // From artifacts
```

### Step 2: Prepare for Production

```bash
# Test locally
npm run dev

# Build (if applicable)
npm run build

# Check all links work
npm test
```

### Step 3: Deploy to Vercel

Option A: GitHub Integration (Recommended)

```bash
# 1. Push to GitHub
git add .
git commit -m "Deploy to production"
git push origin main

# 2. Connect GitHub to Vercel
# Visit: https://vercel.com/new
# Select repository
# Deploy settings auto-detected
# Deploy!
```

Option B: Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod

# Output:
# > Ready on https://your-domain.vercel.app
```

### Step 4: Verify Frontend Deployment

1. **Open in Browser**
   ```
   https://privacy-cargo-tracking-fhe.vercel.app/
   ```

2. **Test Functionality**
   - Connect MetaMask
   - Verify Sepolia network
   - Create test cargo
   - Update location
   - Grant permissions

3. **Check Console**
   - No JavaScript errors
   - Network requests successful
   - MetaMask interactions working

## Verification and Testing

### Verify Contract on Etherscan

```bash
npx hardhat verify --network sepolia DEPLOYED_ADDRESS
```

### Test with Real Transactions

```javascript
const provider = new ethers.providers.JsonRpcProvider(
  "https://sepolia.infura.io/v3/YOUR_KEY"
);
const signer = new ethers.Wallet(PRIVATE_KEY, provider);

const contract = new ethers.Contract(
  CONTRACT_ADDRESS,
  CONTRACT_ABI,
  signer
);

// Test: Create cargo
const tx = await contract.createCargo(
  1000,
  2,
  50000,
  5,
  "0x742d35Cc6634C0532925a3b844Bc9e7595f42D0"
);

console.log("Transaction hash:", tx.hash);
const receipt = await tx.wait();
console.log("Cargo created:", receipt.events[0].args.cargoId);
```

### Monitor Gas Usage

Track transaction costs:
```
Transaction | Gas Used | Gas Price | Cost (ETH)
------------|----------|-----------|----------
Create      | 500,000  | 2 Gwei    | 0.001 ETH
Update      | 400,000  | 2 Gwei    | 0.0008 ETH
Grant Auth  | 150,000  | 2 Gwei    | 0.0003 ETH
```

## Production Deployment

### Pre-Production Checklist

- [ ] Contract compiled without errors
- [ ] All tests passing
- [ ] Deployed to Sepolia
- [ ] Verified on Etherscan
- [ ] Frontend tested on Sepolia
- [ ] Security audit completed
- [ ] Environment variables secured
- [ ] Monitoring setup
- [ ] Backup procedures documented
- [ ] Incident response plan ready

### Mainnet Deployment (When Ready)

⚠️ **CRITICAL CONSIDERATIONS**:

1. **Mainnet is Permanent**
   - No rollback possible
   - Real ETH required
   - Bugs are expensive

2. **Security Audit**
   - Professional security review
   - Vulnerability assessment
   - Code optimization

3. **Testing**
   - Extended Sepolia testing
   - Mainnet fork testing
   - Load testing
   - Edge case testing

#### Mainnet Deployment Steps

```bash
# 1. Prepare environment
export MAINNET_RPC_URL="https://eth-mainnet.alchemyapi.io/v2/YOUR_KEY"
export MAINNET_PRIVATE_KEY="0x..."

# 2. Final compilation check
npx hardhat compile

# 3. Deploy to mainnet
npx hardhat run scripts/deploy-mainnet.js --network mainnet

# 4. Verify immediately
npx hardhat verify --network mainnet DEPLOYED_ADDRESS

# 5. Update frontend
# Update CONTRACT_ADDRESS in index.html

# 6. Monitor
# Watch for any issues in first hour
# Check transaction history on Etherscan
```

### Monitoring and Maintenance

```javascript
// Monitor contract health
setInterval(async () => {
  const nextCargoId = await contract.nextCargoId();
  console.log("Total cargos:", nextCargoId - 1);

  // Log metrics
  metrics.totalCargos = nextCargoId - 1;
}, 3600000); // Every hour
```

### Rollback Plan

If issues discovered:

1. **Pause Frontend**
   - Update website with maintenance notice
   - Disable new cargo creation

2. **Inform Users**
   - Email notification
   - Dashboard message
   - Community announcements

3. **Investigate**
   - Analyze transaction logs
   - Review error events
   - Identify root cause

4. **Implement Fix**
   - Create patched version
   - Deploy to Sepolia first
   - Re-test thoroughly
   - Deploy to mainnet

5. **Communicate Resolution**
   - Update status page
   - Explain issue and fix
   - Restore service

## Troubleshooting Deployment

| Issue | Cause | Solution |
|-------|-------|----------|
| "insufficient funds" | Not enough ETH | Get more from faucet |
| "invalid RPC endpoint" | Wrong URL | Verify Infura/Alchemy key |
| "private key error" | Malformed key | Check format (0x...) |
| "revert" during deploy | Contract error | Check for missing imports |
| "verification failed" | Etherscan busy | Retry after few minutes |
| "contract not found" | Wrong network | Check you're on Sepolia |

---

**Last Updated**: December 2025
**Current Network**: Ethereum Sepolia
**Recommended Gas Price**: 2-5 Gwei
