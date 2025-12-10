# FHEVM Examples Structure

## Overview

This document describes the organizational structure for the FHEVM Example Hub, including categories, naming conventions, and repository organization.

---

## Directory Structure

```
PrivateCargoTracking/               # Root project
├── base-template/                  # Base Hardhat template for all examples
│   ├── contracts/
│   │   └── Example.sol            # Placeholder contract
│   ├── test/
│   │   └── Example.test.ts        # Placeholder test
│   ├── scripts/
│   │   └── deploy.ts              # Deployment script
│   ├── hardhat.config.ts          # Hardhat configuration
│   ├── package.json               # Dependencies
│   ├── tsconfig.json              # TypeScript config
│   ├── .env.example               # Environment template
│   ├── .gitignore                 # Git ignore rules
│   └── README.md                  # Template documentation
│
├── examples/                       # Generated examples directory
│   ├── fhevm-example-basic-counter/
│   ├── fhevm-example-encryption-single-value/
│   ├── fhevm-example-access-control-basic/
│   └── ...                        # More examples
│
├── scripts/                        # Automation scripts
│   ├── config.json                # Configuration
│   ├── create-fhevm-example.ts    # Example generator
│   ├── generate-docs.ts           # Documentation generator
│   └── validate-example.ts        # Example validator
│
├── docs/                           # Generated documentation
│   ├── README.md                  # Documentation index
│   ├── categories/                # Category overview pages
│   │   ├── basic.md
│   │   ├── encryption.md
│   │   ├── access-control.md
│   │   └── ...
│   └── examples/                  # Individual example docs
│       ├── counter.md
│       ├── encryption.md
│       └── ...
│
└── [Documentation Files]          # Project documentation
    ├── README.md
    ├── INDEX.md
    ├── API_REFERENCE.md
    └── ...
```

---

## Categories

### 1. Basic (`basic`)

**Description**: Simple FHE operations and fundamental concepts

**Examples**:
- `fhevm-example-basic-counter` - Simple encrypted counter
- `fhevm-example-basic-increment` - Increment encrypted value
- `fhevm-example-basic-decrement` - Decrement encrypted value
- `fhevm-example-basic-state` - Basic encrypted state management

**Key Concepts**:
- euint32, euint8 encrypted types
- FHE.asEuint32() encryption
- FHE.allowThis() for contract access
- Basic state management

---

### 2. Encryption (`encryption`)

**Description**: Encrypting values with various patterns

**Examples**:
- `fhevm-example-encryption-single-value` - Encrypt one value
- `fhevm-example-encryption-multiple-values` - Encrypt multiple values
- `fhevm-example-encryption-batch` - Batch encryption operations
- `fhevm-example-encryption-types` - Different encrypted types

**Key Concepts**:
- FHE.asEuint8/16/32/64() methods
- Input encryption patterns
- Type conversions
- Batch operations

---

### 3. Decryption - User (`decryption-user`)

**Description**: User-side decryption workflows

**Examples**:
- `fhevm-example-decryption-user-basic` - Basic user decryption
- `fhevm-example-decryption-user-permission` - Permission-based decryption
- `fhevm-example-decryption-user-sealed` - Sealed bid decryption

**Key Concepts**:
- User decryption requests
- Permission management for decryption
- Sealed bid patterns
- Decryption with proof

---

### 4. Decryption - Public (`decryption-public`)

**Description**: Public decryption patterns and techniques

**Examples**:
- `fhevm-example-decryption-public-basic` - Basic public decryption
- `fhevm-example-decryption-public-threshold` - Threshold decryption
- `fhevm-example-decryption-public-reveal` - Reveal patterns

**Key Concepts**:
- Public decryption mechanisms
- Threshold schemes
- Reveal workflows
- Timing considerations

---

### 5. Access Control (`access-control`)

**Description**: Authorization, permissions, and ACL management

**Examples**:
- `fhevm-example-access-control-basic` - Basic FHE.allow usage
- `fhevm-example-access-control-allowTransient` - Temporary permissions
- `fhevm-example-access-control-multi-party` - Multiple authorized users
- `fhevm-example-access-control-expiration` - Time-limited access
- `fhevm-example-access-control-revoke` - Permission revocation

