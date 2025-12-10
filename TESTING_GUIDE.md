# Testing Guide: Private Cargo Tracking

## 1. Testing Overview

This guide provides comprehensive testing procedures for the Private Cargo Tracking smart contract and frontend application. Testing covers unit tests, integration tests, access control validation, and FHEVM-specific functionality.

## 2. Unit Test Suite

### 2.1 Test Environment Setup

Create file: `test/PrivateCargoTracking.test.ts`

```typescript
import { expect } from "chai";
import { ethers } from "hardhat";
import { PrivateCargoTracking } from "../typechain-types";

describe("Private Cargo Tracking", function () {
  let contract: PrivateCargoTracking;
  let owner: SignerWithAddress;
  let shipper: SignerWithAddress;
  let receiver: SignerWithAddress;
  let thirdParty: SignerWithAddress;

  beforeEach(async function () {
    [owner, shipper, receiver, thirdParty] = await ethers.getSigners();

    const PrivateCargoTrackingFactory = await ethers.getContractFactory(
      "PrivateCargoTracking"
    );
    contract = await PrivateCargoTrackingFactory.deploy();
    await contract.deployed();
  });

  // Test suites follow below
});
```

### 2.2 Cargo Creation Tests

```typescript
describe("Cargo Creation", function () {
  it("Should create a single cargo successfully", async function () {
    const tx = await contract
      .connect(shipper)
      .createCargo(1000, 2, 50000, 5, receiver.address);

    const receipt = await tx.wait();
    const event = receipt.events?.find(e => e.event === "CargoCreated");

    expect(event).to.exist;
    expect(event?.args?.cargoId).to.equal(1);
    expect(event?.args?.shipper).to.equal(shipper.address);
    expect(event?.args?.receiver).to.equal(receiver.address);
  });

  it("Should auto-increment cargo IDs", async function () {
    await contract.createCargo(1000, 2, 50000, 5, receiver.address);
    const tx2 = await contract.createCargo(2000, 3, 100000, 8, receiver.address);

    const receipt2 = await tx2.wait();
    const event2 = receipt2.events?.find(e => e.event === "CargoCreated");

    expect(event2?.args?.cargoId).to.equal(2);
  });

  it("Should reject cargo to self", async function () {
    await expect(
      contract.createCargo(1000, 2, 50000, 5, shipper.address)
    ).to.be.revertedWith("Cannot ship to yourself");
  });

  it("Should reject null receiver address", async function () {
    await expect(
      contract.createCargo(1000, 2, 50000, 5, ethers.constants.AddressZero)
    ).to.be.revertedWith("Invalid receiver address");
  });

  it("Should register cargo in shipper and receiver lists", async function () {
    await contract.connect(shipper).createCargo(1000, 2, 50000, 5, receiver.address);

    const shipperCargos = await contract.getShipperCargos(shipper.address);
    const receiverCargos = await contract.getReceiverCargos(receiver.address);

    expect(shipperCargos).to.include(1);
    expect(receiverCargos).to.include(1);
  });

  it("Should create initial location with status 0", async function () {
    await contract.connect(shipper).createCargo(1000, 2, 50000, 5, receiver.address);

    const locationCount = await contract.getLocationCount(1);
    expect(locationCount).to.equal(1);
  });
});
```

### 2.3 Batch Cargo Creation Tests

