# FHEVM Example Template

This is a base template for creating FHEVM examples. Replace this README with example-specific documentation.

## Overview

[Add description of what this example demonstrates]

## Category

**[category]** - [Brief description of the FHEVM concept demonstrated]

## Prerequisites

- Node.js v18 or higher
- npm or yarn
- MetaMask wallet (for deployment)

## Installation

```bash
npm install
```

## Configuration

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Required environment variables:
- `SEPOLIA_RPC_URL`: RPC endpoint for Sepolia testnet
- `PRIVATE_KEY`: Your wallet private key (for deployment)
- `ETHERSCAN_API_KEY`: Etherscan API key (for verification)

## Compile

```bash
npm run compile
```

## Test

```bash
npm test
```

## Deploy

```bash
npm run deploy
```

## Project Structure

```
.
├── contracts/          # Solidity smart contracts
│   └── Example.sol     # Main contract (replace with your implementation)
├── test/               # Test files
│   └── Example.test.ts # Test suite (replace with your tests)
├── scripts/            # Deployment scripts
│   └── deploy.ts       # Deployment script
├── hardhat.config.ts   # Hardhat configuration
├── package.json        # Dependencies and scripts
├── tsconfig.json       # TypeScript configuration
└── README.md           # This file
```

## Key Concepts

This example demonstrates:

- **Encrypted Data Types**: Using euint32, euint8 for encrypted values
- **FHEVM Operations**: Arithmetic and comparison on encrypted data
- **Access Control**: Managing permissions with FHE.allow()
- **[Add more concepts specific to your example]**

## Learn More

- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [Zama Community](https://www.zama.ai/community)
- [Hardhat Documentation](https://hardhat.org/docs)

## License

MIT