**Key Concepts**:
- FHE.allow() for granting access
- FHE.allowThis() for contract access
- FHE.allowTransient() for temporary access
- Multi-party authorization
- Revocation patterns

---

### 6. Arithmetic (`arithmetic`)

**Description**: FHE arithmetic operations

**Examples**:
- `fhevm-example-arithmetic-addition` - FHE.add operations
- `fhevm-example-arithmetic-subtraction` - FHE.sub operations
- `fhevm-example-arithmetic-multiplication` - FHE.mul operations
- `fhevm-example-arithmetic-division` - FHE.div operations
- `fhevm-example-arithmetic-combined` - Combined operations

**Key Concepts**:
- FHE.add(a, b)
- FHE.sub(a, b)
- FHE.mul(a, b)
- FHE.div(a, b)
- Operation chaining
- Overflow handling

---

### 7. Comparison (`comparison`)

**Description**: FHE comparison operations

**Examples**:
- `fhevm-example-comparison-equality` - FHE.eq operations
- `fhevm-example-comparison-less-than` - FHE.lt operations
- `fhevm-example-comparison-greater-than` - FHE.gt operations
- `fhevm-example-comparison-range` - Range checks
- `fhevm-example-comparison-min-max` - Min/max operations

**Key Concepts**:
- FHE.eq(a, b) - Equality
- FHE.ne(a, b) - Not equal
- FHE.lt(a, b) - Less than
- FHE.gt(a, b) - Greater than
- FHE.le(a, b) - Less or equal
- FHE.ge(a, b) - Greater or equal
- ebool type handling

---

### 8. Advanced (`advanced`)

**Description**: Complex patterns and real-world applications

**Examples**:
- `fhevm-example-advanced-blind-auction` - Sealed-bid auction
- `fhevm-example-advanced-voting` - Privacy-preserving voting
- `fhevm-example-advanced-escrow` - Confidential escrow
- `fhevm-example-advanced-cargo-tracking` - Supply chain tracking (this project)
- `fhevm-example-advanced-lottery` - Private lottery system
- `fhevm-example-advanced-healthcare` - Medical records management

**Key Concepts**:
- State machines with encrypted states
- Multi-party workflows
- Conditional logic with encrypted data
- Real-world use cases
- Complex authorization patterns

---

## Naming Convention

All examples follow the pattern:

```
fhevm-example-{CATEGORY}-{NAME}
```

**Rules**:
1. Prefix: Always `fhevm-example-`
2. Category: One of the 8 defined categories
3. Name: Lowercase with hyphens
4. Examples:
   - ✅ `fhevm-example-basic-counter`
   - ✅ `fhevm-example-access-control-multi-party`
   - ✅ `fhevm-example-advanced-blind-auction`
   - ❌ `FHEVMExample` (wrong format)
   - ❌ `example-counter` (missing prefix)
   - ❌ `fhevm-example-counter` (missing category)

---

## Example Template Structure

Each example must contain:

```
fhevm-example-{category}-{name}/
├── contracts/
│   └── {Name}.sol              # Main contract
├── test/
│   └── {Name}.test.ts          # Test suite
├── scripts/
│   └── deploy.ts               # Deployment script
├── hardhat.config.ts           # Hardhat config (from template)
├── package.json                # Package definition
├── tsconfig.json               # TypeScript config (from template)
├── .env.example                # Environment template
├── .gitignore                  # Git ignore (from template)
└── README.md                   # Example documentation
```

---

## Documentation Requirements

### Solidity Contract

Every contract must include:

```solidity
/**
 * @title Contract Title
 * @notice User-facing description
 * @dev Technical implementation details
 * @chapter {category}
 */
contract ContractName {
    /**
     * @notice Function description
     * @param paramName Parameter description
     * @return returnDescription
     * @dev Implementation notes
     */
    function functionName(type paramName) external returns (type) {
        // Implementation
    }
}
```

