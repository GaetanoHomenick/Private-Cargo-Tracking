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

interface ScriptConfig {
  baseTemplate: string;
  examplesDir: string;
  docsDir: string;
  categories: string[];
  categoryDescriptions: { [key: string]: string };
  solidityVersion: string;
  defaultTemplate: string;
  targetNetwork: string;
}

/**
 * Load configuration from config.json
 */
function loadConfig(): ScriptConfig {
  const configPath = path.join(__dirname, 'config.json');
  if (!fs.existsSync(configPath)) {
    throw new Error('config.json not found. Please create it in the scripts directory.');
  }
  return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
}

/**
 * Validate example name and category
 */
function validateInput(config: ExampleConfig, scriptConfig: ScriptConfig): void {
  if (!config.name || config.name.trim() === '') {
    throw new Error('Example name is required. Use --name flag.');
  }

  if (!config.category || config.category.trim() === '') {
    throw new Error('Category is required. Use --category flag.');
  }

  if (!scriptConfig.categories.includes(config.category)) {
    throw new Error(
      `Invalid category: ${config.category}. Valid categories: ${scriptConfig.categories.join(', ')}`
    );
  }

  // Validate name format (lowercase, hyphenated)
  if (!/^[a-z0-9-]+$/.test(config.name)) {
    throw new Error('Example name must be lowercase with hyphens only (e.g., "my-example")');
  }
}

/**
 * Create FHEVM example from template
 */
async function createFHEVMExample(config: ExampleConfig, scriptConfig: ScriptConfig): Promise<void> {
  const exampleName = `fhevm-example-${config.category}-${config.name}`;
  const outputPath = path.join(config.output, exampleName);

  console.log(`\n🚀 Creating ${exampleName}...`);

  // Check if example already exists
  if (fs.existsSync(outputPath)) {
    throw new Error(`Example already exists at: ${outputPath}`);
  }

  // 1. Clone base template
  console.log('📋 Cloning base template...');
  if (!fs.existsSync(config.template)) {
    throw new Error(`Template not found at: ${config.template}`);
  }

  try {
    copyDirectory(config.template, outputPath);
  } catch (error) {
    throw new Error(`Failed to clone template: ${error}`);
  }

  // 2. Update package.json
  console.log('📝 Updating package.json...');
  const packagePath = path.join(outputPath, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
  pkg.name = exampleName;
  pkg.description = config.description || `FHEVM example demonstrating ${config.category} concepts`;
  pkg.keywords = ['fhevm', 'ethereum', config.category, 'fully-homomorphic-encryption', 'privacy'];
  fs.writeFileSync(packagePath, JSON.stringify(pkg, null, 2));

  // 3. Insert custom contract if provided
  if (config.contract && fs.existsSync(config.contract)) {
    console.log('📄 Inserting custom contract...');
    const contractSrc = fs.readFileSync(config.contract, 'utf-8');
    const contractDst = path.join(outputPath, 'contracts', 'Example.sol');
    fs.writeFileSync(contractDst, contractSrc);
  }

  // 4. Insert custom test if provided
  if (config.test && fs.existsSync(config.test)) {
    console.log('🧪 Inserting custom test...');
    const testSrc = fs.readFileSync(config.test, 'utf-8');
    const testDst = path.join(outputPath, 'test', 'Example.test.ts');
    fs.writeFileSync(testDst, testSrc);
  }

  // 5. Update README.md with example-specific information
  console.log('📚 Generating README...');
  await generateReadme(outputPath, config, scriptConfig);

  console.log('\n✅ Successfully created example!');
  console.log(`\n📍 Location: ${outputPath}`);
  console.log(`\n📦 Next steps:`);
  console.log(`   cd ${outputPath}`);
  console.log(`   npm install`);
  console.log(`   npm run compile`);
  console.log(`   npm test\n`);
}

/**
 * Copy directory recursively
 */
function copyDirectory(src: string, dest: string): void {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      // Skip node_modules and other build artifacts
      if (['node_modules', 'dist', 'cache', 'artifacts'].includes(entry.name)) {
        continue;
      }
      copyDirectory(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

/**
 * Generate README.md for the example
 */
async function generateReadme(
  examplePath: string,
  config: ExampleConfig,
  scriptConfig: ScriptConfig
): Promise<void> {
  const readmePath = path.join(examplePath, 'README.md');
  const categoryDesc = scriptConfig.categoryDescriptions[config.category] || config.category;

  const readme = `# ${config.name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}

## Overview

${config.description || `This example demonstrates ${categoryDesc} using FHEVM.`}

## Category

**${config.category}** - ${categoryDesc}

## Installation

\`\`\`bash
npm install
\`\`\`

## Compile

\`\`\`bash
npm run compile
\`\`\`

## Test

\`\`\`bash
npm test
\`\`\`

## Deploy

\`\`\`bash
# Set environment variables
export SEPOLIA_RPC_URL="https://sepolia.infura.io/v3/YOUR_KEY"
export PRIVATE_KEY="0x..."

# Deploy to Sepolia
npm run deploy
\`\`\`

## Key Concepts

This example demonstrates:

- Encrypted data types (euint32, euint8)
- FHEVM operations
- Access control with FHE.allow()
- ${config.category} patterns

## Contract Structure

See \`contracts/Example.sol\` for the implementation.

## Testing

Complete test suite available in \`test/Example.test.ts\`.

## Learn More

- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [Zama Community](https://www.zama.ai/community)

## License

MIT
`;

  fs.writeFileSync(readmePath, readme);
}

/**
 * Parse command line arguments
 */
function parseArgs(): Partial<ExampleConfig> {
  const args = process.argv.slice(2);
  const config: Partial<ExampleConfig> = {};

  for (let i = 0; i < args.length; i += 2) {
    const key = args[i].replace('--', '');
    const value = args[i + 1];

    if (!value || value.startsWith('--')) {
      throw new Error(`Missing value for argument: ${args[i]}`);
    }

    (config as any)[key] = value;
  }

  return config;
}

/**
 * Main execution
 */
async function main(): Promise<void> {
  try {
    console.log('\n🎨 FHEVM Example Generator\n');

    // Load script configuration
    const scriptConfig = loadConfig();

    // Parse command line arguments
    const parsedArgs = parseArgs();

    // Build example configuration with defaults
    const config: ExampleConfig = {
      name: parsedArgs.name || '',
      category: parsedArgs.category || '',
      description: parsedArgs.description || '',
      contract: parsedArgs.contract,
      test: parsedArgs.test,
      template: parsedArgs.template || scriptConfig.baseTemplate,
      output: parsedArgs.output || scriptConfig.examplesDir,
    };

    // Validate input
    validateInput(config, scriptConfig);

    // Create example
    await createFHEVMExample(config, scriptConfig);

  } catch (error) {
    console.error('\n❌ Error:', (error as Error).message);
    console.error('\nUsage:');
    console.error('  npx ts-node scripts/create-fhevm-example.ts \\');
    console.error('    --name <example-name> \\');
    console.error('    --category <category> \\');
    console.error('    --description "Brief description" \\');
    console.error('    [--contract path/to/Contract.sol] \\');
    console.error('    [--test path/to/Test.test.ts] \\');
    console.error('    [--template ./custom-template] \\');
    console.error('    [--output ./custom-output]\n');
    console.error('Available categories:', loadConfig().categories.join(', '));
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { createFHEVMExample, ExampleConfig };
