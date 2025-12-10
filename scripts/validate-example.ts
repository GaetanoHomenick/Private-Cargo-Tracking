import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

interface ValidationResult {
  category: string;
  checks: CheckResult[];
  passed: boolean;
  warnings: string[];
  errors: string[];
}

interface CheckResult {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  message: string;
}

/**
 * Validate example directory structure
 */
function validateStructure(examplePath: string): CheckResult[] {
  const results: CheckResult[] = [];

  const requiredDirs = ['contracts', 'test', 'scripts'];
  const requiredFiles = [
    'package.json',
    'hardhat.config.ts',
    'tsconfig.json',
    'README.md',
  ];

  // Check directories
  for (const dir of requiredDirs) {
    const dirPath = path.join(examplePath, dir);
    if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
      results.push({
        name: `Directory: ${dir}/`,
        status: 'pass',
        message: 'Found',
      });
    } else {
      results.push({
        name: `Directory: ${dir}/`,
        status: 'fail',
        message: 'Missing required directory',
      });
    }
  }

  // Check required files
  for (const file of requiredFiles) {
    const filePath = path.join(examplePath, file);
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      results.push({
        name: `File: ${file}`,
        status: 'pass',
        message: 'Found',
      });
    } else {
      results.push({
        name: `File: ${file}`,
        status: 'fail',
        message: 'Missing required file',
      });
    }
  }

  // Check for Solidity contracts
  const contractsDir = path.join(examplePath, 'contracts');
  if (fs.existsSync(contractsDir)) {
    const solFiles = fs.readdirSync(contractsDir).filter(f => f.endsWith('.sol'));
    if (solFiles.length > 0) {
      results.push({
        name: 'Solidity contracts',
        status: 'pass',
        message: `Found ${solFiles.length} contract(s)`,
      });
    } else {
      results.push({
        name: 'Solidity contracts',
        status: 'fail',
        message: 'No .sol files found in contracts/',
      });
    }
  }

  // Check for test files
  const testDir = path.join(examplePath, 'test');
  if (fs.existsSync(testDir)) {
    const testFiles = fs.readdirSync(testDir).filter(f => f.endsWith('.test.ts') || f.endsWith('.test.js'));
    if (testFiles.length > 0) {
      results.push({
        name: 'Test files',
        status: 'pass',
        message: `Found ${testFiles.length} test file(s)`,
      });
    } else {
      results.push({
        name: 'Test files',
        status: 'warn',
        message: 'No test files found',
      });
    }
  }

  return results;
}

/**
 * Validate package.json configuration
 */
function validatePackageJson(examplePath: string): CheckResult[] {
  const results: CheckResult[] = [];
  const packagePath = path.join(examplePath, 'package.json');

  if (!fs.existsSync(packagePath)) {
    results.push({
      name: 'package.json',
      status: 'fail',
      message: 'File not found',
    });
    return results;
  }

  try {
    const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));

    // Check name format
    if (pkg.name && /^fhevm-example-[a-z-]+-[a-z-]+$/.test(pkg.name)) {
      results.push({
        name: 'Package name format',
        status: 'pass',
        message: `Valid: ${pkg.name}`,
      });
    } else {
      results.push({
        name: 'Package name format',
        status: 'fail',
        message: `Invalid format: ${pkg.name}. Should be "fhevm-example-{category}-{name}"`,
      });
    }

    // Check required scripts
    const requiredScripts = ['test', 'compile'];
    for (const script of requiredScripts) {
      if (pkg.scripts && pkg.scripts[script]) {
        results.push({
          name: `Script: ${script}`,
          status: 'pass',
          message: 'Defined',
        });
      } else {
        results.push({
          name: `Script: ${script}`,
          status: 'fail',
          message: 'Missing required script',
        });
      }
    }

    // Check dependencies
    const hasHardhat = pkg.devDependencies?.hardhat || pkg.dependencies?.hardhat;
    const hasFHEVM = pkg.devDependencies?.['@fhevm/solidity'] || pkg.dependencies?.['@fhevm/solidity'];

    if (hasHardhat) {
      results.push({
        name: 'Hardhat dependency',
        status: 'pass',
        message: 'Found',
      });
    } else {
      results.push({
        name: 'Hardhat dependency',
        status: 'fail',
        message: 'Missing hardhat dependency',
      });
    }

    if (hasFHEVM) {
      results.push({
        name: 'FHEVM dependency',
        status: 'pass',
        message: 'Found @fhevm/solidity',
      });
    } else {
      results.push({
        name: 'FHEVM dependency',
        status: 'warn',
        message: '@fhevm/solidity not found',
      });
    }

  } catch (error) {
    results.push({
      name: 'package.json parsing',
      status: 'fail',
      message: `Invalid JSON: ${(error as Error).message}`,
    });
  }

  return results;
}

