# Automation Infrastructure: Complete Reference

## Overview

The FHEVM Example Hub includes a complete automation infrastructure for creating, validating, and documenting FHEVM examples. This document provides a comprehensive reference for all automation components.

---

## Components

### 1. Configuration (`scripts/config.json`)

Central configuration for all automation scripts.

**Contents**:
```json
{
  "baseTemplate": "./base-template",
  "examplesDir": "./examples",
  "docsDir": "./docs",
  "categories": ["basic", "encryption", "decryption-user", "decryption-public",
                 "access-control", "arithmetic", "comparison", "advanced"],
  "categoryDescriptions": { ... },
  "solidityVersion": "0.8.24",
  "targetNetwork": "sepolia",
  "minNodeVersion": "18.0.0"
}
```

**Purpose**:
- Defines all valid categories
- Sets version requirements
- Configures output directories
- Provides category descriptions

---

### 2. Base Template (`base-template/`)

Standardized Hardhat project template for all examples.

**Structure**:
```
base-template/
├── contracts/
│   └── Example.sol              # Placeholder contract with FHEVM
├── test/
│   └── Example.test.ts          # Complete test suite
├── scripts/
│   └── deploy.ts                # Deployment script
├── hardhat.config.ts            # Hardhat configuration
├── package.json                 # Dependencies
├── tsconfig.json                # TypeScript config
├── .env.example                 # Environment template
├── .gitignore                   # Git ignore rules
└── README.md                    # Template documentation
```

**Features**:
- Pre-configured FHEVM integration
- Sepolia testnet ready
- TypeScript enabled
- Complete test framework
- Gas optimization enabled
- Etherscan verification ready

**Usage**:
```bash
# Clone manually
cp -r base-template examples/fhevm-example-basic-my-example

# Or use automation
npx ts-node scripts/create-fhevm-example.ts --name my-example --category basic
```

---

### 3. Example Generator (`scripts/create-fhevm-example.ts`)

TypeScript CLI tool for creating new examples from template.

**Features**:
- Clones base template
- Updates package.json with example metadata
- Inserts custom contract if provided
- Inserts custom test if provided
- Generates README with example details
- Validates input parameters

**Usage**:
```bash
npx ts-node scripts/create-fhevm-example.ts \
  --name counter \
  --category basic \
  --description "Simple encrypted counter" \
  --contract ./path/to/Counter.sol \
  --test ./path/to/Counter.test.ts
```

**Parameters**:
- `--name` (required): Example name (lowercase-hyphenated)
- `--category` (required): Category from config.json
- `--description`: Brief description
- `--contract`: Path to custom Solidity contract
- `--test`: Path to custom test file
- `--template`: Custom template path (defaults to base-template)
- `--output`: Output directory (defaults to ./examples)

**Validation**:
- Checks category exists in config
- Validates name format (lowercase, hyphens only)
- Ensures template exists
- Prevents overwriting existing examples

**Output**:
```
examples/fhevm-example-basic-counter/
├── [Complete project structure]
└── README.md [Auto-generated]
```

---

### 4. Documentation Generator (`scripts/generate-docs.ts`)

Auto-generates documentation from code annotations.

**Features**:
- Scans all examples in directory
- Extracts JSDoc comments from contracts
- Extracts TSDoc comments from tests
- Parses function signatures
- Generates category overview pages
- Creates individual example pages
- Produces GitBook-compatible markdown

**Usage**:
```bash
npx ts-node scripts/generate-docs.ts \
  --input ./examples \
  --output ./docs \
  --format markdown
```

**Scans For**:
- `@title` - Contract title
- `@notice` - User-facing description
- `@dev` - Developer notes
- `@chapter` - Category tag
- `@param` - Parameter descriptions
- `@return` - Return value descriptions
- `@example` - Usage examples

**Generated Structure**:
```
docs/
├── README.md                    # Index with all examples
├── categories/
│   ├── basic.md                # Category overview
│   ├── encryption.md
│   └── ...
└── examples/
    ├── counter.md              # Individual example docs
    ├── encryption.md
    └── ...
```

**Example Output**:

For a contract with:
```solidity
/**
 * @title Counter
 * @notice Simple encrypted counter
 * @chapter basic
 */
contract Counter {
    /**
     * @notice Increment counter
     * @param amount Amount to add
     * @return New counter value
     */
    function increment(uint32 amount) external returns (euint32) {
        // ...
    }
}
```

