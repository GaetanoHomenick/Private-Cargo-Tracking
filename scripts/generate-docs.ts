import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

interface DocConfig {
  input: string;
  output: string;
  format: string;
  template: string;
}

interface ExampleDoc {
  path: string;
  name: string;
  category: string;
  chapters: string[];
  title: string;
  description: string;
  contract: string;
  tests: string;
  functions: FunctionDoc[];
  events: string[];
}

interface FunctionDoc {
  name: string;
  description: string;
  params: ParamDoc[];
  returns: string;
}

interface ParamDoc {
  name: string;
  type: string;
  description: string;
}

/**
 * Parse example directory and extract documentation
 */
async function parseExample(examplePath: string): Promise<ExampleDoc> {
  const exampleName = path.basename(examplePath);
  const parts = exampleName.split('-');
  const category = parts[2] || 'unknown';
  const name = parts.slice(3).join('-') || parts[2];

  const contractPath = path.join(examplePath, 'contracts', 'Example.sol');
  const testPath = path.join(examplePath, 'test', 'Example.test.ts');

  let contractCode = '';
  let testCode = '';

  if (fs.existsSync(contractPath)) {
    contractCode = fs.readFileSync(contractPath, 'utf-8');
  }

  if (fs.existsSync(testPath)) {
    testCode = fs.readFileSync(testPath, 'utf-8');
  }

  // Extract metadata from code
  const chapters = extractTags(contractCode + testCode, 'chapter');
  const title = extractTag(contractCode, 'title') || name;
  const description = extractTag(contractCode, 'notice') || extractTag(contractCode, 'dev') || '';
  const functions = parseFunctions(contractCode);
  const events = parseEvents(contractCode);

  return {
    path: examplePath,
    name,
    category,
    chapters: [...new Set(chapters)],
    title,
    description,
    contract: contractCode,
    tests: testCode,
    functions,
    events,
  };
}

/**
 * Extract all occurrences of a tag from code
 */
function extractTags(code: string, tagName: string): string[] {
  const regex = new RegExp(`@${tagName}\\s+([\\w-]+)`, 'g');
  const matches = code.matchAll(regex);
  return Array.from(matches).map(m => m[1]);
}

/**
 * Extract single tag value
 */
function extractTag(code: string, tagName: string): string {
  const regex = new RegExp(`@${tagName}\\s+(.+)$`, 'm');
  const match = code.match(regex);
  return match ? match[1].trim() : '';
}

/**
 * Parse function declarations from Solidity code
 */
function parseFunctions(contractCode: string): FunctionDoc[] {
  const functions: FunctionDoc[] = [];

  // Match function declarations with preceding comments
  const functionRegex = /\/\*\*([\s\S]*?)\*\/\s*function\s+(\w+)\s*\(([\s\S]*?)\)/g;
  const matches = contractCode.matchAll(functionRegex);

  for (const match of matches) {
    const [, docComment, funcName, params] = match;

    const description = extractFromComment(docComment, 'notice') ||
                       extractFromComment(docComment, 'dev') || '';

    const paramDocs = parseParams(docComment, params);
    const returns = extractFromComment(docComment, 'return') || 'void';

    functions.push({
      name: funcName,
      description,
      params: paramDocs,
      returns,
    });
  }

  return functions;
}

/**
 * Parse parameters from function signature and doc comments
 */
function parseParams(docComment: string, paramSignature: string): ParamDoc[] {
  const params: ParamDoc[] = [];
  const paramRegex = /@param\s+(\w+)\s+(.+?)(?=@|\*\/|$)/gs;
  const paramMatches = docComment.matchAll(paramRegex);

  const paramDescriptions = new Map<string, string>();
  for (const match of paramMatches) {
    paramDescriptions.set(match[1], match[2].trim());
  }

  // Parse actual parameters from signature
  const paramParts = paramSignature.split(',').filter(p => p.trim());
  for (const param of paramParts) {
    const parts = param.trim().split(/\s+/);
    if (parts.length >= 2) {
      const type = parts[0];
      const name = parts[1].replace(/[^a-zA-Z0-9_]/g, '');
      const description = paramDescriptions.get(name) || '';

      params.push({ name, type, description });
    }
  }

  return params;
}

/**
 * Extract value from doc comment
 */
function extractFromComment(comment: string, tag: string): string {
  const regex = new RegExp(`@${tag}\\s+(.+?)(?=@|\\*\\/|$)`, 's');
  const match = comment.match(regex);
  return match ? match[1].trim().replace(/\s+/g, ' ') : '';
}

/**
 * Parse event declarations
 */