/**
 * Validate contract quality
 */
function validateContractQuality(examplePath: string): CheckResult[] {
  const results: CheckResult[] = [];
  const contractsDir = path.join(examplePath, 'contracts');

  if (!fs.existsSync(contractsDir)) {
    return results;
  }

  const solFiles = fs.readdirSync(contractsDir).filter(f => f.endsWith('.sol'));

  for (const file of solFiles) {
    const contractPath = path.join(contractsDir, file);
    const content = fs.readFileSync(contractPath, 'utf-8');

    // Check SPDX license
    if (content.includes('SPDX-License-Identifier')) {
      results.push({
        name: `${file}: SPDX license`,
        status: 'pass',
        message: 'Found',
      });
    } else {
      results.push({
        name: `${file}: SPDX license`,
        status: 'warn',
        message: 'Missing SPDX license identifier',
      });
    }

    // Check pragma
    if (content.match(/pragma solidity \^?[\d.]+;/)) {
      results.push({
        name: `${file}: Pragma`,
        status: 'pass',
        message: 'Found',
      });
    } else {
      results.push({
        name: `${file}: Pragma`,
        status: 'fail',
        message: 'Missing pragma statement',
      });
    }

    // Check FHEVM imports
    if (content.includes('@fhevm/solidity')) {
      results.push({
        name: `${file}: FHEVM imports`,
        status: 'pass',
        message: 'Using FHEVM library',
      });
    } else {
      results.push({
        name: `${file}: FHEVM imports`,
        status: 'warn',
        message: 'No FHEVM imports found',
      });
    }

    // Check documentation
    if (content.includes('@title') || content.includes('@notice')) {
      results.push({
        name: `${file}: Documentation`,
        status: 'pass',
        message: 'JSDoc comments found',
      });
    } else {
      results.push({
        name: `${file}: Documentation`,
        status: 'warn',
        message: 'Missing JSDoc comments',
      });
    }

    // Check for console.log (should not be in production)
    if (content.includes('console.log')) {
      results.push({
        name: `${file}: Console.log`,
        status: 'warn',
        message: 'Contains console.log statements',
      });
    } else {
      results.push({
        name: `${file}: Console.log`,
        status: 'pass',
        message: 'No debug statements',
      });
    }
  }

  return results;
}

/**
 * Validate compilation
 */
function validateCompilation(examplePath: string): CheckResult[] {
  const results: CheckResult[] = [];

  try {
    console.log('  Compiling contracts...');
    execSync('npx hardhat compile', {
      cwd: examplePath,
      stdio: 'pipe',
    });

    results.push({
      name: 'Compilation',
      status: 'pass',
      message: 'Contracts compiled successfully',
    });
  } catch (error) {
    results.push({
      name: 'Compilation',
      status: 'fail',
      message: `Compilation failed: ${(error as Error).message}`,
    });
  }

  return results;
}

/**
 * Validate tests
 */
function validateTests(examplePath: string): CheckResult[] {
  const results: CheckResult[] = [];

  try {
    console.log('  Running tests...');
    const output = execSync('npx hardhat test', {
      cwd: examplePath,
      stdio: 'pipe',
    }).toString();

    // Parse test output
    const passMatch = output.match(/(\d+) passing/);
    const failMatch = output.match(/(\d+) failing/);

    if (passMatch) {
      const passCount = parseInt(passMatch[1]);
      results.push({
        name: 'Tests',
        status: failMatch ? 'fail' : 'pass',
        message: `${passCount} test(s) passing${failMatch ? `, ${failMatch[1]} failing` : ''}`,
      });
    } else {
      results.push({
        name: 'Tests',
        status: 'warn',
        message: 'Could not parse test results',
      });
    }
  } catch (error) {
    results.push({
      name: 'Tests',
      status: 'fail',
      message: `Tests failed: ${(error as Error).message}`,
    });
  }

  return results;
}

/**
 * Validate README completeness
 */
