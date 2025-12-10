# API Reference: Private Cargo Tracking

## Complete Smart Contract API

### Table of Contents
- [Cargo Management](#cargo-management)
- [Location Tracking](#location-tracking)
- [Authorization](#authorization)
- [Query Functions](#query-functions)
- [Admin Functions](#admin-functions)
- [Events](#events)
- [Data Structures](#data-structures)

---

## Cargo Management

### `createCargo()`

**Signature**:
```solidity
function createCargo(
    uint32 _weight,
    uint8 _category,
    uint32 _value,
    uint8 _priority,
    address _receiver
) public returns (uint32)
```

**Description**: Creates a new encrypted cargo shipment with the caller as shipper.

**Parameters**:
| Parameter | Type | Required | Example | Description |
|-----------|------|----------|---------|-------------|
| `_weight` | uint32 | Yes | 1000 | Weight in kilograms |
| `_category` | uint8 | Yes | 2 | Category code (0-255) |
| `_value` | uint32 | Yes | 50000 | Value in USD cents |
| `_priority` | uint8 | Yes | 5 | Priority level (0-10) |
| `_receiver` | address | Yes | 0x... | Receiver wallet address |

**Returns**:
- `uint32`: Assigned cargo ID

**Emits**:
```solidity
event CargoCreated(
    uint32 indexed cargoId,
    address indexed shipper,
    address indexed receiver,
    uint256 timestamp
)
```

**Requires**:
- `_receiver != address(0)` - Valid receiver address
- `_receiver != msg.sender` - Cannot ship to self

**Example**:
```javascript
const cargoId = await contract.createCargo(
  1000,                    // weight: 1000 kg
  2,                       // category: 2
  50000,                   // value: $500.00
  5,                       // priority: 5/10
  "0x742d35Cc6634C0532925a3b844Bc9e7595f42D0"
);

console.log("Cargo created with ID:", cargoId);
```

**Gas Estimate**: ~500,000 gas

---

### `createBatchCargos()`

**Signature**:
```solidity
function createBatchCargos(
    uint32[] memory _weights,
    uint8[] memory _categories,
    uint32[] memory _values,
    uint8[] memory _priorities,
    address[] memory _receivers
) external returns (uint32[] memory)
```

**Description**: Creates multiple cargo shipments in a single transaction.

**Parameters**:
| Parameter | Type | Required | Max Items | Description |
|-----------|------|----------|-----------|-------------|
| `_weights` | uint32[] | Yes | 50 | Array of weights |
| `_categories` | uint8[] | Yes | 50 | Array of categories |
| `_values` | uint32[] | Yes | 50 | Array of values |
| `_priorities` | uint8[] | Yes | 50 | Array of priorities |
| `_receivers` | address[] | Yes | 50 | Array of receiver addresses |

**Returns**:
- `uint32[]`: Array of assigned cargo IDs

**Requires**:
- All arrays same length
- Length > 0 and ≤ 50
- No self-shipments

**Example**:
```javascript
const weights = [1000, 2000, 3000];
const categories = [1, 2, 3];
const values = [50000, 100000, 150000];
const priorities = [5, 7, 9];
const receivers = [addr1, addr2, addr3];

const cargoIds = await contract.createBatchCargos(
  weights, categories, values, priorities, receivers
);

console.log("Created cargos:", cargoIds);
```

**Gas Estimate**: ~1.2M gas per 10 items

---

## Location Tracking

### `updateLocation()`

**Signature**:
```solidity
function updateLocation(
    uint32 _cargoId,
    uint32 _latitude,
    uint32 _longitude,
    uint8 _status
) external
```

**Description**: Adds a new location update to cargo's tracking history.

**Parameters**:
| Parameter | Type | Required | Example | Description |
|-----------|------|----------|---------|-------------|
| `_cargoId` | uint32 | Yes | 1 | Cargo ID to update |
| `_latitude` | uint32 | Yes | 407128 | GPS latitude (scaled) |
| `_longitude` | uint32 | Yes | 740060 | GPS longitude (scaled) |
| `_status` | uint8 | Yes | 1 | Status code (0-3) |

**Status Codes**:
| Code | Status | Meaning |
|------|--------|---------|
| 0 | Pending | Not yet dispatched |
| 1 | In Transit | Active delivery |
| 2 | Arrived | At destination |
| 3 | Delivered | Shipment complete |

**Emits**:
```solidity
event LocationUpdated(
    uint32 indexed cargoId,
    address indexed updater,
    uint256 timestamp
)
event StatusChanged(
    uint32 indexed cargoId,
    uint8 newStatus,
    uint256 timestamp
)
```

**Access Control**:
- Shipper can always call
- Receiver can always call
- Third party requires "update" authorization

**Example**:
```javascript
const tx = await contract.updateLocation(
  1,          // cargoId
  407128,     // latitude
  740060,     // longitude
  1           // status: In Transit
);

await tx.wait();
console.log("Location updated");
```

**Gas Estimate**: ~400,000 gas

---

### `getLatestLocation()`

**Signature**:
```solidity
function getLatestLocation(uint32 _cargoId)
external view returns (uint256 timestamp, address updater)
```

**Description**: Retrieves the most recent location update for cargo.

**Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `_cargoId` | uint32 | Cargo ID |

**Returns**:
| Return Value | Type | Description |
|--------------|------|-------------|
| `timestamp` | uint256 | Unix timestamp of update |
| `updater` | address | Address that made update |

**Access Control**:
- Requires "track" authorization OR is cargo party

**Example**:
```javascript
const location = await contract.getLatestLocation(1);

console.log("Updated at:", new Date(location.timestamp * 1000));
console.log("Updated by:", location.updater);
```

**Gas Estimate**: ~50,000 gas (view function)

---

### `getLocationCount()`

**Signature**:
```solidity
function getLocationCount(uint32 _cargoId)
external view returns (uint256)
```

**Description**: Returns the number of location updates for cargo.

**Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `_cargoId` | uint32 | Cargo ID |

**Returns**:
- `uint256`: Number of location entries

**Example**:
```javascript
const count = await contract.getLocationCount(1);
console.log("Location updates:", count);
```

**Gas Estimate**: ~30,000 gas

---

## Authorization

### `grantAuthorization()`

**Signature**:
```solidity
function grantAuthorization(
    uint32 _cargoId,
    address _authorized,
    bool _canView,
    bool _canTrack,
    bool _canUpdate,
    uint256 _expiresAt
) external
```

**Description**: Grants specific permissions to a third party.

**Parameters**:
| Parameter | Type | Required | Example | Description |
|-----------|------|----------|---------|-------------|
| `_cargoId` | uint32 | Yes | 1 | Cargo to authorize |
| `_authorized` | address | Yes | 0x... | User to grant access |
| `_canView` | bool | Yes | true | Allow viewing specs |
| `_canTrack` | bool | Yes | true | Allow location access |
| `_canUpdate` | bool | Yes | false | Allow updates |
| `_expiresAt` | uint256 | Yes | 1702608000 | Expiration timestamp |

**Emits**:
```solidity
event AuthorizationGranted(
    uint32 indexed cargoId,
    address indexed authorized,
    address indexed grantor
)
```

**Access Control**:
- Only shipper or receiver can call

**Validates**:
- `_authorized != address(0)` - Valid address
- `_expiresAt > block.timestamp` - Future expiration

**Example**:
```javascript
const expiresAt = Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60);

const tx = await contract.grantAuthorization(
  1,                                          // cargoId
  "0x742d35Cc6634C0532925a3b844Bc9e7595f42D0", // authorized
  true,   // canView
  true,   // canTrack
  true,   // canUpdate
  expiresAt
);

await tx.wait();
console.log("Authorization granted");
```

**Gas Estimate**: ~150,000 gas

---

### `revokeAuthorization()`

**Signature**:
```solidity
function revokeAuthorization(
    uint32 _cargoId,
    address _authorized
) external
```

**Description**: Immediately removes permissions from a third party.

**Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `_cargoId` | uint32 | Cargo to revoke |
| `_authorized` | address | User losing access |

**Emits**:
```solidity
event AuthorizationRevoked(
    uint32 indexed cargoId,
    address indexed revoked,
    address indexed revoker
)
```

**Access Control**:
- Only shipper or receiver can call

**Example**:
```javascript
const tx = await contract.revokeAuthorization(
  1,
  "0x742d35Cc6634C0532925a3b844Bc9e7595f42D0"
);

await tx.wait();
console.log("Authorization revoked");
```

**Gas Estimate**: ~100,000 gas

---

### `checkAuthorization()`

**Signature**:
```solidity
function checkAuthorization(uint32 _cargoId, address _user)
external view returns (
    bool canView,
    bool canTrack,
    bool canUpdate,
    uint256 expiresAt,
    bool isExpired
)
```

**Description**: Verifies current authorization level for user.

**Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `_cargoId` | uint32 | Cargo to check |
| `_user` | address | User to verify |

**Returns**:
| Return Value | Type | Description |
|--------------|------|-------------|
| `canView` | bool | Can view specifications |
| `canTrack` | bool | Can view locations |
| `canUpdate` | bool | Can update status |
| `expiresAt` | uint256 | Expiration timestamp |
| `isExpired` | bool | Is authorization expired |

**Example**:
```javascript
const auth = await contract.checkAuthorization(1, userAddress);

console.log("Permissions:");
console.log("  View:", auth.canView);
console.log("  Track:", auth.canTrack);
console.log("  Update:", auth.canUpdate);
console.log("  Expires:", new Date(auth.expiresAt * 1000));
console.log("  Expired:", auth.isExpired);
```

**Gas Estimate**: ~50,000 gas

---

## Query Functions

### `getCargoInfo()`

**Signature**:
```solidity
function getCargoInfo(uint32 _cargoId)
external view returns (
    address shipper,
    address receiver,
    uint256 timestamp,
    uint256 locationCount
)
```

**Description**: Retrieves basic cargo information.

**Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `_cargoId` | uint32 | Cargo ID |

**Returns**:
| Return Value | Type | Description |
|--------------|------|-------------|
| `shipper` | address | Shipper address |
| `receiver` | address | Receiver address |
| `timestamp` | uint256 | Creation time |
| `locationCount` | uint256 | Number of updates |

**Access Control**:
- Requires "view" authorization OR is cargo party

**Note**: Encrypted values (weight, value, etc.) not returned due to FHEVM constraints

**Example**:
```javascript
const info = await contract.getCargoInfo(1);

console.log("Shipper:", info.shipper);
console.log("Receiver:", info.receiver);
console.log("Created:", new Date(info.timestamp * 1000));
console.log("Updates:", info.locationCount);
```

**Gas Estimate**: ~50,000 gas

---

### `getShipperCargos()`

**Signature**:
```solidity
function getShipperCargos(address _shipper)
external view returns (uint32[] memory)
```

**Description**: Lists all cargos shipped by an address.

**Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `_shipper` | address | Shipper address |

**Returns**:
- `uint32[]`: Array of cargo IDs

**Example**:
```javascript
const cargos = await contract.getShipperCargos(shipperAddress);
console.log("Shipped cargos:", cargos);
```

**Gas Estimate**: ~100,000 gas (increases with cargo count)

---

### `getReceiverCargos()`

**Signature**:
```solidity
function getReceiverCargos(address _receiver)
external view returns (uint32[] memory)
```

**Description**: Lists all cargos received by an address.

**Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `_receiver` | address | Receiver address |

**Returns**:
- `uint32[]`: Array of cargo IDs

**Example**:
```javascript
const cargos = await contract.getReceiverCargos(receiverAddress);
console.log("Received cargos:", cargos);
```

**Gas Estimate**: ~100,000 gas

---

## Admin Functions

### `emergencyStatusUpdate()`

**Signature**:
```solidity
function emergencyStatusUpdate(
    uint32 _cargoId,
    uint32 _latitude,
    uint32 _longitude,
    uint8 _status
) external onlyOwner
```

**Description**: Owner override for critical situations.

**Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `_cargoId` | uint32 | Cargo to update |
| `_latitude` | uint32 | Latitude coordinate |
| `_longitude` | uint32 | Longitude coordinate |
| `_status` | uint8 | Status code |

**Access Control**:
- Only contract owner

**Use Cases**:
- System recovery from transaction failures
- Emergency rerouting after incidents
- Dispute resolution

**Example**:
```javascript
const tx = await contract.emergencyStatusUpdate(
  1,
  407128,
  740060,
  2
);

await tx.wait();
console.log("Emergency update completed");
```

**Gas Estimate**: ~400,000 gas

---

## Events

### `CargoCreated`

**Signature**:
```solidity
event CargoCreated(
    uint32 indexed cargoId,
    address indexed shipper,
    address indexed receiver,
    uint256 timestamp
)
```

**Description**: Emitted when cargo is created.

**Indexed Parameters**: cargoId, shipper, receiver

**Example Listener**:
```javascript
contract.on("CargoCreated", (cargoId, shipper, receiver, timestamp) => {
  console.log(`Cargo ${cargoId} created`);
  console.log(`From: ${shipper}`);
  console.log(`To: ${receiver}`);
});
```

---

### `LocationUpdated`

**Signature**:
```solidity
event LocationUpdated(
    uint32 indexed cargoId,
    address indexed updater,
    uint256 timestamp
)
```

**Description**: Emitted when location is updated.

**Indexed Parameters**: cargoId, updater

**Example Listener**:
```javascript
contract.on("LocationUpdated", (cargoId, updater, timestamp) => {
  console.log(`Cargo ${cargoId} location updated`);
  console.log(`By: ${updater}`);
  console.log(`At: ${new Date(timestamp * 1000)}`);
});
```

---

### `StatusChanged`

**Signature**:
```solidity
event StatusChanged(
    uint32 indexed cargoId,
    uint8 newStatus,
    uint256 timestamp
)
```

**Description**: Emitted when cargo status changes.

**Indexed Parameters**: cargoId

**Status Meanings**:
- 0 = Pending
- 1 = In Transit
- 2 = Arrived
- 3 = Delivered

---

### `AuthorizationGranted`

**Signature**:
```solidity
event AuthorizationGranted(
    uint32 indexed cargoId,
    address indexed authorized,
    address indexed grantor
)
```

**Description**: Emitted when permission is granted.

---

### `AuthorizationRevoked`

**Signature**:
```solidity
event AuthorizationRevoked(
    uint32 indexed cargoId,
    address indexed revoked,
    address indexed revoker
)
```

**Description**: Emitted when permission is revoked.

---

## Data Structures

### CargoInfo

```solidity
struct CargoInfo {
    euint32 weight;      // Encrypted weight
    euint8 category;     // Encrypted category
    euint32 value;       // Encrypted value
    euint8 priority;     // Encrypted priority
    bool exists;         // Exists flag
    address shipper;     // Shipper address
    address receiver;    // Receiver address
    uint256 timestamp;   // Creation time
}
```

### Location

```solidity
struct Location {
    euint32 latitude;    // Encrypted latitude
    euint32 longitude;   // Encrypted longitude
    euint8 status;       // Encrypted status
    uint256 timestamp;   // Update timestamp
    address updater;     // Updater address
}
```

### Authorization

```solidity
struct Authorization {
    bool canView;       // View permission
    bool canTrack;      // Track permission
    bool canUpdate;     // Update permission
    uint256 expiresAt;  // Expiration time
}
```

---

## Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| "Cargo does not exist" | Invalid cargo ID | Use correct cargo ID |
| "Not authorized" | Owner check failed | Must be contract owner |
| "Cannot ship to yourself" | Receiver = Shipper | Specify different receiver |
| "Invalid receiver address" | Zero address | Use valid address |
| "Not authorized for this action" | Access denied | Request permission grant |
| "Expiration must be in future" | Past timestamp | Use future expiration |
| "Invalid address" | Zero address in auth | Specify valid address |
| "Only shipper or receiver..." | Not cargo party | Must be shipper/receiver |

---

**Last Updated**: December 2025
**API Version**: 1.0.0
**Network**: Ethereum Sepolia
