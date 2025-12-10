# Guide: Adding New FHEVM Examples

## Step-by-Step Guide

This guide explains how to add a new FHEVM example to the ecosystem.

---

## Step 1: Plan Your Example

### Choose Category

Determine which FHEVM concept you're demonstrating:

- **basic** - Simple FHE operations (counter, simple calculations)
- **encryption** - Encrypting values (single, multiple, batches)
- **decryption-user** - User decryption patterns
- **decryption-public** - Public decryption patterns
- **access-control** - Authorization, permissions, ACL
- **arithmetic** - FHE arithmetic (add, sub, mul, div)
- **comparison** - FHE comparisons (eq, lt, gt, le, ge)
- **advanced** - Complex patterns (blind auction, voting, etc.)

### Plan Scope

Keep examples focused:
- **One clear concept** per example
- **Minimal code** (100-300 lines of contract)
- **Complete tests** covering functionality
- **Clear documentation** explaining the concept

### Example Ideas

```
Category: basic
├── counter - Simple encrypted counter
├── increment - Increment encrypted value
└── decrement - Decrement encrypted value

Category: encryption
├── encrypt-single - Encrypt one value
├── encrypt-multiple - Encrypt multiple values
└── encrypt-batch - Batch encryption

Category: access-control
├── basic-acl - Basic FHE.allow usage
├── allowTransient - Temporary permissions
└── multi-party - Multiple authorized users

Category: arithmetic
├── addition - FHE.add operations
├── subtraction - FHE.sub operations
├── multiplication - FHE.mul operations
└── division - FHE.div operations

Category: advanced
├── blind-auction - Sealed-bid auction
├── voting - Privacy-preserving voting
└── escrow - Confidential escrow contract
```

---

## Step 2: Set Up Example Structure

### Method 1: Using Automation Script

```bash
npx ts-node scripts/create-fhevm-example.ts \
  --name my-example \
  --category basic \
  --description "Demonstrate FHE concept"
```

This creates:
```
examples/fhevm-example-basic-my-example/
├── contracts/
│   └── Example.sol
├── test/
│   └── Example.test.ts
├── scripts/
│   └── deploy.ts
├── hardhat.config.ts
├── package.json
├── tsconfig.json
└── README.md
```

### Method 2: Manual Setup

1. Clone base template:
```bash
cp -r base-template examples/fhevm-example-basic-my-example
cd examples/fhevm-example-basic-my-example
```

2. Update `package.json`:
```json
{
  "name": "fhevm-example-basic-my-example",
  "description": "Demonstrate FHE concept"
}
```

3. Install dependencies:
```bash
npm install
```

---

## Step 3: Write Smart Contract

### File: `contracts/Example.sol`

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint32, euint8 } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/**
 * @title Example Contract
 * @notice Demonstrates [FHEVM Concept]
 * @dev [Implementation details]
 * @chapter basic
 */
contract Example is SepoliaConfig {
    // State variables
    euint32 public encryptedValue;

    // Events
    event ValueUpdated(uint256 timestamp);

    /**
     * @notice Initialize encrypted value
     * @param _value Initial plaintext value
     */
    constructor(uint32 _value) {
        encryptedValue = FHE.asEuint32(_value);
        FHE.allowThis(encryptedValue);
    }

    /**
     * @notice Update encrypted value
     * @param _newValue New plaintext value
     * @dev Demonstrates [specific technique]
     */
    function updateValue(uint32 _newValue) external {
        encryptedValue = FHE.asEuint32(_newValue);
        FHE.allowThis(encryptedValue);
        emit ValueUpdated(block.timestamp);
    }
}
```

### Key Elements

**Documentation**:
```solidity
/// @title Clear title
/// @notice What user should know
/// @dev Implementation details
/// @chapter fhevm-concept
```

**FHEVM Integration**:
```solidity
import { FHE, euint32, euint8 } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";
```

**Encrypted Types**:
```solidity
euint32 myValue;      // 32-bit encrypted
euint8 mySmallValue;  // 8-bit encrypted
```

**Basic Operations**:
```solidity
// Encryption
euint32 encrypted = FHE.asEuint32(plainValue);

// Arithmetic
euint32 sum = FHE.add(a, b);
euint32 difference = FHE.sub(a, b);

// Comparison
ebool isEqual = FHE.eq(a, b);

// Access Control
FHE.allowThis(encryptedValue);
FHE.allow(encryptedValue, userAddress);
```

---

## Step 4: Write Tests

### File: `test/Example.test.ts`

```typescript
import { expect } from "chai";
import { ethers } from "hardhat";

/**
 * @fileoverview Example contract tests
 * @chapter basic
 * @example
 * // Deploy contract
 * const contract = await Example.deploy(initialValue);
 *
 * // Call function
 * await contract.updateValue(newValue);
 */
