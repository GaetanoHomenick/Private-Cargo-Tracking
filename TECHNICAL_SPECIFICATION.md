# Technical Specification: Private Cargo Tracking Smart Contract

## 1. Overview

This document provides comprehensive technical specifications for the Private Cargo Tracking smart contract deployed on Ethereum Sepolia testnet. The contract implements a privacy-preserving cargo tracking system using FHEVM (Fully Homomorphic Encryption Virtual Machine).

**Smart Contract Version**: 1.0.0
**Solidity Version**: ^0.8.24
**FHEVM Library**: @fhevm/solidity
**Network**: Ethereum Sepolia

## 2. Data Structures

### 2.1 CargoInfo Structure

```solidity
struct CargoInfo {
    euint32 weight;           // Encrypted cargo weight in kg
    euint8 category;          // Encrypted category (0-255)
    euint32 value;            // Encrypted value in USD cents
    euint8 priority;          // Encrypted priority level (0-10)
    bool exists;              // Boolean flag for existence check
    address shipper;          // Cargo originating party
    address receiver;         // Cargo destination party
    uint256 timestamp;        // Creation timestamp
}
```

**Purpose**: Stores core cargo metadata with all sensitive attributes encrypted.

**Encryption Types**:
- `euint32`: 32-bit encrypted integers for weight/value and coordinates
- `euint8`: 8-bit encrypted integers for categories and status codes
- `bool`: Unencrypted existence flag for access control
- `address`: Plaintext party addresses for authorization

**Storage Pattern**: Indexed by cargo ID in mapping `cargos[uint32]`

### 2.2 Location Structure

```solidity
struct Location {
    euint32 latitude;         // Encrypted GPS latitude
    euint32 longitude;        // Encrypted GPS longitude
    euint8 status;            // Encrypted delivery status
    uint256 timestamp;        // Location update timestamp
    address updater;          // Address that updated this location
}
```

**Purpose**: Represents a single location update in cargo's journey.

**Status Codes**:
- `0`: Pending shipment (not yet dispatched)
- `1`: In transit (active delivery)
- `2`: Arrived at destination (pre-delivery)
- `3`: Delivered (complete)

**Storage Pattern**: Array stored in `locations[cargoId][]`

**History**: Complete history maintained; no deletions or overwrites

### 2.3 Authorization Structure

```solidity
struct Authorization {
    bool canView;             // Permission to view cargo details
    bool canTrack;            // Permission to access location data
    bool canUpdate;           // Permission to update location/status
    uint256 expiresAt;        // Unix timestamp for expiration
}
```

**Purpose**: Defines granular access rights for third parties.

**Permission Types**:
- `canView`: Access cargo weight, category, value, priority
- `canTrack`: Access current and historical location data
- `canUpdate`: Add new location updates to cargo

**Expiration**: Automatically invalidates after specified timestamp

**Storage Pattern**: Double mapping `authorizations[cargoId][authorizedAddress]`

## 3. State Variables

### 3.1 Mappings

```solidity
// Primary cargo storage
mapping(uint32 => CargoInfo) public cargos;

// Location history per cargo
mapping(uint32 => Location[]) public locations;

// Authorization registry
mapping(uint32 => mapping(address => Authorization)) public authorizations;

// Shipper's outgoing shipments
mapping(address => uint32[]) public shipperCargos;

// Receiver's incoming shipments
mapping(address => uint32[]) public receiverCargos;
```

### 3.2 Counter Variables

```solidity
address public owner;           // Contract owner (deployer)
uint32 public nextCargoId;      // Auto-incrementing cargo ID counter
```

**Initialization**: `owner` set in constructor; `nextCargoId` starts at 1

**Usage**: `nextCargoId` auto-incremented on each cargo creation

## 4. Core Functions

### 4.1 Cargo Creation

#### `createCargo()`
```solidity
function createCargo(
    uint32 _weight,
    uint8 _category,
    uint32 _value,
    uint8 _priority,
    address _receiver
) public returns (uint32)
```