function validateReadme(examplePath: string): CheckResult[] {
  const results: CheckResult[] = [];
  const readmePath = path.join(examplePath, 'README.md');

  if (!fs.existsSync(readmePath)) {
    results.push({
      name: 'README.md',
      status: 'fail',
      message: 'File not found',
    });
    return results;
  }

  const content = fs.readFileSync(readmePath, 'utf-8');

  const requiredSections = [
    { name: 'Overview', pattern: /##\s+Overview/i },
    { name: 'Installation', pattern: /##\s+Install/i },
    { name: 'Usage/Examples', pattern: /##\s+(Usage|Examples?)/i },
  ];

  for (const section of requiredSections) {
    if (section.pattern.test(content)) {
      results.push({
        name: `README: ${section.name}`,
        status: 'pass',
        message: 'Section found',
      });
    } else {
      results.push({
        name: `README: ${section.name}`,
        status: 'warn',
        message: 'Section missing or malformed',
      });
    }
  }

  return results;
}

/**
 * Run all validations
 */
async function validateExample(examplePath: string): Promise<ValidationResult> {
  console.log(`\n🔍 Validating: ${path.basename(examplePath)}\n`);

  const allChecks: CheckResult[] = [];
  const warnings: string[] = [];
  const errors: string[] = [];

  // Run validation checks
  console.log('📁 Checking directory structure...');
  allChecks.push(...validateStructure(examplePath));

  console.log('📦 Validating package.json...');
  allChecks.push(...validatePackageJson(examplePath));

  console.log('📄 Checking contract quality...');
  allChecks.push(...validateContractQuality(examplePath));

  console.log('📚 Validating README...');
  allChecks.push(...validateReadme(examplePath));

  console.log('🔨 Testing compilation...');
  allChecks.push(...validateCompilation(examplePath));

  console.log('🧪 Running tests...');
  allChecks.push(...validateTests(examplePath));

  // Collect warnings and errors
  for (const check of allChecks) {
    if (check.status === 'warn') {
      warnings.push(`${check.name}: ${check.message}`);
    } else if (check.status === 'fail') {
      errors.push(`${check.name}: ${check.message}`);
    }
  }

  const passed = errors.length === 0;

  return {
    category: 'validation',
    checks: allChecks,
    passed,
    warnings,
    errors,
  };
}

/**
 * Print validation results
 */
function printResults(result: ValidationResult): void {
  console.log('\n' + '='.repeat(60));
  console.log('VALIDATION RESULTS');
  console.log('='.repeat(60) + '\n');

  // Group by status
  const passed = result.checks.filter(c => c.status === 'pass');
  const warned = result.checks.filter(c => c.status === 'warn');
  const failed = result.checks.filter(c => c.status === 'fail');

  console.log(`✅ Passed: ${passed.length}`);
  console.log(`⚠️  Warnings: ${warned.length}`);
  console.log(`❌ Failed: ${failed.length}\n`);

  if (failed.length > 0) {
    console.log('❌ FAILURES:\n');
    for (const check of failed) {
      console.log(`  • ${check.name}: ${check.message}`);
    }
    console.log('');
  }

  if (warned.length > 0) {
    console.log('⚠️  WARNINGS:\n');
    for (const check of warned) {
      console.log(`  • ${check.name}: ${check.message}`);
    }
    console.log('');
  }

  console.log('='.repeat(60));
  if (result.passed) {
    console.log('✅ VALIDATION PASSED' + (warned.length > 0 ? ` (with ${warned.length} warning(s))` : ''));
  } else {
    console.log(`❌ VALIDATION FAILED (${failed.length} error(s))`);
  }
  console.log('='.repeat(60) + '\n');
}

/**
 * Main execution
 */
async function main(): Promise<void> {
  try {
    const args = process.argv.slice(2);

    if (args.length === 0 || !args[0].startsWith('--path')) {
      throw new Error('Missing --path argument');
    }

    const examplePath = args[1] || args[0].replace('--path=', '').replace('--path', '').trim();

    if (!examplePath) {
      throw new Error('Example path is required');
    }

    if (!fs.existsSync(examplePath)) {
      throw new Error(`Example not found at: ${examplePath}`);
    }

    const result = await validateExample(examplePath);
    printResults(result);

    process.exit(result.passed ? 0 : 1);

  } catch (error) {
    console.error('\n❌ Error:', (error as Error).message);
    console.error('\nUsage:');
    console.error('  npx ts-node scripts/validate-example.ts --path ./examples/fhevm-example-basic-counter\n');
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { validateExample, ValidationResult };