Generates:
```markdown
# Counter

## Overview
Simple encrypted counter

**Category**: basic

## Functions

### increment()
Increment counter

**Parameters**:
- `amount` (`uint32`): Amount to add

**Returns**: New counter value
```

---

### 5. Example Validator (`scripts/validate-example.ts`)

Comprehensive validation tool for example quality.

**Features**:
- Directory structure validation
- package.json validation
- Contract quality checks
- README completeness
- Compilation verification
- Test execution
- Detailed reporting

**Usage**:
```bash
npx ts-node scripts/validate-example.ts \
  --path ./examples/fhevm-example-basic-counter
```

**Validation Checks**:

**Structure**:
- [ ] contracts/ directory exists
- [ ] test/ directory exists
- [ ] scripts/ directory exists
- [ ] .sol files present
- [ ] .test.ts files present
- [ ] All required config files present

**Configuration**:
- [ ] package.json valid JSON
- [ ] Name follows convention
- [ ] Required scripts defined (compile, test)
- [ ] Hardhat dependency present
- [ ] FHEVM dependency present

**Code Quality**:
- [ ] SPDX license present
- [ ] Pragma statement correct
- [ ] FHEVM imports found
- [ ] JSDoc comments present
- [ ] No console.log statements

**Documentation**:
- [ ] README.md exists
- [ ] Overview section present
- [ ] Installation section present
- [ ] Usage section present

**Functionality**:
- [ ] Contracts compile successfully
- [ ] All tests pass
- [ ] No compilation warnings

**Output**:
```
🔍 Validating: fhevm-example-basic-counter

📁 Checking directory structure...
✅ Directory: contracts/ - Found
✅ Directory: test/ - Found
✅ Directory: scripts/ - Found

📦 Validating package.json...
✅ Package name format - Valid: fhevm-example-basic-counter
✅ Script: test - Defined
✅ Script: compile - Defined

📄 Checking contract quality...
✅ Example.sol: SPDX license - Found
✅ Example.sol: Pragma - Found
✅ Example.sol: FHEVM imports - Using FHEVM library

🔨 Testing compilation...
✅ Compilation - Contracts compiled successfully

🧪 Running tests...
✅ Tests - 15 test(s) passing

============================================================
VALIDATION RESULTS
============================================================

✅ Passed: 18
⚠️  Warnings: 0
❌ Failed: 0

============================================================
✅ VALIDATION PASSED
============================================================
```

---

## Workflows

### Creating a New Example

**Complete Workflow**:

```bash
# Step 1: Create example from template
npx ts-node scripts/create-fhevm-example.ts \
  --name my-example \
  --category basic \
  --description "My FHEVM example"

# Step 2: Navigate to example
cd examples/fhevm-example-basic-my-example

# Step 3: Install dependencies
npm install

# Step 4: Implement contract and tests
# Edit contracts/Example.sol
# Edit test/Example.test.ts

# Step 5: Compile
npm run compile

# Step 6: Test
npm test

# Step 7: Return to root
cd ../..

# Step 8: Validate
npx ts-node scripts/validate-example.ts \
  --path ./examples/fhevm-example-basic-my-example

# Step 9: Generate documentation
npx ts-node scripts/generate-docs.ts \
  --input ./examples \
  --output ./docs

# Step 10: Verify documentation
cat docs/examples/my-example.md
```

---

### Creating Multiple Examples in a Category

```bash
# Create multiple arithmetic examples
for name in addition subtraction multiplication division; do
  npx ts-node scripts/create-fhevm-example.ts \
    --name $name \
    --category arithmetic \
    --description "FHE $name operations"
done

# Generate documentation for all
npx ts-node scripts/generate-docs.ts \
  --input ./examples \
  --output ./docs
```

---

### Batch Validation

```bash
# Validate all examples
for dir in examples/fhevm-example-*; do
  echo "Validating: $dir"
  npx ts-node scripts/validate-example.ts --path "$dir"
done
```

---

## Integration Points

### With Git

```bash
# Create example
npx ts-node scripts/create-fhevm-example.ts --name counter --category basic

# Add to git
cd examples/fhevm-example-basic-counter
git init
git add .
git commit -m "Initial commit: FHEVM counter example"
git remote add origin https://github.com/user/fhevm-example-basic-counter.git
git push -u origin main
```