**Purpose**: Initialize a new encrypted cargo shipment

**Parameters**:
- `_weight`: Plaintext weight (encrypted internally)
- `_category`: Plaintext category code (encrypted internally)
- `_value`: Plaintext value in cents (encrypted internally)
- `_priority`: Plaintext priority 0-10 (encrypted internally)
- `_receiver`: Address of destination party

**Validations**:
- Receiver address must not be zero address
- Receiver must differ from shipper (msg.sender)
- All arrays must be non-empty for batch operations

**FHEVM Operations**:
```solidity
// Encryption
euint32 encWeight = FHE.asEuint32(_weight);
euint8 encCategory = FHE.asEuint8(_category);
// ... additional encryptions

// ACL Setup
FHE.allowThis(encWeight);           // Allow contract access
FHE.allow(encWeight, msg.sender);   // Allow shipper
FHE.allow(encWeight, _receiver);    // Allow receiver
```

**Side Effects**:
- New cargo added to mapping
- Shipper registered in `shipperCargos`
- Receiver registered in `receiverCargos`
- Initial location created with status 0
- `CargoCreated` event emitted

**Returns**: Assigned cargo ID (uint32)

**Gas Estimation**: ~500,000 gas (high due to FHEVM operations)

#### `createBatchCargos()`
```solidity
function createBatchCargos(
    uint32[] memory _weights,
    uint8[] memory _categories,
    uint32[] memory _values,
    uint8[] memory _priorities,
    address[] memory _receivers
) external returns (uint32[] memory)
```

**Purpose**: Bulk cargo creation for logistics operations

**Constraints**:
- All arrays must have identical length
- Maximum batch size: 50 items
- Minimum batch size: 1 item

**Returns**: Array of assigned cargo IDs

**Use Case**: Logistics company creates 20-50 shipments in single transaction

### 4.2 Location Management

#### `updateLocation()`
```solidity
function updateLocation(
    uint32 _cargoId,
    uint32 _latitude,
    uint32 _longitude,
    uint8 _status
) external cargoExists(_cargoId) onlyAuthorized(_cargoId, "update")
```

**Purpose**: Add new location point to cargo's tracking history

**Parameters**:
- `_cargoId`: Target cargo identifier
- `_latitude`: GPS latitude (encrypted)
- `_longitude`: GPS longitude (encrypted)
- `_status`: New delivery status code

**Access Control**:
- Cargo must exist
- Caller must have "update" authorization OR be shipper/receiver

**FHEVM Operations**:
- Encrypts latitude and longitude
- Sets ACL for shipper and receiver
- Records updater address in plaintext

**Side Effects**:
- New Location appended to history array
- `LocationUpdated` event emitted
- `StatusChanged` event emitted
- No overwrites; full history preserved

**Note**: History grows indefinitely; consider pagination for UI

#### `_updateLocation()` (Internal)
Private function implementing location update logic. Called by:
- `updateLocation()` - External updates
- `createCargo()` - Initial location setup
- `emergencyStatusUpdate()` - Owner overrides

### 4.3 Authorization Management

#### `grantAuthorization()`
```solidity
function grantAuthorization(
    uint32 _cargoId,
    address _authorized,
    bool _canView,
    bool _canTrack,
    bool _canUpdate,
    uint256 _expiresAt
) external cargoExists(_cargoId)
```

**Purpose**: Grant specific permissions to third party

**Parameters**:
- `_cargoId`: Target cargo
- `_authorized`: Address receiving permissions
- `_canView`: Allow viewing cargo specifications
- `_canTrack`: Allow accessing location history
- `_canUpdate`: Allow posting location updates
- `_expiresAt`: Unix timestamp for automatic expiration

**Caller Restrictions**: Must be shipper or receiver of cargo

**Validations**:
- Authorized address must not be zero
- Expiration timestamp must be future time
- Caller must be cargo party

