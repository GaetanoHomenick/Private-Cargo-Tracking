# Contribution Guide: Private Cargo Tracking

## Welcome Contributors!

We welcome contributions from developers, security researchers, and privacy advocates. This guide explains how to contribute to the Private Cargo Tracking project.

## Table of Contents
1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Workflow](#development-workflow)
4. [Commit Guidelines](#commit-guidelines)
5. [Testing Requirements](#testing-requirements)
6. [Pull Request Process](#pull-request-process)
7. [Areas for Contribution](#areas-for-contribution)

## Code of Conduct

### Our Values
- **Respectful**: Treat all contributors with respect
- **Collaborative**: Work together towards common goals
- **Transparent**: Communicate clearly and openly
- **Secure**: Prioritize security and privacy
- **Innovative**: Encourage new ideas

### Expected Behavior
- Use welcoming and inclusive language
- Respect differing opinions
- Accept constructive criticism
- Focus on what is best for the community
- Show empathy towards others

### Unacceptable Behavior
- Harassment or discrimination
- Threats or intimidation
- Unwelcome sexual attention
- Spam or manipulation
- Publishing private information

## Getting Started

### 1. Fork the Repository

```bash
# Visit GitHub
# Click "Fork" button
# Clone your fork
git clone https://github.com/YOUR_USERNAME/PrivacyCargoTracking_FHE.git
cd PrivateCargoTracking
```

### 2. Set Up Development Environment

```bash
# Install dependencies
npm install

# Install development tools
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox

# Create .env file (see .env.example)
cp .env.example .env

# Edit .env with your settings
# DO NOT commit .env file
```

### 3. Verify Setup

```bash
# Compile contracts
npx hardhat compile

# Run tests
npm test

# You should see all tests passing
```

## Development Workflow

### 1. Create Feature Branch

```bash
# Always branch from main
git checkout main
git pull origin main

# Create feature branch with descriptive name
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-name
# or
git checkout -b docs/documentation-update
```

**Naming Convention**:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test additions

### 2. Make Changes

#### Code Changes
```bash
# Edit files in your editor
# Keep changes focused and minimal

# Verify compilation
npx hardhat compile

# Run tests
npm test

# Check your changes
git diff
```

#### Documentation Changes
```bash
# Edit .md files
# Use clear, concise language
# Check for grammar/spelling
# Preview on GitHub
```

### 3. Commit Changes

```bash
# Stage changes
git add contracts/PrivateCargoTracking.sol

# Commit with clear message
git commit -m "feat: add emergency pause function"
```

See [Commit Guidelines](#commit-guidelines) below.

### 4. Push and Create PR

```bash
# Push to your fork
git push origin feature/your-feature-name

# Visit GitHub
# Click "Create Pull Request"
# Fill out PR template
# Submit
```

## Commit Guidelines

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation
- **style**: Formatting (no code change)
- **refactor**: Code refactoring
- **test**: Adding tests
- **chore**: Build, deps, tooling

### Examples

**Good**:
```bash
git commit -m "feat(cargo): add batch creation support"
git commit -m "fix(auth): fix authorization expiration check"
git commit -m "docs(api): update API reference with examples"
git commit -m "test(authorization): add comprehensive auth tests"
```

**Bad**:
```bash
git commit -m "updated stuff"
git commit -m "fix"
git commit -m "changes"
```

### Commit Message Template

Create `.gitmessage`:
```
<type>(<scope>): <subject>

<body>

Closes #<issue-number>
```

Use it:
```bash
git config commit.template .gitmessage
```

## Testing Requirements

### Before Submitting PR

#### 1. Run All Tests
```bash
npm test
```

All tests must pass.

#### 2. Add Tests for Changes

If adding feature:
```typescript
describe("New Feature", function () {
  it("should work as expected", async function () {
    // Test code
    expect(result).to.equal(expected);
  });

  it("should handle edge cases", async function () {
    // Edge case test
  });
});
```

#### 3. Check Coverage

```bash
npm run coverage
```

Aim for >90% coverage on changed files.

#### 4. Verify Compilation

```bash
npx hardhat compile
npx hardhat test
```

#### 5. Manual Testing

For contract changes:
```javascript
// Deploy locally and test
npx hardhat run scripts/test-changes.js --network localhost
```

For frontend changes:
```bash
# Test locally
npm run dev
# Open browser and test functionality
```

## Pull Request Process

### PR Checklist

- [ ] Fork and create branch from main
- [ ] Make focused changes
- [ ] Add/update tests
- [ ] Update documentation
- [ ] All tests passing
- [ ] No console warnings/errors
- [ ] Commit messages follow guidelines
- [ ] PR description clear and detailed

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] New feature
- [ ] Bug fix
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Security improvement

## Related Issues
Closes #<issue-number>

## How Has This Been Tested?
Description of testing approach

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Tests pass
- [ ] Documentation updated
- [ ] No breaking changes
- [ ] Follows code style
- [ ] Comments added for complex logic
```

### Review Process

1. **Automated Checks**
   - Tests must pass
   - No security issues
   - Code style verified

2. **Code Review**
   - Maintainers review code
   - May request changes
   - Discuss approach

3. **Approval**
   - At least 2 approvals required
   - All discussions resolved
   - Ready to merge

4. **Merge**
   - Squashed to single commit
   - Merged to main
   - Closed PR

## Areas for Contribution

### High Priority

#### 1. **Security Enhancements**
- Implement multisig owner model
- Add time locks for critical functions
- Implement emergency pause mechanism
- Create incident response procedures

**Example**:
```solidity
// Add pause functionality
bool public paused;

modifier whenNotPaused() {
    require(!paused, "Contract paused");
    _;
}

function pause() external onlyOwner {
    paused = true;
    emit ContractPaused();
}
```

#### 2. **Gas Optimization**
- Optimize location history queries
- Reduce batch operation costs
- Implement pagination system
- Archive old data

**Example**:
```solidity
// Paginated query function
function getLocationsPaginated(
    uint32 _cargoId,
    uint256 _offset,
    uint256 _limit
) external view returns (Location[] memory) {
    // Pagination logic
}
```

#### 3. **Off-Chain Indexing**
- Implement The Graph integration
- Create efficient query endpoints
- Build analytics dashboard
- Enable complex filtering

### Medium Priority

#### 1. **Enhanced Frontend**
- Improved UI/UX design
- Real-time map integration
- Advanced search/filtering
- Mobile responsive design

#### 2. **Additional Test Coverage**
- Edge case testing
- Load testing
- Security testing
- Integration testing

#### 3. **Documentation**
- Video tutorials
- Use case documentation
- Architecture deep dives
- FHEVM learning materials

### Lower Priority

#### 1. **Features**
- Multi-signature authorization
- Compliance reporting
- Insurance integration
- Predictive analytics

#### 2. **Tools**
- Deployment automation
- Contract upgrading tools
- Emergency recovery scripts
- Maintenance utilities

#### 3. **Community**
- Community governance
- Forum moderation
- Event coordination
- Ambassador program

## Review Guidelines

### What We Look For

**Code Quality**:
- ✓ Clear and readable
- ✓ Well-commented
- ✓ Follows style guide
- ✓ No duplication

**Testing**:
- ✓ Comprehensive tests
- ✓ Edge cases covered
- ✓ All tests passing
- ✓ Good coverage

**Security**:
- ✓ No new vulnerabilities
- ✓ Input validation
- ✓ Access control
- ✓ Error handling

**Documentation**:
- ✓ Updated comments
- ✓ Clear README
- ✓ API documentation
- ✓ Examples provided

### What We Don't Accept

- ✗ Code without tests
- ✗ Breaking changes without discussion
- ✗ Security issues
- ✗ Poor documentation
- ✗ Code style violations
- ✗ Untested features

## Coding Standards

### Solidity

```solidity
// SPDX identifier
// SPDX-License-Identifier: MIT

// Clear comments
pragma solidity ^0.8.24;

// Descriptive names
contract PrivateCargoTracking {
    // State variables with clear purposes
    uint32 public nextCargoId;

    // Events first
    event CargoCreated(uint32 indexed cargoId);

    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    // Function definitions
    function createCargo(
        uint32 _weight,
        address _receiver
    ) public returns (uint32) {
        // Implementation
    }
}
```

### TypeScript

```typescript
// Clear imports
import { ethers } from "hardhat";

// Type definitions
interface CargoData {
  weight: number;
  category: number;
  value: number;
}

// Clear function signatures
async function deployCargo(data: CargoData): Promise<string> {
  // Implementation
}
```

### Documentation

```markdown
# Clear Headings

Clear explanations using simple language.

## Code Examples

Show practical examples:

\`\`\`typescript
// Code example with comments
const result = await operation();
\`\`\`

## See Also

- [Related Link](url)
- [Another Link](url)
```

## Getting Help

### Resources
- **Documentation**: Read all .md files in repo
- **GitHub Issues**: Search existing issues
- **Discussions**: Ask questions in GitHub Discussions
- **Community**: https://www.zama.ai/community
- **Discord**: https://discord.com/invite/zama

### Contact Maintainers
- Email: (check repository contacts)
- Discord: Zama community
- GitHub Issues: For bug reports

## Recognition

Contributors are recognized:
- In CONTRIBUTORS.md file
- In release notes
- In GitHub contributors page
- Potential bounty rewards

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to Private Cargo Tracking!**

Questions? Open an issue or reach out to the community.

**Happy Contributing!** 🚀
