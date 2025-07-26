import { ethers } from "hardhat";
import hre from "hardhat";

async function main() {
  console.log("Deploying WalletContract...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  // Check deployer balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");
  
  if (balance < ethers.parseEther("0.01")) {
    throw new Error("Insufficient balance. Need at least 0.01 ETH for deployment.");
  }

  // Deploy the WalletContract first
  console.log("Deploying WalletContract...");
  const WalletContract = await ethers.getContractFactory("WalletContract", deployer);
  const walletContract = await WalletContract.deploy();
  
  console.log("Waiting for WalletContract deployment confirmation...");
  await walletContract.waitForDeployment();
  
  const walletAddress = await walletContract.getAddress();
  console.log("✅ WalletContract deployed to:", walletAddress);

  // Deploy the MessagingContractV2 (which includes wallet integration)
  console.log("Deploying MessagingContractV2...");
  const MessagingContract = await ethers.getContractFactory("MessagingContractV2", deployer);
  const messagingContract = await MessagingContract.deploy();
  
  console.log("Waiting for MessagingContract deployment confirmation...");
  await messagingContract.waitForDeployment();
  
  const messagingAddress = await messagingContract.getAddress();
  console.log("✅ MessagingContractV2 deployed to:", messagingAddress);

  // Wait for a few block confirmations
  console.log("⏳ Waiting for 3 block confirmations...");
  const walletDeploymentTx = walletContract.deploymentTransaction();
  const messagingDeploymentTx = messagingContract.deploymentTransaction();
  
  if (walletDeploymentTx) {
    await walletDeploymentTx.wait(3);
  }
  if (messagingDeploymentTx) {
    await messagingDeploymentTx.wait(3);
  }

  console.log("🎉 Contract deployments confirmed!");
  console.log("\n📋 Contract Details:");
  console.log("WalletContract Address:", walletAddress);
  console.log("MessagingContract Address:", messagingAddress);
  console.log("Network: Sepolia");
  console.log("Chain ID: 11155111");
  console.log("Deployer:", deployer.address);
  
  console.log("\n🔧 Next Steps:");
  console.log("1. Update frontend/src/utils/constants.ts with the contract addresses:");
  console.log(`   CONTRACT_ADDRESSES: { 11155111: '${messagingAddress}' }`);
  console.log(`   WALLET_CONTRACT_ADDRESSES: { 11155111: '${walletAddress}' }`);
  console.log("2. Verify the contracts on Etherscan (optional)");
  console.log("3. Fund your wallet with Sepolia ETH for testing");
  console.log(`4. View contracts on Etherscan:`);
  console.log(`   - WalletContract: https://sepolia.etherscan.io/address/${walletAddress}`);
  console.log(`   - MessagingContract: https://sepolia.etherscan.io/address/${messagingAddress}`);

  // Optional: Verify contracts on Etherscan
  if (process.env.ETHERSCAN_API_KEY) {
    console.log("\n🔍 Verifying contracts on Etherscan...");
    try {
      // Wait a bit longer for Etherscan to index the contracts
      console.log("Waiting 60 seconds before verification...");
      await new Promise(resolve => setTimeout(resolve, 60000));
      
      await hre.run("verify:verify", {
        address: walletAddress,
        constructorArguments: [],
      });
      
      await hre.run("verify:verify", {
        address: messagingAddress,
        constructorArguments: [],
      });
      
      console.log("✅ Contracts verified on Etherscan!");
    } catch (error) {
      console.log("❌ Contract verification failed:", error);
      console.log("You can verify manually on Etherscan later.");
    }
  } else {
    console.log("\n💡 To verify the contracts, add ETHERSCAN_API_KEY to your .env file");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