### TypeScript Tests

Every test must include:

```typescript
/**
 * @fileoverview Test suite description
 * @chapter {category}
 * @example
 * // Usage example
 * const contract = await deploy();
 */
describe("ContractName", function () {
    // Tests
});
```

### README Structure

Every README must contain:

1. **Title**: Example name
2. **Overview**: What the example demonstrates
3. **Category**: Which FHEVM concept category
4. **Installation**: How to install dependencies
5. **Compile**: How to compile
6. **Test**: How to run tests
7. **Deploy**: How to deploy
8. **Key Concepts**: FHEVM concepts demonstrated
9. **Learn More**: Links to resources

---

## Quality Standards

Before publishing an example:

- [ ] Follows naming convention
- [ ] Complete directory structure
- [ ] Contract compiles without errors
- [ ] All tests pass
- [ ] JSDoc comments complete
- [ ] README comprehensive
- [ ] SPDX license included
- [ ] No console.log in production code
- [ ] No hardcoded addresses
- [ ] Proper error handling
- [ ] Gas-optimized where appropriate
- [ ] Security considerations documented

---

## Categories by Complexity

### Beginner Level
1. Basic
2. Encryption
3. Comparison

### Intermediate Level
4. Arithmetic
5. Access Control
6. Decryption - User

### Advanced Level
7. Decryption - Public
8. Advanced

---

## Example Relationships

Examples should reference related examples:

```markdown
## Related Examples

- [Example A](../fhevm-example-category-a/) - Related concept A
- [Example B](../fhevm-example-category-b/) - Related concept B
```

---

## Auto-Generation

Examples can be auto-generated using:

```bash
# Create single example
npx ts-node scripts/create-fhevm-example.ts \
  --name counter \
  --category basic \
  --description "Simple encrypted counter"

# Generate documentation
npx ts-node scripts/generate-docs.ts \
  --input ./examples \
  --output ./docs

# Validate example
npx ts-node scripts/validate-example.ts \
  --path ./examples/fhevm-example-basic-counter
```

---

## Documentation Generation

Documentation is auto-generated from:
- JSDoc comments in Solidity (`@title`, `@notice`, `@dev`, `@chapter`)
- TSDoc comments in TypeScript (`@fileoverview`, `@chapter`, `@example`)
- README.md content
- Test descriptions

---

## GitBook Structure

Generated documentation follows GitBook format:

```
docs/
├── README.md                    # Index page
├── SUMMARY.md                   # Table of contents
├── categories/
│   ├── README.md               # Categories overview
│   ├── basic.md
│   ├── encryption.md
│   ├── access-control.md
│   ├── arithmetic.md
│   ├── comparison.md
│   ├── decryption-user.md
│   ├── decryption-public.md
│   └── advanced.md
└── examples/
    ├── README.md               # Examples index
    ├── counter.md
    ├── encryption.md
    └── ...
```

---

## Contributing New Examples

1. **Plan**: Choose category and define scope
2. **Create**: Use automation script or manual setup
3. **Implement**: Write contract and tests
4. **Document**: Add JSDoc and README
5. **Validate**: Run validation script
6. **Submit**: Create pull request

See [ADD_NEW_EXAMPLE.md](ADD_NEW_EXAMPLE.md) for detailed guide.

---

## Statistics

Current statistics:
- **Categories**: 8
- **Examples**: 1 (Private Cargo Tracking)
- **Documentation Files**: 20+
- **Total Words**: 45,000+

---

## See Also

- [BASE_TEMPLATE_GUIDE.md](BASE_TEMPLATE_GUIDE.md) - Template documentation
- [AUTOMATION_SCRIPTS.md](AUTOMATION_SCRIPTS.md) - Automation tools
- [ADD_NEW_EXAMPLE.md](ADD_NEW_EXAMPLE.md) - Adding examples guide
- [CONTRIBUTION_GUIDE.md](CONTRIBUTION_GUIDE.md) - Contribution workflow

---

**Last Updated**: December 2025
**Version**: 1.0.0
**Status**: Production-Ready
