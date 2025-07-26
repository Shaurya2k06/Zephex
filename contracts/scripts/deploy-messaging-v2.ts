import { ethers } from "hardhat";

async function main() {
  console.log("Deploying MessagingContractV2 to Sepolia...");
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  // Check deployer balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");
  
  if (balance < ethers.parseEther("0.01")) {
    throw new Error("Insufficient balance. Need at least 0.01 ETH for deployment.");
  }
  
  // Deploy the MessagingContractV2 (which includes wallet integration)
  console.log("Deploying MessagingContractV2...");
  const MessagingContract = await ethers.getContractFactory("MessagingContractV2", deployer);
  const messagingContract = await MessagingContract.deploy();
  
  // Wait for deployment to complete
  console.log("Waiting for deployment confirmation...");
  await messagingContract.waitForDeployment();
  
  // Get the deployed contract address
  const contractAddress = await messagingContract.getAddress();
  
  console.log("✅ MessagingContractV2 deployed to:", contractAddress);
  console.log("📝 Contract deployment transaction:", messagingContract.deploymentTransaction()?.hash);
  
  // Wait for a few block confirmations
  console.log("⏳ Waiting for 3 block confirmations...");
  const deploymentTx = messagingContract.deploymentTransaction();
  if (deploymentTx) {
    await deploymentTx.wait(3);
  }
  
  console.log("🎉 Contract deployment confirmed!");
  console.log("\n📋 Contract Details:");
  console.log("Address:", contractAddress);
  console.log("Network: Sepolia");
  console.log("Chain ID: 11155111");
  console.log("Deployer:", deployer.address);
  
  console.log("\n🔧 Next Steps:");
  console.log("1. Update frontend/src/utils/constants.ts with the contract address:");
  console.log(`   CONTRACT_ADDRESSES: { 11155111: '${contractAddress}' }`);
  console.log("2. The contract includes built-in wallet functionality");
  console.log("3. Fund your wallet with Sepolia ETH for testing");
  console.log(`4. View contract on Etherscan: https://sepolia.etherscan.io/address/${contractAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