### With CI/CD

**.github/workflows/validate.yml**:
```yaml
name: Validate Example

on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npx ts-node scripts/validate-example.ts --path .
```

### With Documentation Hosting

```bash
# Generate docs
npx ts-node scripts/generate-docs.ts \
  --input ./examples \
  --output ./docs

# Deploy to GitHub Pages
cd docs
git init
git add .
git commit -m "Documentation update"
git push origin gh-pages
```

---

## File Dependencies

```
scripts/config.json
    ↓ (loaded by)
scripts/create-fhevm-example.ts
    ↓ (uses)
base-template/
    ↓ (generates)
examples/fhevm-example-*/
    ↓ (scanned by)
scripts/generate-docs.ts
    ↓ (produces)
docs/
```

---

## Extension Points

### Adding Custom Categories

Edit `scripts/config.json`:
```json
{
  "categories": [
    "basic",
    "encryption",
    "my-custom-category"
  ],
  "categoryDescriptions": {
    "my-custom-category": "Description of my custom category"
  }
}
```

### Custom Template

```bash
# Create custom template
cp -r base-template my-custom-template
# Modify my-custom-template/

# Use custom template
npx ts-node scripts/create-fhevm-example.ts \
  --name example \
  --category basic \
  --template ./my-custom-template
```

### Custom Documentation Format

Modify `scripts/generate-docs.ts`:
```typescript
// Add new format handler
async function generateHTML(docs: ExampleDoc[], config: DocConfig) {
    // Generate HTML instead of markdown
}

// Use in main()
if (config.format === 'html') {
    await generateHTML(docs, config);
}
```

---

## Troubleshooting

### Script Execution Errors

**Problem**: `Cannot find module 'typescript'`

**Solution**:
```bash
npm install -g typescript ts-node
# Or use npx
npx ts-node scripts/create-fhevm-example.ts ...
```

### Template Not Found

**Problem**: `Template not found at: ./base-template`

**Solution**:
```bash
# Verify template exists
ls -la base-template/

# Or specify custom path
npx ts-node scripts/create-fhevm-example.ts \
  --template /absolute/path/to/template \
  ...
```

### Validation Failures

**Problem**: Tests fail during validation

**Solution**:
```bash
cd examples/fhevm-example-*
npm install           # Reinstall dependencies
npm run compile       # Recompile
npm test              # Run tests manually
```

---

## Performance

### Benchmarks

**Example Creation**: ~500ms
- Template cloning: ~200ms
- File updates: ~100ms
- README generation: ~200ms

**Documentation Generation** (10 examples): ~2s
- Parsing: ~1s
- Markdown generation: ~1s

**Validation** (1 example): ~10s
- Structure checks: ~100ms
- Compilation: ~8s
- Tests: ~2s

---

## Security Considerations

### Private Keys

**Never commit private keys!**

The base template includes `.env` in `.gitignore`.

Always use `.env.example` as template:
```bash
cp .env.example .env
# Edit .env with real values
# .env is git-ignored
```

### Script Safety

All automation scripts:
- Validate input parameters
- Check file existence before operations
- Never execute arbitrary code
- Use safe file operations (no `eval`, no `rm -rf /`)

---

## Statistics

**Automation Infrastructure**:
- Configuration files: 1
- TypeScript scripts: 3
- Base template files: 9
- Total lines of automation code: ~1,500
- Documentation files: 4

**Capabilities**:
- Example generation: Automated
- Documentation generation: Automated
- Validation: Automated
- Testing: Automated
- Deployment: Scripted

---

## See Also

- [AUTOMATION_SCRIPTS.md](AUTOMATION_SCRIPTS.md) - Detailed script documentation
- [BASE_TEMPLATE_GUIDE.md](BASE_TEMPLATE_GUIDE.md) - Template reference
- [ADD_NEW_EXAMPLE.md](ADD_NEW_EXAMPLE.md) - Step-by-step guide
- [EXAMPLES_STRUCTURE.md](EXAMPLES_STRUCTURE.md) - Organization reference

---

**Last Updated**: December 2025
**Version**: 1.0.0
**Status**: Production-Ready
