# Automation Scripts: FHEVM Example Generation

## Overview

The automation scripts provide a complete CLI system for generating, managing, and documenting FHEVM examples. These TypeScript-based tools automate:

1. **Example Creation**: Clone and customize base template
2. **Contract Insertion**: Add specific Solidity contracts
3. **Test Generation**: Create matching test suites
4. **Documentation**: Auto-generate markdown documentation
5. **Category Management**: Organize examples by FHEVM concepts

---

## Available Scripts

### 1. create-fhevm-example.ts

Creates a new individual FHEVM example repository.

**Usage**:
```bash
npx ts-node scripts/create-fhevm-example.ts --name counter --category basic --description "Simple FHE counter"
```

**Options**:
- `--name` (required): Example name (lowercase, hyphenated)
- `--category` (required): FHEVM concept category
- `--description`: Brief description
- `--contract`: Path to custom Solidity contract
- `--test`: Path to custom test file
- `--template`: Path to base template (defaults to ./base-template)
- `--output`: Output directory (defaults to ./examples)

**Output**:
```
examples/
└── fhevm-example-basic-counter/
    ├── contracts/
    │   └── Counter.sol
    ├── test/
    │   └── Counter.test.ts
    ├── scripts/
    │   └── deploy.ts
    ├── hardhat.config.ts
    ├── package.json
    ├── tsconfig.json
    └── README.md
```

**Example Implementation**:
```typescript
// scripts/create-fhevm-example.ts

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

interface ExampleConfig {
  name: string;
  category: string;
  description: string;
  contract?: string;
  test?: string;
  template: string;
  output: string;
}

async function createFHEVMExample(config: ExampleConfig): Promise<void> {
  const exampleName = `fhevm-example-${config.category}-${config.name}`;
  const outputPath = path.join(config.output, exampleName);

  // 1. Clone base template
  console.log(`Creating ${exampleName}...`);
  execSync(`cp -r ${config.template} ${outputPath}`);

  // 2. Update package.json
  const packagePath = path.join(outputPath, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
  pkg.name = exampleName;
  pkg.description = config.description;
  pkg.keywords = [
    'fhevm',
    'ethereum',
    config.category,
    'fully-homomorphic-encryption'
  ];
  fs.writeFileSync(packagePath, JSON.stringify(pkg, null, 2));

  // 3. Insert contract if provided
  if (config.contract) {
    const contractSrc = fs.readFileSync(config.contract, 'utf-8');
    const contractDst = path.join(outputPath, 'contracts', 'Example.sol');
    fs.writeFileSync(contractDst, contractSrc);
  }

  // 4. Insert test if provided
  if (config.test) {
    const testSrc = fs.readFileSync(config.test, 'utf-8');
    const testDst = path.join(outputPath, 'test', 'Example.test.ts');
    fs.writeFileSync(testDst, testSrc);
  }

  // 5. Generate documentation
  await generateDocumentation(outputPath, config);

  console.log(`✓ Created ${exampleName}`);
  console.log(`  Location: ${outputPath}`);
  console.log(`  Next: cd ${outputPath} && npm install`);
}

async function generateDocumentation(examplePath: string, config: ExampleConfig): Promise<void> {
  // Implementation in GENERATE_DOCS.ts
  console.log('Generating documentation...');
}

// Parse command line arguments
const args = process.argv.slice(2);
const config: ExampleConfig = {
  name: '',
  category: '',
  description: '',
  template: './base-template',
  output: './examples'
};

for (let i = 0; i < args.length; i += 2) {
  const key = args[i].replace('--', '');
  const value = args[i + 1];
  (config as any)[key] = value;
}

createFHEVMExample(config).catch(console.error);
```

---

### 2. create-fhevm-category.ts

Creates multiple examples for a specific FHEVM concept category.

**Usage**:
```bash
npx ts-node scripts/create-fhevm-category.ts --category access-control --examples allow,allowTransient,input-proof
```

**Options**:
- `--category` (required): Category name
- `--examples` (required): Comma-separated example names
- `--template`: Base template path
- `--output`: Output directory

**Creates**:
```
examples/
├── fhevm-example-access-control-allow/
├── fhevm-example-access-control-allowTransient/
└── fhevm-example-access-control-input-proof/
```

---

### 3. generate-docs.ts

Auto-generates documentation from code annotations.

**Usage**:
```bash
npx ts-node scripts/generate-docs.ts --input ./examples --output ./docs
```

**Options**:
- `--input`: Source directory with examples
- `--output`: Documentation output directory
- `--format`: Output format (markdown, gitbook, html)
- `--template`: Documentation template

**Scans For**:
- JSDoc comments with `@chapter` tags
- Solidity contract comments
- Test descriptions
- README files

**Generates**:
```
docs/
├── README.md (index)
├── categories/
│   ├── basic.md
│   ├── encryption.md
│   ├── access-control.md
│   └── advanced.md
└── examples/
    ├── counter.md
    ├── arithmetic.md
    ├── access-control.md
    └── ...
```

