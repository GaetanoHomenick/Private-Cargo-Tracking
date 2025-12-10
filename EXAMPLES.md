# Practical Examples: Private Cargo Tracking

## Table of Contents
1. [Basic Examples](#basic-examples)
2. [Advanced Workflows](#advanced-workflows)
3. [Real-World Scenarios](#real-world-scenarios)
4. [Code Snippets](#code-snippets)

## Basic Examples

### Example 1: Creating Your First Cargo

**Scenario**: A shipper wants to send a package

```javascript
const ethers = require("ethers");

// Setup
const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();

const CONTRACT_ABI = [/* ... */];
const CONTRACT_ADDRESS = "0x1846d67Dcf544B374D59F6d9a9adE4e37719D57A";

const contract = new ethers.Contract(
  CONTRACT_ADDRESS,
  CONTRACT_ABI,
  signer
);

// Create cargo
async function createCargo() {
  try {
    const tx = await contract.createCargo(
      2500,      // weight: 2500 kg
      1,         // category: 1 (Electronics)
      500000,    // value: $5000.00
      8,         // priority: 8/10 (urgent)
      "0x742d35Cc6634C0532925a3b844Bc9e7595f42D0"  // receiver
    );

    console.log("Transaction sent:", tx.hash);
    const receipt = await tx.wait();

    console.log("✓ Cargo created!");
    console.log("Cargo ID:", receipt.events[0].args.cargoId);

    return receipt.events[0].args.cargoId;
  } catch (error) {
    console.error("Error creating cargo:", error.message);
  }
}

// Usage
createCargo();
```

### Example 2: Tracking Cargo Location

**Scenario**: Logistics provider updates cargo location

```javascript
async function updateCargoLocation(cargoId) {
  try {
    // Update location
    const tx = await contract.updateLocation(
      cargoId,
      407128,    // latitude (40.7128)
      740060,    // longitude (-74.0060)
      1          // status: 1 (In Transit)
    );

    console.log("Location update sent:", tx.hash);
    const receipt = await tx.wait();

    console.log("✓ Location updated!");
    console.log("Timestamp:", receipt.events[0].args.timestamp);

    // Get latest location
    const latest = await contract.getLatestLocation(cargoId);
    console.log("Updated by:", latest.updater);
    console.log("At:", new Date(latest.timestamp * 1000));
  } catch (error) {
    console.error("Error updating location:", error.message);
  }
}

updateCargoLocation(1);
```

### Example 3: Granting Permission to Logistics Provider

**Scenario**: Shipper grants tracking permission for 7 days

```javascript
async function grantTrackingAccess(cargoId, providerAddress) {
  try {
    // Calculate expiration (7 days from now)
    const now = Math.floor(Date.now() / 1000);
    const expiresAt = now + (7 * 24 * 60 * 60);

    // Grant permission
    const tx = await contract.grantAuthorization(
      cargoId,
      providerAddress,
      true,     // canView: See cargo specs
      true,     // canTrack: See location history
      true,     // canUpdate: Update status
      expiresAt
    );

    console.log("Authorization grant sent:", tx.hash);
    await tx.wait();

    console.log("✓ Permission granted!");
    console.log("Expires at:", new Date(expiresAt * 1000));
  } catch (error) {
    console.error("Error granting permission:", error.message);
  }
}

grantTrackingAccess(1, "0x123...456");
```

### Example 4: Checking Your Shipments

**Scenario**: User wants to see all their outgoing shipments

```javascript
async function getMyShipments(userAddress) {
  try {
    // Get all cargos shipped by user
    const cargoIds = await contract.getShipperCargos(userAddress);

    console.log("Your shipments:", cargoIds.length);

    // Get details for each
    for (const cargoId of cargoIds) {
      const info = await contract.getCargoInfo(cargoId);
      const locationCount = await contract.getLocationCount(cargoId);

      console.log(`
        Cargo #${cargoId}
        - To: ${info.receiver}
        - Created: ${new Date(info.timestamp * 1000)}
        - Updates: ${locationCount}
      `);
    }
  } catch (error) {
    console.error("Error fetching shipments:", error.message);
  }
}

getMyShipments("0xYourAddress");
```

## Advanced Workflows

### Workflow 1: Complete Shipment Lifecycle

**Scenario**: Track a cargo from creation through delivery

```javascript
class ShipmentTracker {
  constructor(contract) {
    this.contract = contract;
  }

  async createAndTrack(
    weight,
    category,
    value,
    priority,
    receiverAddress
  ) {
    console.log("Starting shipment tracking...\n");

    // Step 1: Create cargo
    console.log("Step 1: Creating cargo");
    const createTx = await this.contract.createCargo(
      weight, category, value, priority, receiverAddress
    );
    const createReceipt = await createTx.wait();
    const cargoId = createReceipt.events[0].args.cargoId;
    console.log(`✓ Cargo #${cargoId} created\n`);

    // Step 2: Grant access to logistics
    console.log("Step 2: Granting logistics provider access");
    const expiresAt = Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60);
    const authTx = await this.contract.grantAuthorization(
      cargoId,
      "0xLogisticsProvider",
      true, true, true,
      expiresAt
    );
    await authTx.wait();
    console.log("✓ Access granted\n");

    // Step 3: Listen for updates
    console.log("Step 3: Monitoring for updates");
    this.contract.on(
      "LocationUpdated",
      (updatedCargoId, updater, timestamp) => {
        if (updatedCargoId.eq(cargoId)) {
          console.log(`✓ Location updated by ${updater}`);
          console.log(`  at ${new Date(timestamp * 1000)}\n`);
        }
      }
    );

    // Step 4: Check authorization
    console.log("Step 4: Verifying permissions");
    const auth = await this.contract.checkAuthorization(
      cargoId,
      "0xLogisticsProvider"
    );
    console.log("Permissions:");
    console.log(`  View: ${auth.canView}`);
    console.log(`  Track: ${auth.canTrack}`);
    console.log(`  Update: ${auth.canUpdate}`);
    console.log(`  Expires: ${new Date(auth.expiresAt * 1000)}\n`);

    return cargoId;
  }
}

// Usage
const tracker = new ShipmentTracker(contract);
tracker.createAndTrack(1000, 2, 50000, 5, "0xReceiver");
```

### Workflow 2: Batch Cargo Management

**Scenario**: Logistics company creates 20 shipments at once

```javascript
async function batchCreateShipments() {
  const shipments = [
    { weight: 1000, category: 1, value: 50000, priority: 5, receiver: "0xAddr1" },
    { weight: 2000, category: 2, value: 100000, priority: 7, receiver: "0xAddr2" },
    { weight: 1500, category: 1, value: 75000, priority: 6, receiver: "0xAddr3" },
    // ... up to 50 total
  ];

  try {
    // Prepare arrays
    const weights = shipments.map(s => s.weight);
    const categories = shipments.map(s => s.category);
    const values = shipments.map(s => s.value);
    const priorities = shipments.map(s => s.priority);
    const receivers = shipments.map(s => s.receiver);

    console.log(`Creating ${shipments.length} cargos in batch...`);

    // Create all at once
    const tx = await contract.createBatchCargos(
      weights, categories, values, priorities, receivers
    );

    console.log("Batch transaction sent:", tx.hash);
    const receipt = await tx.wait();

    // Extract created cargo IDs
    const cargoIds = receipt.events
      .filter(e => e.event === "CargoCreated")
      .map(e => e.args.cargoId);

    console.log(`✓ Created ${cargoIds.length} cargos!`);
    console.log("Cargo IDs:", cargoIds);

    return cargoIds;
  } catch (error) {
    console.error("Error creating batch:", error.message);
  }
}

batchCreateShipments();
```

### Workflow 3: Multi-Party Access Management

**Scenario**: Shipper manages multiple authorized parties

```javascript
class AccessManager {
  constructor(contract, cargoId) {
    this.contract = contract;
    this.cargoId = cargoId;
  }

  async setupMultiPartyAccess() {
    const parties = [
      {
        address: "0xLogisticsProvider",
        name: "Logistics",
        view: true,
        track: true,
        update: true,
        days: 7
      },
      {
        address: "0xInsuranceCompany",
        name: "Insurance",
        view: true,
        track: true,
        update: false,
        days: 30
      },
      {
        address: "0xComplianceAuditor",
        name: "Compliance",
        view: true,
        track: false,
        update: false,
        days: 1
      }
    ];

    for (const party of parties) {
      const expiresAt = Math.floor(Date.now() / 1000) + (party.days * 24 * 60 * 60);

      console.log(`Granting ${party.name} access...`);

      const tx = await this.contract.grantAuthorization(
        this.cargoId,
        party.address,
        party.view,
        party.track,
        party.update,
        expiresAt
      );

      await tx.wait();
      console.log(`✓ ${party.name} granted access until ${new Date(expiresAt * 1000)}`);
    }
  }

  async revokeAllAccess() {
    const parties = [
      "0xLogisticsProvider",
      "0xInsuranceCompany",
      "0xComplianceAuditor"
    ];

    for (const party of parties) {
      console.log(`Revoking ${party} access...`);

      const tx = await this.contract.revokeAuthorization(
        this.cargoId,
        party
      );

      await tx.wait();
      console.log(`✓ Revoked ${party}`);
    }
  }
}

// Usage
const manager = new AccessManager(contract, 1);
manager.setupMultiPartyAccess();
```

## Real-World Scenarios

### Scenario 1: Pharmaceutical Supply Chain

**Requirement**: Track medicine shipment with HIPAA compliance

```javascript
async function handlePharmaceuticalShipment() {
  const cargoId = await contract.createCargo(
    100,       // weight: 100 kg (drugs)
    5,         // category: 5 (Pharmaceutical)
    1000000,   // value: $10,000
    10,        // priority: 10 (Critical)
    "0xHospital"
  );

  // Only grant medical professionals access
  const medicalStaff = [
    { addr: "0xPharmacist", name: "Pharmacist", days: 7 },
    { addr: "0xWarehouse", name: "Warehouse", days: 7 },
    { addr: "0xComplianceOfficer", name: "Compliance", days: 30 }
  ];

  for (const staff of medicalStaff) {
    const expiresAt = Math.floor(Date.now() / 1000) + (staff.days * 24 * 60 * 60);

    await contract.grantAuthorization(
      cargoId,
      staff.addr,
      true,   // view: Critical for HIPAA compliance
      true,   // track: Required for delivery
      true,   // update: Handle at each stage
      expiresAt
    );

    console.log(`✓ ${staff.name} authorized for pharmaceutical shipment`);
  }

  console.log(`✓ HIPAA-compliant tracking enabled for cargo #${cargoId}`);
}

handlePharmaceuticalShipment();
```

### Scenario 2: International Trade Customs

**Requirement**: Comply with customs regulations

```javascript
async function handleInternationalShipment() {
  // Create shipment
  const cargoId = await contract.createCargo(
    5000,      // weight: 5 tons
    3,         // category: 3 (Machinery)
    500000,    // value: $5,000
    7,         // priority: 7
    "0xInternationalBuyer"
  );

  // Grant customs temporary access (2 hours inspection window)
  const inspectionStart = Math.floor(Date.now() / 1000);
  const inspectionEnd = inspectionStart + (2 * 60 * 60);

  await contract.grantAuthorization(
    cargoId,
    "0xCustomsOfficer",
    true,  // view: Verify contents
    true,  // track: Check route
    false, // update: read-only audit
    inspectionEnd
  );

  console.log("Customs inspection window: 2 hours");
  console.log("Automatic revocation at:", new Date(inspectionEnd * 1000));
  console.log(`✓ International shipment ${cargoId} ready for customs`);
}

handleInternationalShipment();
```

### Scenario 3: Insurance Claims

**Requirement**: Enable insurance assessment without full disclosure

```javascript
async function handleInsuranceClaim(cargoId, claimDetails) {
  console.log("Processing insurance claim for cargo #" + cargoId);

  // Grant temporary audit access
  const claimPeriod = 30 * 24 * 60 * 60;  // 30 days
  const expiresAt = Math.floor(Date.now() / 1000) + claimPeriod;

  await contract.grantAuthorization(
    cargoId,
    claimDetails.insuranceAddress,
    true,   // view: Assess cargo value
    true,   // track: Verify route compliance
    false,  // update: read-only
    expiresAt
  );

  console.log("Insurance claim access granted");
  console.log("Duration: 30 days");
  console.log("Can access: Cargo value, Location history");
  console.log("Cannot modify: No update permissions");

  // After claim resolved, revoke access
  // await contract.revokeAuthorization(cargoId, insuranceAddress);
}

handleInsuranceClaim(1, {
  insuranceAddress: "0xInsuranceCo",
  claimAmount: 5000,
  claimReason: "Damage during transit"
});
```

## Code Snippets

### Snippet 1: Error Handling Template

```javascript
async function safeCargoOperation(operation) {
  try {
    const result = await operation();
    return { success: true, data: result };
  } catch (error) {
    if (error.code === "INSUFFICIENT_FUNDS") {
      console.error("Insufficient ETH for gas");
      return { success: false, error: "Insufficient balance" };
    }
    if (error.reason === "Cannot ship to yourself") {
      console.error("Cannot ship to same address");
      return { success: false, error: "Invalid receiver" };
    }
    if (error.reason === "Not authorized for this action") {
      console.error("Insufficient permissions");
      return { success: false, error: "Access denied" };
    }
    return { success: false, error: error.message };
  }
}

// Usage
const result = await safeCargoOperation(() =>
  contract.updateLocation(1, 40.7128, 74.0060, 1)
);

if (result.success) {
  console.log("Location updated");
} else {
  console.error("Failed:", result.error);
}
```

### Snippet 2: Event Listener Setup

```javascript
class CargoEventListener {
  constructor(contract) {
    this.contract = contract;
    this.setupListeners();
  }

  setupListeners() {
    // Listen for new cargos
    this.contract.on("CargoCreated", (cargoId, shipper, receiver) => {
      console.log(`New cargo: #${cargoId} from ${shipper} to ${receiver}`);
      this.onCargoCreated({ cargoId, shipper, receiver });
    });

    // Listen for location updates
    this.contract.on("LocationUpdated", (cargoId, updater, timestamp) => {
      console.log(`Cargo #${cargoId} location updated by ${updater}`);
      this.onLocationUpdated({ cargoId, updater, timestamp });
    });

    // Listen for authorization changes
    this.contract.on("AuthorizationGranted", (cargoId, authorized) => {
      console.log(`Cargo #${cargoId} access granted to ${authorized}`);
      this.onAuthorizationGranted({ cargoId, authorized });
    });
  }

  onCargoCreated(event) {
    // Update UI, notify dashboard
  }

  onLocationUpdated(event) {
    // Update map, refresh tracking view
  }

  onAuthorizationGranted(event) {
    // Update permissions display
  }

  cleanup() {
    this.contract.removeAllListeners();
  }
}

// Usage
const listener = new CargoEventListener(contract);
// ... cleanup later
listener.cleanup();
```

---

**Last Updated**: December 2025
**Version**: 1.0.0
