# System Architecture: Private Cargo Tracking

## Table of Contents
1. [High-Level Architecture](#high-level-architecture)
2. [Component Breakdown](#component-breakdown)
3. [Data Flow](#data-flow)
4. [State Management](#state-management)
5. [Encryption Architecture](#encryption-architecture)
6. [Access Control Architecture](#access-control-architecture)
7. [Deployment Architecture](#deployment-architecture)

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     User Interface Layer                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │   Shipper    │  │  Receiver    │  │  Logistics   │           │
│  │  Dashboard   │  │  Dashboard   │  │   Portal     │           │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘           │
└─────────┼──────────────────┼─────────────────┼───────────────────┘
          │                  │                 │
          └──────────────────┼─────────────────┘
                             │
          ┌──────────────────▼───────────────────┐
          │   Web3.js / Ethers.js Layer          │
          │  - MetaMask Integration              │
          │  - Transaction Signing               │
          │  - Event Listening                   │
          └──────────────────┬───────────────────┘
                             │
          ┌──────────────────▼────────────────────────────┐
          │    Smart Contract Interface (ABI)            │
          │  - Function Calls                            │
          │  - Event Subscriptions                       │
          │  - State Queries                             │
          └──────────────────┬────────────────────────────┘
                             │
          ┌──────────────────▼────────────────────────────┐
          │  FHEVM Smart Contract                        │
          │  (PrivateCargoTracking.sol)                  │
          │                                               │
          │  ┌─────────────────────────────────────┐     │
          │  │ Cargo Management Module             │     │
          │  │ - createCargo()                     │     │
          │  │ - createBatchCargos()               │     │
          │  └─────────────────────────────────────┘     │
          │                                               │
          │  ┌─────────────────────────────────────┐     │
          │  │ Location Tracking Module            │     │
          │  │ - updateLocation()                  │     │
          │  │ - getLatestLocation()               │     │
          │  │ - getLocationCount()                │     │
          │  └─────────────────────────────────────┘     │
          │                                               │
          │  ┌─────────────────────────────────────┐     │
          │  │ Authorization Module                │     │
          │  │ - grantAuthorization()              │     │
          │  │ - revokeAuthorization()             │     │
          │  │ - checkAuthorization()              │     │
          │  └─────────────────────────────────────┘     │
          │                                               │
          │  ┌─────────────────────────────────────┐     │
          │  │ FHEVM Operations Layer              │     │
          │  │ - FHE.asEuint32()                   │     │
          │  │ - FHE.add(), FHE.sub()              │     │
          │  │ - FHE.eq(), FHE.lt()                │     │
          │  │ - FHE.allow(), FHE.allowThis()      │     │
          │  └─────────────────────────────────────┘     │
          │                                               │
          │  ┌─────────────────────────────────────┐     │
          │  │ Event Emission                      │     │
          │  │ - CargoCreated                      │     │
          │  │ - LocationUpdated                   │     │
          │  │ - StatusChanged                     │     │
          │  │ - AuthorizationGranted/Revoked      │     │
          │  └─────────────────────────────────────┘     │
          └──────────────────┬────────────────────────────┘
                             │
          ┌──────────────────▼─────────────────────────────┐
          │   Ethereum Sepolia Network (FHEVM-Enabled)     │
          │  - Smart Contract State                        │
          │  - Encrypted Data Storage                      │
          │  - Transaction Logs                            │
          │  - Event Records                               │
          └──────────────────────────────────────────────┘
```

## Component Breakdown

### 1. Frontend Layer

#### Components
```
Dashboard
├─ Cargo Management UI
│  ├─ Create Cargo Form
│  ├─ Cargo List Display
│  └─ Cargo Detail View
├─ Location Tracking
│  ├─ Location History
│  ├─ Map Integration
│  └─ Status Timeline
├─ Permission Management
│  ├─ Grant Authorization Form
│  ├─ Revoke Permission Interface
│  └─ Permission Status Display
└─ Real-Time Updates
   ├─ Event Listeners
   ├─ Notification System
   └─ Auto-Refresh
```

#### Technologies
- HTML5 / CSS3
- Vanilla JavaScript
- Ethers.js for Web3
- MetaMask for wallet

### 2. Smart Contract Layer

#### PrivateCargoTracking.sol (367 lines)

**State Variables**:
```
owner (address)
nextCargoId (uint32)

Mappings:
├─ cargos[cargoId] → CargoInfo
├─ locations[cargoId][index] → Location
├─ authorizations[cargoId][user] → Authorization
├─ shipperCargos[address] → uint32[]
└─ receiverCargos[address] → uint32[]
```

**Functions**: 13 public/external functions
**Events**: 5 event types
**Modifiers**: 3 access control modifiers

### 3. FHEVM Integration Layer

#### Encryption Operations
```
Input (Plaintext)
    ↓
FHE.asEuint32/asEuint8 (Encrypt)
    ↓
Encrypted Value (euint32/euint8)
    ↓
Operations: add, sub, mul, eq, lt, etc.
    ↓
Encrypted Result
    ↓
FHE.allow/allowThis (Set ACL)
    ↓
Storage (On-chain encrypted)
```

#### Access Control Layer
```
User Request
    ↓
Check FHE.allow() access
    ↓
  Yes → Decrypt & Process
    ↓
No → Deny Access Error
```

## Data Flow

### Flow 1: Create Cargo

```
User Input
├─ Weight: 1000
├─ Category: 2
├─ Value: 50000
├─ Priority: 5
└─ Receiver: 0x...

        ↓

Web3.js (ethers.js)
├─ Create transaction
├─ Sign with MetaMask
└─ Send to contract

        ↓

Smart Contract: createCargo()
├─ Validate inputs
├─ Encrypt all sensitive data
│  ├─ weight → euint32
│  ├─ category → euint8
│  ├─ value → euint32
│  └─ priority → euint8
├─ Set ACL permissions
│  ├─ FHE.allowThis() - contract access
│  ├─ FHE.allow(shipper) - shipper access
│  └─ FHE.allow(receiver) - receiver access
├─ Store in mappings
├─ Initialize location (status 0)
└─ Emit CargoCreated event

        ↓

Ethereum State Update
├─ Update nextCargoId
├─ Store encrypted cargo
└─ Store location history

        ↓

Frontend Update
├─ Listen for CargoCreated event
├─ Update dashboard
└─ Display confirmation
```

### Flow 2: Update Location

```
User Input
├─ Cargo ID: 1
├─ Latitude: 40.7128
├─ Longitude: 74.0060
└─ Status: 1 (In Transit)

        ↓

Authorization Check
├─ Is shipper? → Allow
├─ Is receiver? → Allow
├─ Has "update" permission? → Check expiration
└─ Otherwise → Deny

        ↓

Smart Contract: updateLocation()
├─ Encrypt coordinates
│  ├─ latitude → euint32
│  ├─ longitude → euint32
│  └─ status → euint8
├─ Set ACL for shipper/receiver
├─ Append to location array
├─ Emit LocationUpdated event
└─ Emit StatusChanged event

        ↓

Event Listeners
├─ Shipper dashboard: See update
├─ Receiver dashboard: See update
├─ Authorized parties: See update
└─ History maintained
```

### Flow 3: Grant Authorization

```
User Input
├─ Cargo ID: 1
├─ Target Address: 0x...
├─ Permissions:
│  ├─ View: true
│  ├─ Track: true
│  └─ Update: false
└─ Expiration: 7 days

        ↓

Authorization Check
└─ Must be shipper or receiver

        ↓

Smart Contract: grantAuthorization()
├─ Create Authorization struct
├─ If view enabled:
│  └─ FHE.allow(encData, targetAddress)
├─ If track enabled:
│  └─ FHE.allow(locations[], targetAddress)
├─ Store authorization
└─ Emit AuthorizationGranted event

        ↓

Third Party Access
├─ Can call getCargoInfo() if view
├─ Can call getLatestLocation() if track
├─ Can call updateLocation() if update
└─ Access expires at timestamp
```

## State Management

### Persistent State on Blockchain

```solidity
// Global counters
uint32 public nextCargoId;        // Auto-increments
address public owner;            // Set at deployment

// Cargo data (encrypted)
mapping(uint32 => CargoInfo) public cargos;
  └─ weight (euint32)
  └─ category (euint8)
  └─ value (euint32)
  └─ priority (euint8)
  └─ exists (bool)
  └─ shipper (address)
  └─ receiver (address)
  └─ timestamp (uint256)

// Location history (encrypted)
mapping(uint32 => Location[]) public locations;
  └─ [0...N] locations with:
     ├─ latitude (euint32)
     ├─ longitude (euint32)
     ├─ status (euint8)
     ├─ timestamp (uint256)
     └─ updater (address)

// Authorizations
mapping(uint32 => mapping(address => Authorization)) public authorizations;
  └─ [cargoId][user]:
     ├─ canView (bool)
     ├─ canTrack (bool)
     ├─ canUpdate (bool)
     └─ expiresAt (uint256)

// User's cargos
mapping(address => uint32[]) public shipperCargos;    // Lists by shipper
mapping(address => uint32[]) public receiverCargos;   // Lists by receiver
```

### Transient State (Frontend)

```javascript
{
  "connectedAddress": "0x...",
  "connectedNetwork": "sepolia",
  "userRole": "shipper", // or "receiver", "logistics"
  "selectedCargo": 1,
  "filteredCargos": [...],
  "pendingTransactions": [...]
}
```

## Encryption Architecture

### Encryption Levels

```
┌─────────────────────────────┐
│   Level 1: Transport        │
│   HTTPS TLS encryption      │
│   (Browser ↔ Server)        │
└────────────┬────────────────┘
             │
┌────────────▼────────────────┐
│   Level 2: Transaction      │
│   MetaMask private key      │
│   (Sign transactions)       │
└────────────┬────────────────┘
             │
┌────────────▼────────────────────────────────────┐
│   Level 3: FHEVM Encryption                     │
│   FHE.asEuint32(plainValue)                     │
│   All sensitive data encrypted at contract      │
│   Operations on ciphertexts                     │
└────────────┬─────────────────────────────────────┘
             │
┌────────────▼────────────────────────────────────┐
│   Level 4: Blockchain Storage                   │
│   Encrypted values stored permanently           │
│   Only authorized parties can decrypt           │
└──────────────────────────────────────────────────┘
```

### Encrypted vs. Plaintext Data

**Encrypted (Hidden)**:
- Cargo weight (euint32)
- Cargo category (euint8)
- Cargo value (euint32)
- Cargo priority (euint8)
- Location latitude (euint32)
- Location longitude (euint32)
- Delivery status (euint8)

**Plaintext (Public)**:
- Cargo ID (uint32)
- Shipper address (address)
- Receiver address (address)
- Timestamps (uint256)
- Updater addresses (address)

## Access Control Architecture

### Multi-Level Authorization

```
                    Shipper
                      │
                      ├─→ Full Access
                      │   ├─ View
                      │   ├─ Track
                      │   └─ Update
                      │
        ┌─────────────┴─────────────┐
        │                           │
    Receiver                    Third Party
        │                           │
        ├─→ Full Access            └─→ Limited Access
        │   ├─ View                    ├─ View (if granted)
        │   ├─ Track                   ├─ Track (if granted)
        │   └─ Update                  └─ Update (if granted)
        │                                  └─ Expires at timestamp
```

### Authorization Logic

```javascript
canAccess(cargo, user, action) {
  // Check 1: Is cargo party (shipper/receiver)?
  if (isCargoParty(cargo, user)) {
    return true; // Full access always
  }

  // Check 2: Authorization exists?
  const auth = authorizations[cargo.id][user];
  if (!auth) {
    return false; // No authorization
  }

  // Check 3: Not expired?
  if (auth.expiresAt <= now()) {
    return false; // Expired
  }

  // Check 4: Has specific permission?
  switch(action) {
    case "view":   return auth.canView;
    case "track":  return auth.canTrack;
    case "update": return auth.canUpdate;
    default:       return false;
  }
}
```

## Deployment Architecture

### Network Topology

```
┌──────────────────────────────────────────────┐
│        Application Server (Vercel)           │
│  - Frontend static files                     │
│  - MetaMask integration                      │
│  - User interface                            │
└────────────────┬─────────────────────────────┘
                 │ HTTPS
                 │
┌────────────────▼──────────────────────────────┐
│   Ethereum Network (Sepolia Testnet)          │
│                                               │
│  ┌────────────────────────────────────────┐   │
│  │  Smart Contract                        │   │
│  │  Address: 0x1846d67Dcf544B374D59F6d9a9│   │
│  │                                        │   │
│  │  ┌──────────────────────────────────┐ │   │
│  │  │ FHEVM Virtual Machine            │ │   │
│  │  │ - Encryption/Decryption          │ │   │
│  │  │ - Operations on encrypted data   │ │   │
│  │  └──────────────────────────────────┘ │   │
│  │                                        │   │
│  │  ┌──────────────────────────────────┐ │   │
│  │  │ Blockchain State                 │ │   │
│  │  │ - Cargos                         │ │   │
│  │  │ - Locations                      │ │   │
│  │  │ - Authorizations                 │ │   │
│  │  └──────────────────────────────────┘ │   │
│  └────────────────────────────────────────┘   │
│                                               │
│  Distributed across:                          │
│  - Validator nodes                            │
│  - Archive nodes                              │
│  - RPC providers (Infura, Alchemy, etc.)      │
└───────────────────────────────────────────────┘
```

### Deployment Timeline

```
Step 1: Local Development
├─ Compile contracts
├─ Run unit tests
├─ Deploy to local node
└─ Test functionality

Step 2: Sepolia Testnet
├─ Deploy to Sepolia
├─ Verify contract on Etherscan
├─ Run integration tests
└─ Test with real network

Step 3: Frontend Deployment
├─ Build frontend assets
├─ Deploy to Vercel
├─ Update contract address
└─ Configure environment

Step 4: Production Readiness
├─ Security audit
├─ Performance testing
├─ Gas optimization
└─ Documentation complete
```

## Scalability Considerations

### Current Limitations

1. **Location History Growth**
   - Unbounded array per cargo
   - Consider pagination or archiving
   - Gas costs increase with updates

2. **User Shipment Lists**
   - Array grows with each shipment
   - Query becomes expensive
   - Recommend off-chain indexing

3. **Batch Operations**
   - Limited to 50 items per transaction
   - Larger batches hit gas limits

### Optimization Strategies

1. **Off-Chain Indexing**
   - Use The Graph for indexing
   - Fast queries without on-chain load

2. **Data Archiving**
   - Move old locations to separate contract
   - Keep active data on-chain

3. **Pagination**
   - Implement chunked queries
   - Load location history in pages

---

**Last Updated**: December 2025
**Version**: 1.0.0
