# FHEVM Concepts and Educational Guide

## Table of Contents
1. [Introduction to Fully Homomorphic Encryption](#introduction)
2. [FHEVM Basics](#fhevm-basics)
3. [Encrypted Data Types](#encrypted-data-types)
4. [Operations on Encrypted Data](#operations-on-encrypted-data)
5. [Access Control Lists (ACL)](#access-control-lists)
6. [Common Patterns](#common-patterns)
7. [Anti-Patterns to Avoid](#anti-patterns-to-avoid)

## Introduction to Fully Homomorphic Encryption

### What is Fully Homomorphic Encryption?

**Traditional Encryption Model**:
```
Plain Data → Encrypt → Send/Store → Decrypt → Process → Re-encrypt
                      (Can't process while encrypted)
```

**Fully Homomorphic Encryption Model**:
```
Plain Data → Encrypt → Process (encrypted) → Send/Store → Decrypt
                      (Can process without decryption!)
```

### Why It Matters

#### Problem in Supply Chain
```
Traditional System:
┌─────────────────────────────────────────┐
│ Company A                               │
│ - Creates shipment                      │
│ - Cargo info must be decrypted to:      │
│   - Update status                       │
│   - Verify location                     │
│   - Check compliance                    │
│ - Decryption = Vulnerability!           │
└─────────────────────────────────────────┘
              ↓ (Exposed Data)
┌─────────────────────────────────────────┐
│ Logistics Provider                      │
│ - Can see weight, value, category      │
│ - Information leaked to competitors    │
│ - Security breach possible              │
└─────────────────────────────────────────┘
```

#### FHEVM Solution
```
┌─────────────────────────────────────────┐
│ Company A (Shipper)                     │
│ - Creates encrypted shipment            │
│ - Cargo always encrypted                │
│ - Can decrypt own data                  │
└─────────────────────────────────────────┘
              ↓ (Encrypted)
┌─────────────────────────────────────────┐
│ Smart Contract                          │
│ - Processes encrypted values            │
│ - No plaintext exists                   │
│ - Computations on ciphertexts           │
└─────────────────────────────────────────┘
              ↓ (Encrypted)
┌─────────────────────────────────────────┐
│ Logistics Provider                      │
│ - Sees only what authorized             │
│ - Cannot see other info                 │
│ - Information secure                    │
└─────────────────────────────────────────┘
```

### Key Benefits

1. **End-to-End Encryption**: Data encrypted from creation to storage
2. **Computations on Encrypted Data**: Process without decryption
3. **Zero-Knowledge Verification**: Prove facts without revealing details
4. **Regulatory Compliance**: GDPR/HIPAA naturally satisfied

## FHEVM Basics

### What is FHEVM?

**FHEVM** = Fully Homomorphic Encryption Virtual Machine

- Extends Ethereum smart contracts
- Enables encrypted computations
- Deployed on Zama's Sepolia testnet
- Compatible with Solidity

### FHEVM Architecture

```
┌──────────────────────────────────┐
│  Smart Contract (Solidity)       │
│  - Normal code                   │
│  - FHEVM extension calls         │
└────────────┬─────────────────────┘
             │
┌────────────▼─────────────────────┐
│  FHEVM Runtime                   │
│  - Encryption/Decryption         │
│  - Operations on encrypted data  │
│  - Access control                │
└────────────┬─────────────────────┘
             │
┌────────────▼─────────────────────┐
│  Blockchain State                │
│  - Encrypted values storage      │
│  - ACL management                │
│  - Event logging                 │
└──────────────────────────────────┘
```

### How FHEVM Differs from Regular Ethereum

| Feature | Regular EVM | FHEVM |
|---------|-----------|-------|
| Data Privacy | Plaintext stored | Encrypted stored |
| Computation | On plaintext | On ciphertexts |
| Visibility | Anyone can read | ACL controlled |
| Use Case | Public data | Confidential data |

## Encrypted Data Types

### Available Types

```solidity
euint8     // 8-bit encrypted integer
euint16    // 16-bit encrypted integer
euint32    // 32-bit encrypted integer
euint64    // 64-bit encrypted integer
```

### Type Selection Guide

#### euint8 (8-bit)
```solidity
// Range: 0 to 255
// Use for:
- Categories (0-255 options)
- Status codes (0-3)
- Priorities (0-10)
- Boolean flags
```

#### euint32 (32-bit)
```solidity
// Range: 0 to 4,294,967,295
// Use for:
- Weights (kg)
- Values (cents)
- Coordinates (scaled)
- Counts
```

#### euint64 (64-bit)
```solidity
// Range: 0 to 18,446,744,073,709,551,615
// Use for:
- Large monetary amounts
- Precise timestamps
- High-precision measurements
- Very large counts
```

### Creating Encrypted Values

#### From Plaintext

```solidity
uint32 plainWeight = 1000;
euint32 encWeight = FHE.asEuint32(plainWeight);
```

#### From External Input

```solidity
// Encrypted input from user
function updateWeight(
    externalEuint32 inputWeight,
    bytes calldata inputProof
) external {
    euint32 weight = FHE.fromExternal(inputWeight, inputProof);
}
```

#### From Computation Result

```solidity
euint32 result = FHE.add(value1, value2);
// result is automatically encrypted
```

## Operations on Encrypted Data

### Arithmetic Operations

#### Addition
```solidity
euint32 a = FHE.asEuint32(100);
euint32 b = FHE.asEuint32(50);
euint32 sum = FHE.add(a, b);  // = 150 (encrypted)
```

**Use Case**: Accumulate encrypted values
```solidity
totalWeight = FHE.add(totalWeight, cargoWeight);
```

#### Subtraction
```solidity
euint32 a = FHE.asEuint32(100);
euint32 b = FHE.asEuint32(30);
euint32 diff = FHE.sub(a, b);  // = 70 (encrypted)
```

**Use Case**: Track remaining capacity
```solidity
remainingCapacity = FHE.sub(maxCapacity, usedCapacity);
```

#### Multiplication
```solidity
euint32 a = FHE.asEuint32(10);
euint32 b = FHE.asEuint32(5);
euint32 prod = FHE.mul(a, b);  // = 50 (encrypted)
```

**Use Case**: Calculate costs
```solidity
totalCost = FHE.mul(unitPrice, quantity);
```

### Comparison Operations

#### Equality
```solidity
euint32 value = FHE.asEuint32(50);
euint32 target = FHE.asEuint32(50);
ebool result = FHE.eq(value, target);  // = true (encrypted)
```

**Use Case**: Verify exact values
```solidity
ebool isHighValue = FHE.eq(category, 1);
```

#### Less Than
```solidity
euint32 a = FHE.asEuint32(30);
euint32 b = FHE.asEuint32(50);
ebool result = FHE.lt(a, b);  // = true (encrypted)
```

**Use Case**: Check thresholds
```solidity
ebool isLightCargo = FHE.lt(weight, maxLightWeight);
```

#### Less Than or Equal
```solidity
ebool result = FHE.le(value, maxValue);
```

#### Greater Than
```solidity
ebool result = FHE.gt(value, minValue);
```

#### Greater Than or Equal
```solidity
ebool result = FHE.ge(value, minValue);
```

### Bitwise Operations

#### AND
```solidity
euint8 a = FHE.asEuint8(0b1010);
euint8 b = FHE.asEuint8(0b1100);
euint8 result = FHE.and(a, b);  // = 0b1000
```

#### OR
```solidity
euint8 result = FHE.or(a, b);
```

#### XOR
```solidity
euint8 result = FHE.xor(a, b);
```

## Access Control Lists (ACL)

### Understanding ACL

**ACL** = Access Control List

Defines WHO can access encrypted values.

```
Encrypted Value: euint32 cargoWeight = 1000
Access Control:
  - Owner: Can access
  - Shipper: Can access
  - Receiver: Can access
  - Anyone else: CANNOT access
```

### Grant Access with FHE.allow()

#### Allow Contract
```solidity
euint32 weight = FHE.asEuint32(1000);
FHE.allowThis(weight);  // Contract can use this value
```

#### Allow Specific User
```solidity
FHE.allow(weight, shipper);    // Shipper can decrypt
FHE.allow(weight, receiver);   // Receiver can decrypt
FHE.allow(weight, auditor);    // Auditor can decrypt
```

#### Pattern: Multi-Party Access
```solidity
function createCargo(
    uint32 _weight,
    address _receiver
) external {
    euint32 encWeight = FHE.asEuint32(_weight);

    // Contract can use
    FHE.allowThis(encWeight);

    // Shipper (msg.sender) can decrypt
    FHE.allow(encWeight, msg.sender);

    // Receiver can decrypt
    FHE.allow(encWeight, _receiver);

    // Store
    cargos[cargoId].weight = encWeight;
}
```

### Grant Transient Access

```solidity
// Temporary access during function execution
FHE.allowTransient(value, temporaryUser);
```

**Use Case**: Allow temporarily during audit
```solidity
function auditCargo(uint32 _cargoId) external {
    // Allow auditor to see this value temporarily
    FHE.allowTransient(cargos[_cargoId].weight, msg.sender);

    // Auditor can access during this transaction
    // Access revoked automatically after
}
```

### Important ACL Concepts

#### 1. Access is Permanent
```solidity
// Once granted, cannot be revoked!
FHE.allow(value, user);

// User will always be able to decrypt value
// Even if permissions revoked elsewhere
```

**Design Carefully!** Only grant access to:
- Authorized parties
- For the lifetime of the value
- When absolutely necessary

#### 2. Contract Always Needs Access
```solidity
// Contract MUST have access to use the value
FHE.allowThis(value);

// Without this:
// - Cannot read value
// - Cannot perform operations
// - Cannot return from view functions (somewhat)
```

#### 3. Different Values Different ACL
```solidity
euint32 weight = FHE.asEuint32(1000);
euint32 value = FHE.asEuint32(50000);

// Different access for each
FHE.allow(weight, shipper);      // Shipper sees weight
FHE.allow(value, shipper);       // Shipper sees value

// Insurance co sees value only
FHE.allow(value, insuranceCo);   // No weight access
```

## Common Patterns

### Pattern 1: Encrypted State Machine

```solidity
contract EncryptedStateMachine {
    enum State { Init, Active, Complete }

    euint8 state = FHE.asEuint8(0);  // Encrypted state

    function setState(uint8 newState) external {
        state = FHE.asEuint8(newState);
        FHE.allowThis(state);
    }

    function getState() external view returns (euint8) {
        return state;  // Still encrypted to caller
    }
}
```

### Pattern 2: Multi-Party Authorization

```solidity
contract MultiPartyAuth {
    euint32 value;

    function storeValue(
        uint32 _value,
        address _parties
    ) external {
        value = FHE.asEuint32(_value);

        // Each party gets access
        FHE.allowThis(value);
        for (uint i = 0; i < _parties.length; i++) {
            FHE.allow(value, _parties[i]);
        }
    }
}
```

### Pattern 3: Conditional Encryption

```solidity
contract ConditionalEncryption {
    function processIfValid(
        uint32 _value,
        uint32 _target
    ) external {
        euint32 value = FHE.asEuint32(_value);
        euint32 target = FHE.asEuint32(_target);

        // Check if values match (encrypted comparison)
        ebool matches = FHE.eq(value, target);

        if (matches) {
            // Process further
        }
    }
}
```

### Pattern 4: Accumulated Encrypted Sums

```solidity
contract AccumulatedSums {
    euint32 total;

    function addValue(uint32 amount) external {
        euint32 newAmount = FHE.asEuint32(amount);
        total = FHE.add(total, newAmount);

        FHE.allowThis(total);
    }
}
```

## Anti-Patterns to Avoid

### ❌ Anti-Pattern 1: Returning Encrypted Values from View

```solidity
// WRONG - Cannot do this
function getValue() external view returns (euint32) {
    return encryptedValue;  // Error: Cannot return encrypted
}

// CORRECT - Return only metadata
function getValue() external view returns (bool) {
    return true;  // Only returns non-encrypted
}
```

**Why**: View functions executed client-side cannot handle FHE operations

### ❌ Anti-Pattern 2: Forgetting FHE.allowThis()

```solidity
// WRONG
function computeSum() external {
    euint32 a = FHE.asEuint32(100);
    euint32 b = FHE.asEuint32(50);
    euint32 sum = FHE.add(a, b);  // Contract can't use without allowThis
}

// CORRECT
function computeSum() external {
    euint32 a = FHE.asEuint32(100);
    euint32 b = FHE.asEuint32(50);
    euint32 sum = FHE.add(a, b);
    FHE.allowThis(sum);  // Allow contract to use
}
```

### ❌ Anti-Pattern 3: Storing Unencrypted Sensitive Data

```solidity
// WRONG - Leaks information
struct Cargo {
    uint32 weight;  // Plaintext!
    uint8 category; // Plaintext!
}

// CORRECT - Encrypt sensitive data
struct Cargo {
    euint32 weight;   // Encrypted
    euint8 category;  // Encrypted
}
```

### ❌ Anti-Pattern 4: Over-Granting Permissions

```solidity
// WRONG - Everyone can access
FHE.allow(secretValue, address(0));  // Anyone can see!

// CORRECT - Specific parties only
FHE.allow(secretValue, authorizedParty);
```

### ❌ Anti-Pattern 5: Assuming Decryption Privacy

```solidity
// WRONG - Decryption is still visible on-chain
function reveal() external {
    uint32 plainValue = FHE.decrypt(encryptedValue);
    emit ValueRevealed(plainValue);  // Now public!
}

// CORRECT - Only decrypt when authorized
function revealToOwner() external onlyOwner {
    uint32 plainValue = FHE.decrypt(encryptedValue);
    // Handle privately
}
```

### ❌ Anti-Pattern 6: Comparing Encrypted Directly

```solidity
// WRONG - Cannot compare encrypted directly
if (encValue == 50) {  // Compilation error
    // ...
}

// CORRECT - Use FHE comparison
ebool matches = FHE.eq(encValue, FHE.asEuint32(50));
```

### ❌ Anti-Pattern 7: Forgetting Access Control

```solidity
// WRONG - Anyone can read after creation
function createSecret(uint32 _secret) external {
    secret = FHE.asEuint32(_secret);
    // Missing FHE.allow calls!
}

// CORRECT - Restrict access
function createSecret(uint32 _secret, address _viewer) external {
    secret = FHE.asEuint32(_secret);
    FHE.allowThis(secret);
    FHE.allow(secret, _viewer);
}
```

## Summary

| Concept | Purpose | Example |
|---------|---------|---------|
| euint32 | Store encrypted 32-bit values | Cargo weight |
| euint8 | Store encrypted 8-bit values | Cargo priority |
| FHE.add() | Add encrypted values | Total weight |
| FHE.eq() | Compare encrypted values | Check status |
| FHE.allowThis() | Let contract use value | Enable operations |
| FHE.allow() | Let user decrypt value | Grant access |
| FHE.allow() | Cannot revoke | Design carefully |
| View functions | Cannot return encrypted | Use metadata only |

---

**Last Updated**: December 2025
**For Advanced Topics**: See TECHNICAL_SPECIFICATION.md
