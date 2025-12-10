# Troubleshooting Guide: Private Cargo Tracking

## Table of Contents
1. [Connection Issues](#connection-issues)
2. [Transaction Errors](#transaction-errors)
3. [Authorization Problems](#authorization-problems)
4. [Data Issues](#data-issues)
5. [Frontend Problems](#frontend-problems)
6. [Network Issues](#network-issues)
7. [FAQ](#faq)

## Connection Issues

### Problem: MetaMask Not Connecting

**Symptoms**:
- "Connect Wallet" button not working
- MetaMask popup doesn't appear
- Wallet connection fails

**Solutions**:

#### 1. Check MetaMask Installation
```javascript
// In console, test if MetaMask is available
if (window.ethereum) {
  console.log("✓ MetaMask installed");
} else {
  console.log("✗ MetaMask not found");
  // Visit metamask.io to install
}
```

#### 2. Check Permissions
```javascript
// Request permission explicitly
try {
  const accounts = await window.ethereum.request({
    method: 'eth_requestAccounts'
  });
  console.log("✓ Connected:", accounts[0]);
} catch (error) {
  if (error.code === 4001) {
    console.log("User rejected connection");
  }
}
```

#### 3. Restart Browser/MetaMask
- Close all browser tabs with app
- Close MetaMask completely
- Restart browser
- Reopen application
- Connect again

#### 4. Check Network Settings
```javascript
// Verify you're on Sepolia
const chainId = await window.ethereum.request({
  method: 'eth_chainId'
});

if (chainId === '0xaa36a7') {
  console.log("✓ On Sepolia network");
} else {
  console.log("✗ Wrong network:", chainId);
  // Ask user to switch to Sepolia
}
```

---

### Problem: Wrong Network Selected

**Symptoms**:
- MetaMask shows different network
- Transactions fail with "wrong network"
- Application doesn't load cargo data

**Solution**:

```javascript
// Request network switch
async function switchToSepolia() {
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0xaa36a7' }], // Sepolia
    });
    console.log("✓ Switched to Sepolia");
  } catch (error) {
    if (error.code === 4902) {
      // Sepolia not added yet
      await addSepoliaNetwork();
    }
  }
}

async function addSepoliaNetwork() {
  try {
    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [{
        chainId: '0xaa36a7',
        chainName: 'Sepolia',
        rpcUrls: ['https://sepolia.infura.io/v3/YOUR_KEY'],
        blockExplorerUrls: ['https://sepolia.etherscan.io'],
        nativeCurrency: {
          name: 'ETH',
          symbol: 'ETH',
          decimals: 18
        }
      }]
    });
    console.log("✓ Sepolia added");
  } catch (error) {
    console.error("Failed to add network:", error);
  }
}
```

---

### Problem: "Account Not Recognized"

**Symptoms**:
- Cargo not appearing in dashboard
- "No shipments" message
- Permission errors for legitimate owner

**Solutions**:

#### 1. Check Account Address
```javascript
const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();
const address = await signer.getAddress();
console.log("Current account:", address);

// Compare with expected
const expectedAddress = "0x...";
if (address !== expectedAddress) {
  console.log("Wrong account! Switch to:", expectedAddress);
}
```

#### 2. Switch to Correct Account
- Click MetaMask icon
- Click current account name
- Select correct account from list
- Refresh application page

#### 3. Verify Contract Can Find Data
```javascript
const cargoIds = await contract.getShipperCargos(address);
console.log("Your cargos:", cargoIds);
```

---

## Transaction Errors

### Problem: "Insufficient Balance"

**Symptoms**:
- Transaction fails immediately
- Error: "insufficient funds"
- Cannot create cargo or update location

**Solution**:

```bash
# Check current balance
# MetaMask shows balance in top-right

# Get test ETH:
# Visit: https://sepoliafaucet.com
# Enter your address
# Claim 0.5 ETH
# Wait for confirmation

# Verify new balance
# Should see 0.5 ETH in MetaMask after ~30 seconds
```

**Gas Cost Estimates**:
| Operation | Gas | ETH @ 2 Gwei |
|-----------|-----|-------------|
| Create Cargo | 500k | 0.001 ETH |
| Update Location | 400k | 0.0008 ETH |
| Grant Auth | 150k | 0.0003 ETH |
| Batch (50) | 10M | 0.02 ETH |

**Rule of Thumb**: Keep 0.1 ETH minimum in account

---

### Problem: "Reverted" or "Execution Reverted"

**Symptoms**:
- Transaction submitted but reverted
- Generic error message
- No specifics on cause

**Solution**:

#### 1. Check Error Reason
```javascript
try {
  const tx = await contract.updateLocation(cargoId, lat, lon, status);
  await tx.wait();
} catch (error) {
  console.log("Error reason:", error.reason);
  console.log("Full error:", error);
}
```

#### 2. Common Causes & Fixes

**"Cargo does not exist"**:
```javascript
// Verify cargo ID is correct
const cargoExists = await contract.cargos(cargoId);
if (!cargoExists.exists) {
  console.log("Cargo", cargoId, "doesn't exist");
  // Use correct cargo ID
}
```

**"Not authorized for this action"**:
```javascript
// Check if you have permission
const auth = await contract.checkAuthorization(cargoId, userAddress);
console.log("Can view?", auth.canView);
console.log("Can track?", auth.canTrack);
console.log("Can update?", auth.canUpdate);
console.log("Expired?", auth.isExpired);

// If not authorized or expired, request new permission
```

**"Cannot ship to yourself"**:
```javascript
// Receiver cannot be same as shipper
const receiver = "0x...";
const shipper = await signer.getAddress();
if (receiver.toLowerCase() === shipper.toLowerCase()) {
  console.log("Error: receiver is same as shipper");
}
```

#### 3. Increase Gas Limit
```javascript
const tx = await contract.updateLocation(
  cargoId, lat, lon, status,
  { gasLimit: 500000 }  // Explicit gas limit
);
```

---

## Authorization Problems

### Problem: Cannot Grant Authorization

**Symptoms**:
- "Grant Authorization" button fails
- Transaction reverted
- Permission not visible to other party

**Solutions**:

#### 1. Verify You Are Authorized Party
```javascript
const cargoInfo = await contract.getCargoInfo(cargoId);
const userAddress = await signer.getAddress();

const isShipper = cargoInfo.shipper === userAddress;
const isReceiver = cargoInfo.receiver === userAddress;

if (!isShipper && !isReceiver) {
  console.error("You must be shipper or receiver to grant permissions");
}
```

#### 2. Check Expiration Time
```javascript
const now = Math.floor(Date.now() / 1000);
const expiresAt = now + (7 * 24 * 60 * 60);  // 7 days

if (expiresAt <= now) {
  console.error("Expiration must be in the future");
}

console.log("Expiration:", new Date(expiresAt * 1000));
```

#### 3. Verify Target Address
```javascript
const targetAddress = "0x...";

// Is it valid Ethereum address?
if (!ethers.utils.isAddress(targetAddress)) {
  console.error("Invalid Ethereum address");
}

// Not a zero address
if (targetAddress === "0x0000000000000000000000000000000000000000") {
  console.error("Cannot grant to zero address");
}
```

---

### Problem: Cannot Access Cargo (Permission Expired)

**Symptoms**:
- "Not authorized" error
- Was previously authorized
- Cannot view/track cargo anymore

**Solution**:

```javascript
// Check authorization status
const auth = await contract.checkAuthorization(cargoId, userAddress);

console.log("Current time:", Math.floor(Date.now() / 1000));
console.log("Expires at:", auth.expiresAt.toNumber());
console.log("Is expired?", auth.isExpired);

// If expired, ask owner to grant new permission
if (auth.isExpired) {
  console.log("Authorization expired. Request from cargo owner.");
  // Contact shipper/receiver for new permission
}
```

---

## Data Issues

### Problem: Location History Not Showing

**Symptoms**:
- Empty location list
- No updates visible
- Cannot fetch location data

**Solutions**:

#### 1. Check Location Count
```javascript
const count = await contract.getLocationCount(cargoId);
console.log("Location updates:", count);

if (count === 0) {
  console.log("No locations recorded yet");
  // Need to call updateLocation() first
}
```

#### 2. Verify You Can Access Locations
```javascript
const auth = await contract.checkAuthorization(cargoId, userAddress);

if (!auth.canTrack) {
  console.error("You don't have tracking permission");
  // Request permission from shipper
}
```

#### 3. Fetch Latest Location
```javascript
try {
  const location = await contract.getLatestLocation(cargoId);
  console.log("Latest update timestamp:", location.timestamp);
  console.log("Updated by:", location.updater);
} catch (error) {
  console.error("Cannot fetch location:", error.reason);
}
```

---

### Problem: Cargo Weight/Value Not Showing

**Symptoms**:
- Cannot see encrypted cargo specifications
- Data appears empty or null
- Cannot verify cargo details

**Limitation**: FHEVM constraint
```
// This CANNOT be returned from view functions:
function getCargoWeight(uint32 _cargoId)
external view returns (euint32) {  // ERROR!
  return cargos[_cargoId].weight;
}
```

**Workaround**: Only plaintext data available
```javascript
const info = await contract.getCargoInfo(cargoId);
console.log("Shipper:", info.shipper);
console.log("Receiver:", info.receiver);
console.log("Created:", new Date(info.timestamp * 1000));
console.log("Location updates:", info.locationCount);

// Weight, value, etc. are encrypted - visible only to authorized parties internally
```

---

## Frontend Problems

### Problem: Dashboard Blank/Not Loading

**Symptoms**:
- Empty page or white screen
- No cargo list visible
- JavaScript errors in console

**Solutions**:

#### 1. Check Browser Console
```javascript
// Open: DevTools → Console
// Look for red errors

// Common errors:
// "Cannot read property of undefined"
// "fetch failed"
// "contract is not defined"
```

#### 2. Clear Cache
- Press Ctrl+Shift+Delete (or Cmd+Shift+Delete on Mac)
- Select "Cached images and files"
- Click "Clear"
- Refresh page

#### 3. Check Contract Address
```javascript
// In console:
const CONTRACT_ADDRESS = "0x1846d67Dcf544B374D59F6d9a9adE4e37719D57A";
console.log("Contract:", CONTRACT_ADDRESS);

// Verify on Etherscan:
// https://sepolia.etherscan.io/address/{CONTRACT_ADDRESS}
```

#### 4. Test Network Connection
```javascript
// Check if can connect to provider
const provider = new ethers.providers.JsonRpcProvider(
  "https://sepolia.infura.io/v3/YOUR_KEY"
);

provider.getBlockNumber().then(blockNumber => {
  console.log("✓ Connected to Sepolia");
  console.log("Current block:", blockNumber);
}).catch(error => {
  console.error("✗ Cannot connect:", error);
});
```

---

### Problem: Events Not Displaying

**Symptoms**:
- Real-time updates not showing
- Notifications not arriving
- Dashboard doesn't refresh

**Solution**:

```javascript
// Setup event listeners
contract.on("CargoCreated", (cargoId, shipper, receiver, timestamp) => {
  console.log("Event received: Cargo created");
  // Update UI here
});

contract.on("LocationUpdated", (cargoId, updater, timestamp) => {
  console.log("Event received: Location updated");
  // Update map/list here
});

// Test: Create a cargo and watch console
// You should see event log immediately
```

---

## Network Issues

### Problem: Slow Transactions

**Symptoms**:
- Transactions take very long
- "Pending" status for minutes
- Fear transaction is stuck

**Normal Behavior**:
- Sepolia ~12-15 seconds per block
- Transaction pending 30 seconds = normal
- Pending 5+ minutes = possibly stuck

**Solution**:

```javascript
// Check transaction status
const txHash = "0x...";
const receipt = await provider.getTransactionReceipt(txHash);

if (!receipt) {
  console.log("Transaction still pending");
} else if (receipt.status === 1) {
  console.log("✓ Transaction successful");
} else {
  console.log("✗ Transaction failed");
}
```

**Speed Up**:
- Wait longer (usually confirms within 1 minute)
- Use faster RPC (Infura vs Alchemy)
- Increase gas price slightly
- Retry in low-congestion period

---

### Problem: "NONCE Too Low" Error

**Symptoms**:
- Previous transaction pending
- Cannot send new transaction
- "Nonce too low" error

**Solution**:

```javascript
// Wait for pending transaction to complete
// Check in MetaMask Activity tab

// Or reset MetaMask nonce:
// 1. Open MetaMask
// 2. Click avatar → Settings
// 3. Advanced → Reset Account
// 4. Confirm

// Then retry transaction
```

---

## FAQ

### Q: How do I know my cargo was created?

**A**:
```javascript
// 1. Check transaction receipt
const receipt = await tx.wait();

// 2. Look for CargoCreated event
const cargoId = receipt.events[0].args.cargoId;
console.log("Created cargo #" + cargoId);

// 3. Verify in Etherscan
// Visit: https://sepolia.etherscan.io/tx/{TX_HASH}

// 4. See in dashboard
// Your shipments list should update
```

---

### Q: Can I update someone else's cargo?

**A**: No. Only shipper/receiver can update, or authorized parties. Others get "Not authorized" error.

---

### Q: What if I grant wrong permissions?

**A**: You can revoke and grant new ones:
```javascript
// Revoke
await contract.revokeAuthorization(cargoId, userAddress);

// Grant new permissions
await contract.grantAuthorization(cargoId, userAddress, true, true, false, expiresAt);
```

---

### Q: How long do permissions last?

**A**: You set it when granting. Common durations:
- 7 days: Logistics provider
- 30 days: Insurance company
- 24 hours: Audit/compliance
- 1 hour: Inspection window

---

### Q: What if I lost my MetaMask seed phrase?

**A**: Cannot recover. Create new wallet and contract will see it as different address.

---

### Q: Is my cargo information really private?

**A**: Yes! Encrypted data is only viewable by:
- Shipper
- Receiver
- Authorized parties (with permission)
- Nobody else, not even developers

---

## Escalation

If issues persist:

1. **Check GitHub Issues**: https://github.com/GaetanoHomenick/PrivacyCargoTracking_FHE/issues
2. **Community Forum**: https://www.zama.ai/community
3. **Discord**: https://discord.com/invite/zama
4. **Documentation**: Review PROJECT_OVERVIEW.md

---

**Last Updated**: December 2025
**Support Status**: Active
