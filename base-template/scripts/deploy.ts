import { ethers } from "hardhat";

async function main() {
  console.log("\n🚀 Deploying Example contract...\n");

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH\n");

  // Deploy contract
  const ExampleFactory = await ethers.getContractFactory("Example");
  console.log("Deploying contract...");

  const initialValue = 100; // Default initial value
  const example = await ExampleFactory.deploy(initialValue);
  await example.waitForDeployment();

  const contractAddress = await example.getAddress();

  console.log("\n✅ Contract deployed successfully!");
  console.log("Contract address:", contractAddress);
  console.log("Transaction hash:", example.deploymentTransaction()?.hash);
  console.log("Initial value:", initialValue);

  // Verify on Etherscan (if on public network)
  const network = await ethers.provider.getNetwork();
  if (network.chainId === 11155111n) {
    // Sepolia
    console.log("\n📝 To verify on Etherscan, run:");
    console.log(
      `npx hardhat verify --network sepolia ${contractAddress} ${initialValue}`
    );
  }

  console.log("\n🎉 Deployment complete!\n");

  return contractAddress;
}

// Execute deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
