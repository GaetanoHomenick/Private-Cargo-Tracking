# Developer Guide: Private Cargo Tracking

## 1. Development Environment Setup

### 1.1 Prerequisites

- **Node.js**: Version 18.0.0 or higher
- **npm**: Version 9.0.0 or higher
- **Git**: For version control
- **MetaMask**: Browser extension for testing
- **Code Editor**: VSCode recommended

### 1.2 Repository Cloning

```bash
git clone https://github.com/GaetanoHomenick/PrivacyCargoTracking_FHE.git
cd PrivateCargoTracking
```

### 1.3 Dependency Installation

```bash
npm install
```

**Key Dependencies**:
- `@fhevm/solidity`: FHEVM library for encrypted operations
- `ethers`: Web3 interaction library
- `http-server`: Local development server

### 1.4 Network Configuration

#### Add Sepolia to MetaMask

1. Open MetaMask
2. Click "Add Network"
3. Enter:
   - Network Name: Sepolia
   - RPC URL: `https://sepolia.infura.io/v3/YOUR_KEY`
   - Chain ID: `11155111`
   - Currency: ETH
   - Block Explorer: `https://sepolia.etherscan.io`

#### Obtain Test ETH

Visit faucet: https://sepoliafaucet.com/

Request ~0.5 ETH for testing

## 2. Project Structure

```
PrivateCargoTracking/
├── contracts/
│   └── PrivateCargoTracking.sol       # Main smart contract
├── test/
│   └── (test files go here)           # Hardhat test suite
├── scripts/
│   └── deploy.js                      # Deployment script
├── index.html                         # Web interface
├── package.json                       # Project metadata
├── hardhat.config.ts                  # Hardhat configuration
└── tsconfig.json                      # TypeScript configuration
```

### 2.1 Smart Contract Directory

**File**: `contracts/PrivateCargoTracking.sol`

- **Size**: ~367 lines
- **FHEVM Integration**: Yes (FHE and SepoliaConfig imports)
- **Compile Target**: EVM compatible with FHEVM extensions

### 2.2 Frontend Directory

**File**: `index.html`

- **Type**: Static HTML5 application
- **Purpose**: User dashboard for cargo management
- **Integration**: Direct Web3.js/ethers.js to smart contract
- **Features**: MetaMask connection, cargo creation form, tracking UI

## 3. Smart Contract Compilation

### 3.1 Hardhat Compilation

```bash
npx hardhat compile
```

**Output**:
- Compiled ABI in artifacts/
- Bytecode for deployment
- Type definitions (if TypeScript)

### 3.2 Compilation Errors

#### Common Issue: FHEVM Import Errors

**Error Message**:
```
Unable to resolve source specification of @fhevm/solidity
```

**Solution**:
```bash
npm install @fhevm/solidity --save-dev
```

#### Version Compatibility

Ensure Solidity version matches in hardhat.config:
```javascript
{
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  }
}
```

## 4. Contract Deployment

### 4.1 Manual Deployment via Script

**File**: `scripts/deploy.js`

```javascript
const hre = require("hardhat");

async function main() {
  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  // Deploy contract
  const PrivateCargoTracking = await ethers.getContractFactory("PrivateCargoTracking");
  const contract = await PrivateCargoTracking.deploy();
  await contract.deployed();

  console.log("Contract deployed to:", contract.address);

  // Save address to file
  const fs = require('fs');
  fs.writeFileSync(
    'contract-address.json',
    JSON.stringify({ address: contract.address }, null, 2)
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

### 4.2 Deployment Command

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

### 4.3 Deployment Verification

1. **Check Gas Usage**: Note gas spent
2. **Verify Address**: Save contract address
3. **Block Explorer**: Visit Etherscan Sepolia with address
4. **Update Frontend**: Update ABI and address in UI

## 5. Interacting with the Contract

### 5.1 Web3.js Integration Pattern

```javascript
// Connect to provider
const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();

// Load contract
const contractABI = [...]; // Import from artifacts
const contractAddress = "0x1846d67...";
const contract = new ethers.Contract(contractAddress, contractABI, signer);

// Call function
const cargoId = await contract.createCargo(
  1000,      // weight
  2,         // category
  50000,     // value
  5,         // priority
  receiverAddress
);
```

### 5.2 Key Function Patterns

#### Create Cargo
```javascript
const tx = await contract.createCargo(
  weight,
  category,
  value,
  priority,
  receiverAddress
);
const receipt = await tx.wait();
const cargoId = receipt.events[0].args.cargoId;
```

#### Update Location
```javascript
const tx = await contract.updateLocation(
  cargoId,
  latitude,
  longitude,
  status
);
await tx.wait();
```

#### Grant Authorization
```javascript
const expirationTime = Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60); // 7 days