function parseEvents(contractCode: string): string[] {
  const events: string[] = [];
  const eventRegex = /event\s+(\w+)\s*\(/g;
  const matches = contractCode.matchAll(eventRegex);

  for (const match of matches) {
    events.push(match[1]);
  }

  return events;
}

/**
 * Generate markdown documentation
 */
async function generateMarkdown(docs: ExampleDoc[], config: DocConfig): Promise<void> {
  // Create output directory
  if (!fs.existsSync(config.output)) {
    fs.mkdirSync(config.output, { recursive: true });
  }

  // Generate index
  await generateIndex(docs, config.output);

  // Generate category pages
  await generateCategoryPages(docs, config.output);

  // Generate individual example pages
  for (const doc of docs) {
    await generateExamplePage(doc, config.output);
  }

  console.log(`\n✅ Generated documentation in: ${config.output}`);
}

/**
 * Generate main index page
 */
async function generateIndex(docs: ExampleDoc[], outputDir: string): Promise<void> {
  const categories = new Map<string, ExampleDoc[]>();

  for (const doc of docs) {
    if (!categories.has(doc.category)) {
      categories.set(doc.category, []);
    }
    categories.get(doc.category)!.push(doc);
  }

  let indexContent = `# FHEVM Examples Index

## Overview

This documentation contains ${docs.length} FHEVM examples organized across ${categories.size} categories.

## Categories

`;

  for (const [category, examples] of categories) {
    indexContent += `### ${category.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}\n\n`;
    indexContent += `${examples.length} examples:\n\n`;

    for (const example of examples) {
      indexContent += `- [${example.title}](./examples/${example.name}.md)\n`;
    }

    indexContent += '\n';
  }

  indexContent += `## Quick Links

- [All Categories](./categories/README.md)
- [All Examples](./examples/README.md)

## Learn More

- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [Zama Community](https://www.zama.ai/community)
`;

  fs.writeFileSync(path.join(outputDir, 'README.md'), indexContent);
}

/**
 * Generate category overview pages
 */
async function generateCategoryPages(docs: ExampleDoc[], outputDir: string): Promise<void> {
  const categoriesDir = path.join(outputDir, 'categories');
  if (!fs.existsSync(categoriesDir)) {
    fs.mkdirSync(categoriesDir, { recursive: true });
  }

  const categories = new Map<string, ExampleDoc[]>();

  for (const doc of docs) {
    if (!categories.has(doc.category)) {
      categories.set(doc.category, []);
    }
    categories.get(doc.category)!.push(doc);
  }

  for (const [category, examples] of categories) {
    const categoryTitle = category.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    let content = `# ${categoryTitle}\n\n`;
    content += `## Examples in this category\n\n`;

    for (const example of examples) {
      content += `### [${example.title}](../examples/${example.name}.md)\n\n`;
      content += `${example.description}\n\n`;
      content += `**Functions**: ${example.functions.length}\n\n`;
      content += `**Events**: ${example.events.length}\n\n`;
      content += '---\n\n';
    }

    fs.writeFileSync(path.join(categoriesDir, `${category}.md`), content);
  }
}

/**
 * Generate individual example documentation page
 */
async function generateExamplePage(doc: ExampleDoc, outputDir: string): Promise<void> {
  const examplesDir = path.join(outputDir, 'examples');
  if (!fs.existsSync(examplesDir)) {
    fs.mkdirSync(examplesDir, { recursive: true });
  }

  let content = `# ${doc.title}\n\n`;
  content += `## Overview\n\n${doc.description}\n\n`;
  content += `**Category**: ${doc.category}\n\n`;

  if (doc.functions.length > 0) {
    content += `## Functions\n\n`;

    for (const func of doc.functions) {
      content += `### ${func.name}()\n\n`;
      content += `${func.description}\n\n`;

      if (func.params.length > 0) {
        content += `**Parameters**:\n\n`;
        for (const param of func.params) {
          content += `- \`${param.name}\` (\`${param.type}\`): ${param.description}\n`;
        }
        content += '\n';
      }

      content += `**Returns**: ${func.returns}\n\n`;
      content += '---\n\n';
    }
  }

  if (doc.events.length > 0) {
    content += `## Events\n\n`;
    for (const event of doc.events) {
      content += `- \`${event}\`\n`;
    }
    content += '\n';
  }

  content += `## Source\n\nSee implementation at: \`${doc.path}\`\n`;

  fs.writeFileSync(path.join(examplesDir, `${doc.name}.md`), content);
}

/**
 * Parse command line arguments
 */
function parseArgs(): Partial<DocConfig> {
  const args = process.argv.slice(2);
  const config: Partial<DocConfig> = {};

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
    console.log('\n📚 FHEVM Documentation Generator\n');

    const parsedArgs = parseArgs();

    const config: DocConfig = {
      input: parsedArgs.input || './examples',
      output: parsedArgs.output || './docs',
      format: parsedArgs.format || 'markdown',
      template: parsedArgs.template || './doc-template',
    };

    console.log(`📂 Scanning examples in: ${config.input}`);

    // Find all example directories
    const exampleDirs = await glob(path.join(config.input, 'fhevm-example-*'));

    if (exampleDirs.length === 0) {
      console.warn('⚠️  No examples found');
      return;
    }

    console.log(`📖 Found ${exampleDirs.length} examples`);

    // Parse all examples
    const docs: ExampleDoc[] = [];
    for (const dir of exampleDirs) {
      console.log(`  Parsing: ${path.basename(dir)}`);
      const doc = await parseExample(dir);
      docs.push(doc);
    }

    // Generate documentation
    console.log(`\n📝 Generating ${config.format} documentation...`);
    await generateMarkdown(docs, config);

    console.log('\n✅ Documentation generation complete!\n');

  } catch (error) {
    console.error('\n❌ Error:', (error as Error).message);
    console.error('\nUsage:');
    console.error('  npx ts-node scripts/generate-docs.ts \\');
    console.error('    --input ./examples \\');
    console.error('    --output ./docs \\');
    console.error('    [--format markdown] \\');
    console.error('    [--template ./doc-template]\n');
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { generateMarkdown, parseExample };