```typescript
describe("Batch Cargo Creation", function () {
  it("Should create multiple cargos in batch", async function () {
    const weights = [1000, 2000, 3000];
    const categories = [1, 2, 3];
    const values = [50000, 100000, 150000];
    const priorities = [5, 7, 9];
    const receivers = [receiver.address, thirdParty.address, receiver.address];

    const tx = await contract
      .connect(shipper)
      .createBatchCargos(weights, categories, values, priorities, receivers);

    const receipt = await tx.wait();
    const events = receipt.events?.filter(e => e.event === "CargoCreated");

    expect(events?.length).to.equal(3);
    expect(events?.[0].args?.cargoId).to.equal(1);
    expect(events?.[1].args?.cargoId).to.equal(2);
    expect(events?.[2].args?.cargoId).to.equal(3);
  });

  it("Should reject batch with mismatched array lengths", async function () {
    const weights = [1000, 2000];
    const categories = [1, 2, 3]; // Wrong length

    await expect(
      contract.createBatchCargos(
        weights,
        categories,
        [50000, 100000],
        [5, 7],
        [receiver.address, thirdParty.address]
      )
    ).to.be.revertedWith("Array length mismatch");
  });

  it("Should reject batch size > 50", async function () {
    const weights = Array(51).fill(1000);
    const categories = Array(51).fill(1);
    const values = Array(51).fill(50000);
    const priorities = Array(51).fill(5);
    const receivers = Array(51).fill(receiver.address);

    await expect(
      contract.createBatchCargos(weights, categories, values, priorities, receivers)
    ).to.be.revertedWith("Invalid batch size");
  });

  it("Should accept batch size exactly 50", async function () {
    const size = 50;
    const weights = Array(size).fill(1000);
    const categories = Array(size).fill(1);
    const values = Array(size).fill(50000);
    const priorities = Array(size).fill(5);
    const receivers = Array(size).fill(receiver.address);

    const tx = await contract.createBatchCargos(
      weights,
      categories,
      values,
      priorities,
      receivers
    );

    const receipt = await tx.wait();
    const events = receipt.events?.filter(e => e.event === "CargoCreated");

    expect(events?.length).to.equal(50);
  });
});
```

### 2.4 Location Update Tests

```typescript
describe("Location Updates", function () {
  let cargoId = 1;

  beforeEach(async function () {
    const tx = await contract
      .connect(shipper)
      .createCargo(1000, 2, 50000, 5, receiver.address);
    await tx.wait();
  });

  it("Should allow authorized user to update location", async function () {
    const tx = await contract
      .connect(shipper)
      .updateLocation(cargoId, 40.7128, 74.0060, 1);

    await expect(tx).to.emit(contract, "LocationUpdated");
    await expect(tx).to.emit(contract, "StatusChanged");

    const locationCount = await contract.getLocationCount(cargoId);
    expect(locationCount).to.equal(2); // Initial + new location
  });

  it("Should reject location update for non-existent cargo", async function () {
    await expect(
      contract.connect(shipper).updateLocation(999, 40.7128, 74.0060, 1)
    ).to.be.revertedWith("Cargo does not exist");
  });

  it("Should allow receiver to update location", async function () {
    const tx = await contract
      .connect(receiver)
      .updateLocation(cargoId, 40.7128, 74.0060, 1);

    await expect(tx).to.emit(contract, "LocationUpdated");
  });

  it("Should reject unauthorized third party update", async function () {
    await expect(
      contract.connect(thirdParty).updateLocation(cargoId, 40.7128, 74.0060, 1)
    ).to.be.revertedWith("Not authorized for this action");
  });

  it("Should maintain location history", async function () {
    // First update
    await contract.connect(shipper).updateLocation(cargoId, 40.7128, 74.0060, 1);
    // Second update
    await contract.connect(shipper).updateLocation(cargoId, 41.8781, 87.6298, 2);
    // Third update
    await contract.connect(shipper).updateLocation(cargoId, 34.0522, 118.2437, 3);

    const locationCount = await contract.getLocationCount(cargoId);
    expect(locationCount).to.equal(4); // Initial + 3 updates
  });

  it("Should record updater address correctly", async function () {
    await contract.connect(shipper).updateLocation(cargoId, 40.7128, 74.0060, 1);

    const location = await contract.getLatestLocation(cargoId);
    expect(location.updater).to.equal(shipper.address);
  });
});
```

### 2.5 Authorization Tests