const tx = await contract.grantAuthorization(
  cargoId,
  thirdPartyAddress,
  true,   // canView
  true,   // canTrack
  false,  // canUpdate
  expirationTime
);
await tx.wait();
```

#### Check Authorization
```javascript
const auth = await contract.checkAuthorization(cargoId, userAddress);
console.log({
  canView: auth.canView,
  canTrack: auth.canTrack,
  canUpdate: auth.canUpdate,
  expiresAt: auth.expiresAt.toString(),
  isExpired: auth.isExpired
});
```

### 5.3 Error Handling

```javascript
try {
  const tx = await contract.updateLocation(
    cargoId,
    latitude,
    longitude,
    status
  );
  await tx.wait();
} catch (error) {
  if (error.reason === "Not authorized for this action") {
    console.error("User lacks update permissions");
  } else if (error.reason === "Cargo does not exist") {
    console.error("Invalid cargo ID");
  } else {
    console.error("Transaction failed:", error.message);
  }
}
```

## 6. Testing

### 6.1 Setting Up Tests

Create test file: `test/PrivateCargoTracking.test.ts`

```typescript
import { expect } from "chai";
import { ethers } from "hardhat";

describe("PrivateCargoTracking", function () {
  let contract;
  let shipper;
  let receiver;
  let thirdParty;

  beforeEach(async function () {
    [shipper, receiver, thirdParty] = await ethers.getSigners();

    const PrivateCargoTracking = await ethers.getContractFactory("PrivateCargoTracking");
    contract = await PrivateCargoTracking.deploy();
    await contract.deployed();
  });

  describe("Cargo Creation", function () {
    it("should create cargo successfully", async function () {
      const tx = await contract.connect(shipper).createCargo(
        1000,
        2,
        50000,
        5,
        receiver.address
      );

      await expect(tx).to.emit(contract, "CargoCreated");

      const cargos = await contract.getShipperCargos(shipper.address);
      expect(cargos.length).to.equal(1);
    });

    it("should reject cargo to self", async function () {
      await expect(
        contract.createCargo(1000, 2, 50000, 5, shipper.address)
      ).to.be.revertedWith("Cannot ship to yourself");
    });
  });

  describe("Authorization", function () {
    let cargoId;

    beforeEach(async function () {
      const tx = await contract.connect(shipper).createCargo(
        1000, 2, 50000, 5,
        receiver.address
      );
      const receipt = await tx.wait();
      cargoId = receipt.events[0].args.cargoId;
    });

    it("should grant authorization", async function () {
      const expiresAt = Math.floor(Date.now() / 1000) + 86400; // 1 day

      const tx = await contract.connect(shipper).grantAuthorization(
        cargoId,
        thirdParty.address,
        true,
        true,
        false,
        expiresAt
      );

      await expect(tx).to.emit(contract, "AuthorizationGranted");
    });

    it("should prevent expired authorization", async function () {
      const pastTime = Math.floor(Date.now() / 1000) - 100;

      await expect(
        contract.connect(shipper).grantAuthorization(
          cargoId,
          thirdParty.address,
          true,
          true,
          false,
          pastTime
        )
      ).to.be.revertedWith("Expiration must be in the future");
    });
  });
});
```

### 6.2 Running Tests

```bash
npx hardhat test
```

### 6.3 Test Coverage

Run coverage analysis:
```bash
npx hardhat coverage
```

## 7. FHEVM-Specific Development

### 7.1 Understanding FHE Operations

**Encryption Functions**:
```solidity
euint32 encrypted = FHE.asEuint32(plainValue);
euint8 encrypted = FHE.asEuint8(plainValue);
```

**Arithmetic Operations** (performed on encrypted values):
```solidity
euint32 result = FHE.add(encrypted1, encrypted2);
euint32 result = FHE.sub(encrypted1, encrypted2);
euint32 result = FHE.mul(encrypted1, encrypted2);
```

**Comparison Operations**:
```solidity
ebool result = FHE.eq(encrypted1, encrypted2);
ebool result = FHE.lt(encrypted1, encrypted2);
```

### 7.2 Access Control Lists (ACL)

**Grant Contract Access**:
```solidity
FHE.allowThis(encryptedValue);
```

**Grant User Access**:
```solidity
FHE.allow(encryptedValue, userAddress);
```

**Important**: Access grants cannot be revoked; design permissions carefully

### 7.3 Common FHEVM Patterns

#### Pattern 1: Conditional Encrypted Operations
```solidity
// Only if authorized
euint32 result = FHE.add(value1, value2);
FHE.allowThis(result);
FHE.allow(result, msg.sender);
```

#### Pattern 2: Multi-User Authorization
```solidity
for (address user in authorizedUsers) {
  FHE.allow(encryptedValue, user);
}
```

## 8. Frontend Development

### 8.1 MetaMask Integration

```javascript
// Request account access
const accounts = await window.ethereum.request({
  method: 'eth_requestAccounts'
});
const userAddress = accounts[0];

