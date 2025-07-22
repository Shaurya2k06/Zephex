import { ethers } from "hardhat";

async function main() {
  console.log("Deploying MessagingContract to Sepolia...");
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  // Check deployer balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");
  
  if (balance < ethers.parseEther("0.01")) {
    throw new Error("Insufficient balance. Need at least 0.01 ETH for deployment.");
  }
  
  // Get the contract factory with the deployer signer
  const MessagingContract = await ethers.getContractFactory("MessagingContract", deployer);
  
  // Deploy the contract
  console.log("Deploying contract...");
  const messagingContract = await MessagingContract.deploy();
  
  // Wait for deployment to complete
  console.log("Waiting for deployment confirmation...");
  await messagingContract.waitForDeployment();
  
  // Get the deployed contract address
  const contractAddress = await messagingContract.getAddress();
  
  console.log("✅ MessagingContract deployed to:", contractAddress);
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
  console.log(`   11155111: '${contractAddress}',`);
  console.log("2. Verify the contract on Etherscan (optional)");
  console.log("3. Fund your wallet with Sepolia ETH for testing");
  console.log(`4. View contract on Etherscan: https://sepolia.etherscan.io/address/${contractAddress}`);
  
  // Optional: Verify contract on Etherscan
  if (process.env.ETHERSCAN_API_KEY) {
    console.log("\n🔍 Verifying contract on Etherscan...");
    try {
      // Wait a bit longer for Etherscan to index the contract
      console.log("Waiting 60 seconds before verification...");
      await new Promise(resolve => setTimeout(resolve, 60000));
      
      await ethers.run("verify:verify", {
        address: contractAddress,
        constructorArguments: [],
      });
      
      console.log("✅ Contract verified on Etherscan!");
      console.log(`🔗 View on Etherscan: https://sepolia.etherscan.io/address/${contractAddress}`);
    } catch (error) {
      console.log("❌ Contract verification failed:", error);
      console.log("You can verify manually on Etherscan later.");
    }
  } else {
    console.log("\n💡 To verify the contract, add ETHERSCAN_API_KEY to your .env file");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