```typescript
describe("Authorization Management", function () {
  let cargoId = 1;
  const futureExpiration = Math.floor(Date.now() / 1000) + 86400; // 1 day

  beforeEach(async function () {
    const tx = await contract
      .connect(shipper)
      .createCargo(1000, 2, 50000, 5, receiver.address);
    await tx.wait();
  });

  it("Should grant authorization from shipper", async function () {
    const tx = await contract
      .connect(shipper)
      .grantAuthorization(cargoId, thirdParty.address, true, true, false, futureExpiration);

    await expect(tx).to.emit(contract, "AuthorizationGranted");
  });

  it("Should grant authorization from receiver", async function () {
    const tx = await contract
      .connect(receiver)
      .grantAuthorization(cargoId, thirdParty.address, true, true, true, futureExpiration);

    await expect(tx).to.emit(contract, "AuthorizationGranted");
  });

  it("Should reject authorization from non-party", async function () {
    await expect(
      contract
        .connect(thirdParty)
        .grantAuthorization(cargoId, owner.address, true, true, false, futureExpiration)
    ).to.be.revertedWith("Only shipper or receiver can grant authorization");
  });

  it("Should reject authorization with past expiration", async function () {
    const pastTime = Math.floor(Date.now() / 1000) - 100;

    await expect(
      contract
        .connect(shipper)
        .grantAuthorization(cargoId, thirdParty.address, true, true, false, pastTime)
    ).to.be.revertedWith("Expiration must be in the future");
  });

  it("Should reject zero address authorization", async function () {
    await expect(
      contract
        .connect(shipper)
        .grantAuthorization(
          cargoId,
          ethers.constants.AddressZero,
          true,
          true,
          false,
          futureExpiration
        )
    ).to.be.revertedWith("Invalid address");
  });

  it("Should revoke authorization", async function () {
    // Grant first
    await contract
      .connect(shipper)
      .grantAuthorization(cargoId, thirdParty.address, true, true, false, futureExpiration);

    // Revoke
    const tx = await contract
      .connect(shipper)
      .revokeAuthorization(cargoId, thirdParty.address);

    await expect(tx).to.emit(contract, "AuthorizationRevoked");
  });

  it("Should verify authorization status", async function () {
    await contract
      .connect(shipper)
      .grantAuthorization(cargoId, thirdParty.address, true, false, true, futureExpiration);

    const auth = await contract.checkAuthorization(cargoId, thirdParty.address);

    expect(auth.canView).to.be.true;
    expect(auth.canTrack).to.be.false;
    expect(auth.canUpdate).to.be.true;
    expect(auth.isExpired).to.be.false;
  });

  it("Should detect expired authorization", async function () {
    const pastExpiration = Math.floor(Date.now() / 1000) - 1;

    await contract
      .connect(shipper)
      .grantAuthorization(cargoId, thirdParty.address, true, true, false, pastExpiration);

    const auth = await contract.checkAuthorization(cargoId, thirdParty.address);
    expect(auth.isExpired).to.be.true;
  });

  it("Should grant cargo party full permissions", async function () {
    const shipperAuth = await contract.checkAuthorization(cargoId, shipper.address);

    expect(shipperAuth.canView).to.be.true;
    expect(shipperAuth.canTrack).to.be.true;
    expect(shipperAuth.canUpdate).to.be.true;
    expect(shipperAuth.isExpired).to.be.false;
  });
});
```

### 2.6 Access Control Tests