// Listen for account changes
window.ethereum.on('accountsChanged', (accounts) => {
  console.log('Switched to account:', accounts[0]);
});

// Listen for network changes
window.ethereum.on('chainChanged', (chainId) => {
  console.log('Switched to chain:', chainId);
  if (chainId !== '0xaa36a7') { // Sepolia chain ID
    alert('Please switch to Sepolia network');
  }
});
```

### 8.2 UI Components Structure

```html
<!-- Cargo Creation Form -->
<form id="createCargoForm">
  <input type="number" id="weight" placeholder="Weight (kg)" />
  <input type="number" id="category" placeholder="Category" />
  <input type="number" id="value" placeholder="Value (USD cents)" />
  <input type="number" id="priority" placeholder="Priority (0-10)" />
  <input type="text" id="receiver" placeholder="Receiver Address" />
  <button type="submit">Create Cargo</button>
</form>

<!-- Cargo Tracking Display -->
<div id="cargoDetails">
  <p>Cargo ID: <span id="cargoId"></span></p>
  <p>Shipper: <span id="shipper"></span></p>
  <p>Receiver: <span id="receiver"></span></p>
  <p>Status: <span id="status"></span></p>
  <p>Last Update: <span id="lastUpdate"></span></p>
</div>
```

### 8.3 Real-Time Updates

```javascript
// Listen to events
contract.on("CargoCreated", (cargoId, shipper, receiver, timestamp) => {
  console.log(`New cargo ${cargoId} created`);
  updateCargoDashboard();
});

contract.on("LocationUpdated", (cargoId, updater, timestamp) => {
  console.log(`Cargo ${cargoId} location updated`);
  refreshCargoStatus(cargoId);
});

// Clean up listeners
contract.removeAllListeners();
```

## 9. Debugging

### 9.1 Hardhat Console

```bash
npx hardhat console --network sepolia
```

```javascript
const contract = await ethers.getContractAt("PrivateCargoTracking", "0x...");
const info = await contract.getCargoInfo(1);
console.log(info);
```

### 9.2 Debugging Transactions

```javascript
// Get transaction details
const tx = await provider.getTransaction(txHash);
console.log(tx);

// Get receipt
const receipt = await provider.getTransactionReceipt(txHash);
console.log(receipt);

// Check events
receipt.logs.forEach(log => {
  console.log(contract.interface.parseLog(log));
});
```

### 9.3 Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| "Cargo does not exist" | Wrong cargo ID | Verify cargo was created with correct ID |
| "Not authorized" | User lacks permissions | Check authorization record and expiration |
| "Expiration must be in future" | Past timestamp | Use `Date.now() / 1000 + seconds` |
| Transaction reverts silently | FHEVM error | Check FHE.allow calls and ACL setup |

## 10. Deployment Checklist

- [ ] Compile contract without errors
- [ ] Run all tests successfully
- [ ] Deploy to Sepolia testnet
- [ ] Verify contract on Etherscan
- [ ] Update ABI in frontend
- [ ] Update contract address in config
- [ ] Test all major functions
- [ ] Verify event emissions
- [ ] Check gas usage
- [ ] Document any deviations

## 11. Production Considerations

### 11.1 Before Mainnet Deployment

1. **Security Audit**: Professional FHEVM audit recommended
2. **Gas Optimization**: Profile and optimize hot paths
3. **Error Messages**: Ensure user-friendly feedback
4. **Rate Limiting**: Consider transaction rate limiting
5. **Emergency Procedures**: Document owner override scenarios

### 11.2 Monitoring

```javascript
// Monitor contract health
setInterval(async () => {
  const cargoCount = await contract.nextCargoId();
  console.log(`Current cargo ID counter: ${cargoCount}`);
}, 3600000); // Every hour
```

## 12. Additional Resources

- **FHEVM Documentation**: https://zama.ai
- **Ethers.js Guide**: https://docs.ethers.org/
- **Hardhat Tutorial**: https://hardhat.org/getting-started/
- **Sepolia Faucet**: https://sepoliafaucet.com/
- **Etherscan Sepolia**: https://sepolia.etherscan.io

---

**Last Updated**: December 2025
**For Support**: Visit GitHub Issues or Zama Community Forum