**Example Implementation**:
```typescript
// scripts/generate-docs.ts

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

interface DocConfig {
  input: string;
  output: string;
  format: string;
  template: string;
}

async function generateDocumentation(config: DocConfig): Promise<void> {
  // 1. Scan for examples
  const examples = await glob(path.join(config.input, 'fhevm-example-*'));

  // 2. Parse annotations
  const docs = await Promise.all(
    examples.map(example => parseExample(example))
  );

  // 3. Generate markdown
  const markdown = await generateMarkdown(docs, config);

  // 4. Write output
  writeDocumentation(config.output, markdown);
}

async function parseExample(examplePath: string): Promise<any> {
  const contractPath = path.join(examplePath, 'contracts', 'Example.sol');
  const testPath = path.join(examplePath, 'test', 'Example.test.ts');

  const contractCode = fs.readFileSync(contractPath, 'utf-8');
  const testCode = fs.readFileSync(testPath, 'utf-8');

  // Extract JSDoc comments
  const chapters = extractTags(contractCode, 'chapter');
  const description = extractJSDoc(contractCode).description;

  return {
    path: examplePath,
    chapters,
    description,
    contract: contractCode,
    tests: testCode
  };
}

function extractTags(code: string, tagName: string): string[] {
  const regex = new RegExp(`@${tagName}\\s+([\\w-]+)`, 'g');
  const matches = code.match(regex) || [];
  return matches.map(m => m.replace(`@${tagName} `, ''));
}

function extractJSDoc(code: string): any {
  // Parse JSDoc comments
  return { description: '' };
}

async function generateMarkdown(docs: any[], config: DocConfig): Promise<any> {
  // Generate GitBook-compatible markdown
  return {};
}

function writeDocumentation(outputDir: string, docs: any): void {
  // Write files
}

// Main
const args = process.argv.slice(2);
const config: DocConfig = {
  input: './examples',
  output: './docs',
  format: 'markdown',
  template: './doc-template'
};

for (let i = 0; i < args.length; i += 2) {
  const key = args[i].replace('--', '');
  const value = args[i + 1];
  (config as any)[key] = value;
}

generateDocumentation(config).catch(console.error);
```

---

### 4. validate-example.ts

Validates example structure and quality.

**Usage**:
```bash
npx ts-node scripts/validate-example.ts --path ./examples/fhevm-example-basic-counter
```

**Checks**:
- [ ] Directory structure correct
- [ ] package.json valid
- [ ] hardhat.config.ts complete
- [ ] contracts/ contains Solidity files
- [ ] test/ contains test files
- [ ] Tests pass: `npm test`
- [ ] Compilation succeeds: `npm run compile`
- [ ] README present and complete
- [ ] JSDoc comments present
- [ ] Gas optimization enabled
- [ ] SPDX license included

**Output**:
```
✓ Validating fhevm-example-basic-counter...

Directory Structure: ✓
Configuration: ✓
Contract Quality: ✓
Tests: ✓
Documentation: ⚠ (Missing some chapters)
Security: ✓

Validation: PASSED (with 1 warning)
```

---

### 5. publish-examples.ts

Publishes examples to npm, GitHub, or other registries.

**Usage**:
```bash
npx ts-node scripts/publish-examples.ts --registry npm --tag latest
```

**Options**:
- `--registry`: npm, github, or local
- `--tag`: Version tag
- `--dry-run`: Simulate without publishing

---

## Installation

```bash
# Install script dependencies
npm install typescript ts-node glob dotenv

# Make scripts executable
chmod +x scripts/*.ts
```

---

## Configuration

Create `scripts/config.json`:

```json
{
  "baseTemplate": "./base-template",
  "examplesDir": "./examples",
  "docsDir": "./docs",
  "categories": [
    "basic",
    "encryption",
    "decryption-user",
    "decryption-public",
    "access-control",
    "arithmetic",
    "comparison",
    "advanced"
  ],
  "defaultTemplate": "@fhevm/solidity",
  "targetNetwork": "sepolia",
  "minNodeVersion": "18.0.0"
}
```

---

## Workflow

### Creating a New Example

```bash
# 1. Create example from template
npx ts-node scripts/create-fhevm-example.ts \
  --name my-example \
  --category basic \
  --description "My FHEVM example"

# 2. Navigate to example
cd examples/fhevm-example-basic-my-example

# 3. Install dependencies
npm install

# 4. Implement contract and tests
# ... edit contracts/Example.sol and test/Example.test.ts

# 5. Compile and test
npm run compile
npm test

# 6. Back to root
cd ../..

# 7. Validate example
npx ts-node scripts/validate-example.ts \
  --path ./examples/fhevm-example-basic-my-example

# 8. Generate documentation
npx ts-node scripts/generate-docs.ts \
  --input ./examples \
  --output ./docs
```

---

## Best Practices

### ✅ DO

- Keep examples focused on single FHEVM concept
- Include comprehensive JSDoc comments
- Write tests covering common use cases
- Document gas consumption
- Explain why, not just how
- Reference related examples
- Update documentation tags

### ❌ DON'T

- Mix multiple concepts in one example
- Create overly complex contracts
- Skip test coverage
- Use undefined imported libraries
- Omit error cases
- Create duplicate examples
- Commit node_modules

---

## Troubleshooting

**Script fails to execute**:
```bash
# Ensure TypeScript is installed
npm install -g typescript

# Try with npx
npx ts-node scripts/create-fhevm-example.ts ...
```

**Template not found**:
```bash
# Verify base-template directory exists
ls -la base-template/

# Check template path in config
cat scripts/config.json | grep baseTemplate
```

**Tests fail after creation**:
```bash
# Reinstall dependencies
cd examples/fhevm-example-*
rm -rf node_modules package-lock.json
npm install
npm test
```

---

## See Also

- [BASE_TEMPLATE_GUIDE.md](BASE_TEMPLATE_GUIDE.md) - Base template documentation
- [ADD_NEW_EXAMPLE.md](ADD_NEW_EXAMPLE.md) - Step-by-step guide
- [EXAMPLES_STRUCTURE.md](EXAMPLES_STRUCTURE.md) - Examples organization

---

**Last Updated**: December 2025
**Version**: 1.0.0
**Status**: Production-Ready