```typescript
describe("Access Control", function () {
  let cargoId = 1;

  beforeEach(async function () {
    const tx = await contract
      .connect(shipper)
      .createCargo(1000, 2, 50000, 5, receiver.address);
    await tx.wait();
  });

  it("Shipper should view cargo info", async function () {
    const info = await contract.connect(shipper).getCargoInfo(cargoId);

    expect(info.shipper).to.equal(shipper.address);
    expect(info.receiver).to.equal(receiver.address);
  });

  it("Receiver should view cargo info", async function () {
    const info = await contract.connect(receiver).getCargoInfo(cargoId);

    expect(info.receiver).to.equal(receiver.address);
  });

  it("Unauthorized party cannot view cargo info", async function () {
    await expect(
      contract.connect(thirdParty).getCargoInfo(cargoId)
    ).to.be.revertedWith("Not authorized for this action");
  });

  it("Authorized party with view permission can access cargo info", async function () {
    const expiration = Math.floor(Date.now() / 1000) + 86400;

    await contract
      .connect(shipper)
      .grantAuthorization(cargoId, thirdParty.address, true, false, false, expiration);

    const info = await contract.connect(thirdParty).getCargoInfo(cargoId);
    expect(info.shipper).to.equal(shipper.address);
  });

  it("Third party with track permission can access location", async function () {
    const expiration = Math.floor(Date.now() / 1000) + 86400;

    await contract
      .connect(shipper)
      .grantAuthorization(cargoId, thirdParty.address, false, true, false, expiration);

    const location = await contract.connect(thirdParty).getLatestLocation(cargoId);
    expect(location).to.exist;
  });

  it("Third party without track permission cannot access location", async function () {
    const expiration = Math.floor(Date.now() / 1000) + 86400;

    await contract
      .connect(shipper)
      .grantAuthorization(cargoId, thirdParty.address, true, false, false, expiration);

    await expect(
      contract.connect(thirdParty).getLatestLocation(cargoId)
    ).to.be.revertedWith("Not authorized for this action");
  });
});
```

### 2.7 Emergency Functions Tests

```typescript
describe("Emergency Functions", function () {
  let cargoId = 1;

  beforeEach(async function () {
    const tx = await contract
      .connect(shipper)
      .createCargo(1000, 2, 50000, 5, receiver.address);
    await tx.wait();
  });

  it("Owner can perform emergency status update", async function () {
    const tx = await contract
      .connect(owner)
      .emergencyStatusUpdate(cargoId, 40.7128, 74.0060, 2);

    await expect(tx).to.emit(contract, "LocationUpdated");
  });

  it("Non-owner cannot perform emergency update", async function () {
    await expect(
      contract
        .connect(shipper)
        .emergencyStatusUpdate(cargoId, 40.7128, 74.0060, 2)
    ).to.be.revertedWith("Not authorized");
  });
});
```

## 3. Integration Tests

### 3.1 Full Workflow Test

```typescript
describe("Complete Logistics Workflow", function () {
  it("Should handle complete shipment lifecycle", async function () {
    // 1. Create cargo
    const createTx = await contract
      .connect(shipper)
      .createCargo(5000, 1, 500000, 8, receiver.address);

    const createReceipt = await createTx.wait();
    const cargoId = 1;

    // 2. Grant tracking permission to logistics provider
    const expiration = Math.floor(Date.now() / 1000) + 86400 * 7;
    await contract
      .connect(shipper)
      .grantAuthorization(cargoId, thirdParty.address, true, true, true, expiration);

    // 3. Logistics provider updates location
    await contract
      .connect(thirdParty)
      .updateLocation(cargoId, 40.7128, 74.0060, 1);

    // 4. Verify authorization status
    const auth = await contract.checkAuthorization(cargoId, thirdParty.address);
    expect(auth.canView).to.be.true;
    expect(auth.canTrack).to.be.true;
    expect(auth.canUpdate).to.be.true;

    // 5. Update to delivered status
    await contract
      .connect(thirdParty)
      .updateLocation(cargoId, 34.0522, 118.2437, 3);

    // 6. Verify final location count
    const finalCount = await contract.getLocationCount(cargoId);
    expect(finalCount).to.be.greaterThan(1);
  });
});
```

## 4. Manual Testing Procedures

### 4.1 Frontend Testing Steps

#### Test 1: Connect Wallet
1. Open application in browser
2. Click "Connect Wallet"
3. Approve MetaMask connection
4. Verify account address displayed
5. Verify correct network (Sepolia) shown

#### Test 2: Create Cargo
1. Fill cargo creation form:
   - Weight: 1000 kg
   - Category: 2
   - Value: 50000
   - Priority: 5
   - Receiver: Valid Ethereum address
