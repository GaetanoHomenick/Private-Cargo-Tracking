# Base Template Guide: FHEVM Hardhat Setup

## Overview

The Base Template provides a standardized, minimal Hardhat configuration that can be cloned and customized for each new FHEVM example. This ensures consistency across all example repositories while maintaining simplicity.

---

## Directory Structure

```
base-template/
├── contracts/
│   └── Example.sol          # Placeholder contract to replace
├── test/
│   └── Example.test.ts      # Placeholder test to replace
├── scripts/
│   └── deploy.ts            # Deployment script
├── hardhat.config.ts        # Hardhat configuration
├── package.json             # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration
├── .env.example             # Environment variables template
├── .gitignore               # Git ignore rules
└── README.md                # Project documentation
```

---

## Core Files

### hardhat.config.ts

```typescript
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 11155111
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY || ""
  }
};

export default config;
```

### package.json

```json
{
  "name": "fhevm-example-[category]-[name]",
  "version": "1.0.0",
  "description": "[Brief description of the example]",
  "main": "index.js",
  "scripts": {
    "test": "hardhat test",
    "compile": "hardhat compile",
    "deploy": "hardhat run scripts/deploy.ts --network sepolia"
  },
  "devDependencies": {
    "@nomicfoundation/hardhat-toolbox": "^4.0.0",
    "hardhat": "^2.19.0",
    "@fhevm/solidity": "latest"
  },
  "keywords": [
    "fhevm",
    "ethereum",
    "[category]",
    "fully-homomorphic-encryption"
  ]
}
```

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["hardhat.config.ts", "scripts", "test"],
  "exclude": ["node_modules", "dist"]
}
```

### .env.example

```env
# Sepolia Testnet RPC Endpoint
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY

# Wallet Private Key (for deployment)
PRIVATE_KEY=0x...

# Etherscan API Key (for verification)
ETHERSCAN_API_KEY=YOUR_KEY
```

---

## Using the Base Template

### Step 1: Clone Template

```bash
git clone [base-template-repo] fhevm-example-[category]-[name]
cd fhevm-example-[category]-[name]
```

### Step 2: Customize

```bash
# Edit package.json with specific example details
# Update name, description, keywords

# Replace placeholder contract
# Move specific Solidity contract to contracts/Example.sol

# Replace placeholder test
# Create test suite in test/Example.test.ts

# Update README.md with specific documentation
```

### Step 3: Install Dependencies

```bash
npm install
```

### Step 4: Compile

```bash
npm run compile
```

### Step 5: Test

```bash
npm test
```

### Step 6: Deploy (Optional)

```bash
# Set environment variables
export SEPOLIA_RPC_URL="https://sepolia.infura.io/v3/YOUR_KEY"
export PRIVATE_KEY="0x..."

# Deploy to Sepolia
npm run deploy
```

---

## Naming Convention

All examples follow a consistent naming convention:

```
fhevm-example-[CATEGORY]-[NAME]
```

**Categories**:
- `basic` - Simple FHE operations
- `encryption` - Encryption examples
- `decryption` - Decryption examples
- `access-control` - Authorization and ACL
- `arithmetic` - Mathematical operations
- `comparison` - Comparison operations
- `advanced` - Complex patterns

**Examples**:
- `fhevm-example-basic-counter`
- `fhevm-example-encryption-single-value`
- `fhevm-example-decryption-user`
- `fhevm-example-access-control-basic`
- `fhevm-example-arithmetic-operations`
- `fhevm-example-advanced-blind-auction`

---

## Template Features

### ✅ Pre-configured
- FHEVM library imports ready
- Sepolia network configuration included
- TypeScript support enabled
- Test framework ready (Chai + Hardhat)

### ✅ Extensible
- Simple structure easy to customize
- Placeholder files for easy replacement
- Minimal dependencies
- No bloatware

### ✅ Documented
- .env.example for configuration
- Clear directory structure
- Example contracts and tests included
- Ready for automated documentation generation

### ✅ Production-Ready
- Optimizer enabled
- Best practices followed
- Security considerations included
- Deployment script provided

---

## Customization Checklist

When using the base template:

- [ ] Update package.json name and description
- [ ] Replace Example.sol with specific contract
- [ ] Replace Example.test.ts with specific tests
- [ ] Update README.md with specific documentation
- [ ] Add example-specific configuration (if needed)
- [ ] Include category tags for documentation
- [ ] Add JSDoc comments for auto-documentation
- [ ] Test compilation: `npm run compile`
- [ ] Run tests: `npm test`
- [ ] Verify deployment script works

---

## Documentation Tags

Each example should include tags for automatic documentation generation:

```solidity
/// @title [Contract Title]
/// @notice [What this contract does]
/// @dev [Implementation details]
/// @chapter [FHEVM Concept Category]
contract Example {
    // Implementation
}
```

```typescript
/**
 * @fileoverview [Example description]
 * @chapter [FHEVM Concept Category]
 * @example
 * // Usage example
 */
```

Available chapters:
- `chapter: basic`
- `chapter: encryption`
- `chapter: decryption-user`
- `chapter: decryption-public`
- `chapter: access-control`
- `chapter: arithmetic`
- `chapter: comparison`
- `chapter: advanced`

---

## Common Modifications

### Adding External Dependencies

Edit `package.json`:
```json
{
  "devDependencies": {
    "@openzeppelin/contracts": "^4.9.0"
  }
}
```

### Custom Solidity Version

Edit `hardhat.config.ts`:
```typescript
solidity: {
  version: "0.8.19" // Change version
}
```

### Additional Networks

Edit `hardhat.config.ts`:
```typescript
networks: {
  localhost: {
    url: "http://127.0.0.1:8545"
  },
  mainnet: {
    url: process.env.MAINNET_RPC_URL
  }
}
```

---

## Quality Checklist

Before publishing an example:

- [ ] All tests pass: `npm test`
- [ ] Code compiles without warnings: `npm run compile`
- [ ] JSDoc comments are complete
- [ ] README is comprehensive
- [ ] Example is minimal but complete
- [ ] Gas usage documented (if relevant)
- [ ] Security considerations noted
- [ ] Common pitfalls explained
- [ ] Related examples referenced

---

## Support

For issues with the base template:

1. Check template configuration
2. Verify dependencies installed
3. Review example documentation
4. Check FHEVM library version compatibility
5. Open issue with reproduction steps

---

## See Also

- [CREATE_FHEVM_EXAMPLE.ts](CREATE_FHEVM_EXAMPLE.ts) - Automation script
- [AUTOMATION_SCRIPTS.md](AUTOMATION_SCRIPTS.md) - Full CLI documentation
- [ADD_NEW_EXAMPLE.md](ADD_NEW_EXAMPLE.md) - Guide for adding examples

---

**Last Updated**: December 2025
**Version**: 1.0.0
**Status**: Production-Ready