describe("Example", function () {
  let example: any;
  let owner: any;

  beforeEach(async function () {
    [owner] = await ethers.getSigners();
    const ExampleFactory = await ethers.getContractFactory("Example");
    example = await ExampleFactory.deploy(100);
    await example.deployed();
  });

  describe("Deployment", function () {
    it("Should set initial value", async function () {
      expect(await example.encryptedValue()).to.exist;
    });
  });

  describe("Update Value", function () {
    it("Should update encrypted value", async function () {
      const tx = await example.updateValue(200);
      await expect(tx).to.emit(example, "ValueUpdated");
    });
  });

  describe("Edge Cases", function () {
    it("Should handle zero value", async function () {
      await example.updateValue(0);
      expect(await example.encryptedValue()).to.exist;
    });

    it("Should handle maximum value", async function () {
      const maxValue = ethers.constants.MaxUint32;
      await example.updateValue(maxValue);
      expect(await example.encryptedValue()).to.exist;
    });
  });
});
```

### Test Requirements

- ✅ Cover normal cases
- ✅ Cover edge cases
- ✅ Cover error conditions
- ✅ Use JSDoc comments
- ✅ Include `@example` tags
- ✅ Test events
- ✅ Document gas usage (if relevant)

---

## Step 5: Create Documentation

### File: `README.md`

```markdown
# [Example Name]

## Overview

[Brief description of what this example demonstrates]

## Concepts Covered

- **[Concept 1]**: [Explanation]
- **[Concept 2]**: [Explanation]

## Key Functions

### functionName()
[Description]

## How It Works

[Step-by-step explanation]

## Usage

\`\`\`typescript
// Code example
\`\`\`

## Gas Usage

| Operation | Gas |
|-----------|-----|
| Operation 1 | 50000 |
| Operation 2 | 60000 |

## Common Pitfalls

- **Mistake 1**: [What can go wrong]
- **Mistake 2**: [What can go wrong]

## Related Examples

- [Example A](../example-a/)
- [Example B](../example-b/)

## Learn More

- [FHEVM Documentation](https://zama.ai)
- [Solidity Guide](https://docs.soliditylang.org)

## References

- Line 23-45: [Specific technique]
- Line 67-89: [Specific technique]
```

---

## Step 6: Test Everything

### Compile Contract

```bash
npm run compile
```

Expected: ✓ Compilation succeeds without errors

### Run Tests

```bash
npm test
```

Expected: ✓ All tests pass

### Verify Structure

```bash
# Check files exist
ls -la contracts/
ls -la test/
ls -la scripts/

# Verify configuration
cat hardhat.config.ts
cat package.json
```

---

## Step 7: Validate with Automation

```bash
npx ts-node scripts/validate-example.ts \
  --path ./examples/fhevm-example-basic-my-example
```

Checklist:
- ✓ Directory structure correct
- ✓ package.json valid
- ✓ hardhat.config.ts complete
- ✓ Contracts compile
- ✓ Tests pass
- ✓ README present
- ✓ JSDoc comments present
- ✓ SPDX license included

---

## Step 8: Generate Documentation

### Auto-generate Docs

```bash
npx ts-node scripts/generate-docs.ts \
  --input ./examples \
  --output ./docs
```

This creates:
- Auto-generated README
- Category documentation
- GitBook structure
- Cross-references

---

## Step 9: Document Global System

Update main documentation:

1. **INDEX.md**: Add example to navigation
2. **EXAMPLES.md**: Add code snippet
3. **EXAMPLES_STRUCTURE.md**: Update category listing

---

## Example Template Checklist

Before publishing, verify:

- [ ] Contract compiles without errors
- [ ] All tests pass
- [ ] JSDoc comments complete
- [ ] README comprehensive
- [ ] Gas usage documented (if relevant)
- [ ] Examples in README work
- [ ] Edge cases covered
- [ ] Error cases handled
- [ ] Security considerations noted
- [ ] Related examples documented
- [ ] SPDX license present
- [ ] No console.logs in production code
- [ ] No hardcoded addresses
- [ ] Proper variable naming
- [ ] Functions are minimal and focused

---

## Quick Checklist

```bash
# 1. Create
npx ts-node scripts/create-fhevm-example.ts --name my-ex --category basic

# 2. Implement
cd examples/fhevm-example-basic-my-ex
# Edit contracts/Example.sol
# Edit test/Example.test.ts
# Edit README.md

# 3. Install & Test
npm install
npm run compile
npm test

# 4. Back to root
cd ../..

# 5. Validate
npx ts-node scripts/validate-example.ts \
  --path ./examples/fhevm-example-basic-my-ex

# 6. Generate docs
npx ts-node scripts/generate-docs.ts \
  --input ./examples \
  --output ./docs

# 7. Done!
echo "✓ Example ready for submission"
```

---

## Support

- **Questions**: Check existing examples
- **Issues**: Review TROUBLESHOOTING.md
- **Validation**: Run validate-example.ts
- **Testing**: Use npm test

---

**Last Updated**: December 2025
**Version**: 1.0.0