**FHEVM ACL Operations**:
```solidity
if (_canView) {
    FHE.allow(cargo.weight, _authorized);
    FHE.allow(cargo.category, _authorized);
    FHE.allow(cargo.value, _authorized);
    FHE.allow(cargo.priority, _authorized);
}

if (_canTrack && locations[_cargoId].length > 0) {
    for (uint i = 0; i < locations[_cargoId].length; i++) {
        FHE.allow(locations[_cargoId][i].latitude, _authorized);
        FHE.allow(locations[_cargoId][i].longitude, _authorized);
        FHE.allow(locations[_cargoId][i].status, _authorized);
    }
}
```

**Side Effects**:
- Creates or overwrites authorization record
- Grants FHE access if view/track enabled
- `AuthorizationGranted` event emitted

**Important**: Historical locations not retroactively updated; new locations will include authorized addresses

#### `revokeAuthorization()`
```solidity
function revokeAuthorization(
    uint32 _cargoId,
    address _authorized
) external cargoExists(_cargoId)
```

**Purpose**: Instantly remove permissions from third party

**Caller Restrictions**: Must be shipper or receiver

**Side Effects**:
- Deletes authorization record
- FHE access NOT revoked (architectural limitation)
- `AuthorizationRevoked` event emitted

**Note**: Revocation is immediate but data already disclosed cannot be "un-encrypted"

### 4.4 Query Functions

#### `getCargoInfo()`
```solidity
function getCargoInfo(uint32 _cargoId)
external view cargoExists(_cargoId) onlyAuthorized(_cargoId, "view")
returns (address shipper, address receiver, uint256 timestamp, uint256 locationCount)
```

**Purpose**: Retrieve authorized cargo metadata

**Returns**: Only non-encrypted fields:
- Shipper address
- Receiver address
- Creation timestamp
- Number of location updates

**Note**: Encrypted values (weight, value, etc.) cannot be returned from view functions per FHEVM architecture

#### `getLatestLocation()`
```solidity
function getLatestLocation(uint32 _cargoId)
external view cargoExists(_cargoId) onlyAuthorized(_cargoId, "track")
returns (uint256 timestamp, address updater)
```

**Purpose**: Access current location timestamp and updater

**Returns**: Only metadata; encrypted coordinates not returned

**Validation**: At least one location must exist

#### `checkAuthorization()`
```solidity
function checkAuthorization(uint32 _cargoId, address _user)
external view cargoExists(_cargoId)
returns (bool canView, bool canTrack, bool canUpdate, uint256 expiresAt, bool isExpired)
```

**Purpose**: Verify user's current authorization level

**Logic**:
- Returns full permissions if user is cargo party
- Checks expiration against `block.timestamp`
- Returns all permission flags

**Use Case**: UI authorization checks before showing update forms

#### `getShipperCargos()`
```solidity
function getShipperCargos(address _shipper) external view returns (uint32[] memory)
```

**Purpose**: List all shipments created by address

#### `getReceiverCargos()`
```solidity
function getReceiverCargos(address _receiver) external view returns (uint32[] memory)
```

**Purpose**: List all shipments received by address

#### `getLocationCount()`
```solidity
function getLocationCount(uint32 _cargoId)
external view cargoExists(_cargoId) returns (uint256)
```

**Purpose**: Retrieve number of location updates (without fetching array)

### 4.5 Admin Functions

#### `emergencyStatusUpdate()`
```solidity
function emergencyStatusUpdate(
    uint32 _cargoId,
    uint32 _latitude,
    uint32 _longitude,
    uint8 _status
) external onlyOwner cargoExists(_cargoId)
```

**Purpose**: Owner override for critical logistics situations

**Access**: Only contract owner

**Use Cases**:
- System recovery from transaction failures
- Emergency rerouting
- Dispute resolution

## 5. Events

### 5.1 Event Definitions

```solidity
event CargoCreated(uint32 indexed cargoId, address indexed shipper, address indexed receiver, uint256 timestamp);
event LocationUpdated(uint32 indexed cargoId, address indexed updater, uint256 timestamp);
event StatusChanged(uint32 indexed cargoId, uint8 newStatus, uint256 timestamp);
event AuthorizationGranted(uint32 indexed cargoId, address indexed authorized, address indexed grantor);
event AuthorizationRevoked(uint32 indexed cargoId, address indexed revoked, address indexed revoker);
```