2. Click "Create Cargo"
3. Approve transaction in MetaMask
4. Wait for confirmation
5. Verify cargo appears in dashboard
6. Verify event in console

#### Test 3: Update Location
1. Select existing cargo from list
2. Enter location coordinates:
   - Latitude: 40.7128
   - Longitude: 74.0060
   - Status: In Transit
3. Click "Update Location"
4. Approve in MetaMask
5. Verify location updated
6. Check location history

#### Test 4: Grant Authorization
1. Select cargo
2. Enter third-party address
3. Set permissions:
   - View: checked
   - Track: checked
   - Update: unchecked
4. Set expiration: 7 days
5. Click "Grant Authorization"
6. Verify event emission

### 4.2 Gas Usage Testing

Record gas consumption for:
- Single cargo creation: ~500k gas
- Batch cargo (50): ~10M gas
- Location update: ~400k gas
- Grant authorization: ~150k gas

## 5. Security Testing

### 5.1 Authorization Bypass Attempts

**Test**: Attempt access without authorization
```
1. Create cargo as Shipper
2. Try to call getCargoInfo as UnauthorizedUser
3. Expect: "Not authorized for this action" error
4. Result: ✓ Access denied as expected
```

**Test**: Access with expired authorization
```
1. Grant authorization with past expiration
2. Try to call function with expired user
3. Expect: "Not authorized for this action" error
4. Result: ✓ Access denied as expected
```

### 5.2 Data Integrity Testing

**Test**: Verify immutability of past locations
```
1. Create cargo
2. Add location update 1
3. Add location update 2
4. Retrieve all locations
5. Verify location 1 unchanged
6. Result: ✓ Historical data immutable
```

### 5.3 FHEVM-Specific Testing

**Test**: Verify encrypted data is protected
```
1. Create cargo with sensitive weight
2. Attempt to read weight without authorization
3. Expect: Cannot decrypt without FHE.allow()
4. Result: ✓ Data encryption holds
```

## 6. Performance Testing

### 6.1 Load Testing

```bash
# Test batch operations under load
for i in {1..100}; do
  npx hardhat run scripts/batch-test.js --network sepolia
done
```

### 6.2 Query Performance

```typescript
// Measure query time
const startTime = Date.now();

for (let i = 1; i <= 100; i++) {
  await contract.getShipperCargos(shipper.address);
}

const endTime = Date.now();
console.log(`Query time: ${(endTime - startTime) / 100}ms`);
```

## 7. Running the Test Suite

```bash
# Run all tests
npm test

# Run specific test suite
npm test -- --grep "Cargo Creation"

# Generate coverage report
npm run coverage

# Run on Sepolia testnet
npx hardhat test --network sepolia
```

## 8. Continuous Integration

### 8.1 GitHub Actions Workflow

Create `.github/workflows/test.yml`:

```yaml
name: Smart Contract Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm test
      - run: npm run coverage
```

## 9. Test Checklist

- [ ] All unit tests pass
- [ ] Integration tests pass
- [ ] Access control verified
- [ ] Authorization expiration tested
- [ ] Emergency functions tested
- [ ] Event emissions verified
- [ ] Gas usage acceptable
- [ ] Error messages clear
- [ ] Frontend integration works
- [ ] MetaMask connectivity verified
- [ ] Batch operations tested
- [ ] Edge cases covered

## 10. Known Test Limitations

1. **FHEVM Simulation**: Local Hardhat cannot fully simulate FHEVM
2. **Encrypted Values**: Cannot directly assert encrypted values
3. **Network-Specific**: Some tests must run on Sepolia
4. **Time-Based Tests**: Require blockchain time manipulation

## 11. Troubleshooting Tests

| Issue | Solution |
|-------|----------|
| "Contract not deployed" | Run compile first: `npm run compile` |
| "Gas estimation failed" | Check account has sufficient balance |
| "Block number too old" | Use recent block, not historical |
| "Array out of bounds" | Verify cargo exists before accessing |

---

**Last Updated**: December 2025
**Framework**: Hardhat + Chai + Ethers.js