### 5.2 Event Indexing Strategy

- **Indexed Parameters**: cargoId, addresses for efficient off-chain filtering
- **Block Explorer Support**: All events searchable via Etherscan
- **Listening**: Frontend can subscribe to real-time events via ethers.js

## 6. Access Control Patterns

### 6.1 Modifiers

#### `onlyOwner()`
```solidity
modifier onlyOwner() {
    require(msg.sender == owner, "Not authorized");
    _;
}
```

#### `cargoExists(uint32 _cargoId)`
```solidity
modifier cargoExists(uint32 _cargoId) {
    require(cargos[_cargoId].exists, "Cargo does not exist");
    _;
}
```

#### `onlyAuthorized(uint32 _cargoId, string memory _action)`
```solidity
modifier onlyAuthorized(uint32 _cargoId, string memory _action) {
    require(_isAuthorized(_cargoId, msg.sender, _action), "Not authorized for this action");
    _;
}
```

### 6.2 Authorization Logic

#### `_isAuthorized()`
```solidity
function _isAuthorized(uint32 _cargoId, address _user, string memory _action)
internal view returns (bool)
```

**Logic Flow**:
1. Check if user is cargo party (automatic permission)
2. Check authorization record existence
3. Verify expiration (return false if expired)
4. Check specific permission flags
5. Return true/false

#### `_isCargoParty()`
```solidity
function _isCargoParty(uint32 _cargoId, address _user) internal view returns (bool)
```

**Logic**: `_user == cargo.shipper || _user == cargo.receiver`

## 7. Gas Optimization Considerations

### High-Cost Operations
- **Cargo Creation**: ~500k gas (FHEVM encryption)
- **Location Update**: ~400k gas (coordinate encryption + ACL)
- **Batch Creation** (50 items): ~10M gas

### Cost Savings
- **Array Access**: O(1) lookup via cargoId mapping
- **Location History**: No pagination in contract (handle in UI)
- **Authorization Check**: Cached in storage mapping

### Recommendations
- Batch operations preferred for bulk logistics
- Consider pagination middleware for large shipment lists
- Monitor gas usage during production deployment

## 8. Security Considerations

### 8.1 Known Limitations

1. **View Function Constraint**: Cannot return encrypted values due to FHEVM architecture
2. **Retroactive Authorization**: Historical locations not updated when new users authorized
3. **Location History Growth**: Unbounded array; consider archiving old shipments
4. **Emergency Override**: Owner has unilateral update capability

### 8.2 Threat Model

| Threat | Mitigation |
|--------|-----------|
| Unauthorized access | Access control modifiers + authorization checks |
| Data tampering | Immutable blockchain + cryptographic proofs |
| Front-running | Location timestamps trusted (race conditions possible) |
| Malicious owner | Community governance could remove/upgrade owner |
| Replay attacks | Blockchain handles via nonce + chainId |

### 8.3 FHEVM Security Properties

- **Encryption**: All sensitive values encrypted at storage
- **Key Management**: Handled by Zama infrastructure
- **No Plaintext Exposure**: Computations on ciphertexts
- **Access Control**: ACL enforced by FHE virtual machine

## 9. Configuration

### Network Parameters
- **Chain ID**: Sepolia (11155111)
- **Contract Address**: 0x1846d67Dcf544B374D59F6d9a9adE4e37719D57A
- **FHEVM Config**: SepoliaConfig from @fhevm/solidity

### FHEVM Library Integration
```solidity
import { FHE, euint32, euint8, ebool } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";
```

## 10. Upgradability

**Current Version**: Immutable deployment

**Future Considerations**:
- Proxy pattern for feature additions
- Storage layout compatibility
- Backward compatibility for authorization data

---

**Last Updated**: December 2025
**Specification Version**: 1.0.0
