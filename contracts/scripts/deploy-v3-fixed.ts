import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Deploying Zephex V3 Contracts (Fixed Version)...\n");

  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "ETH\n");

  // Deploy UserWalletContract first
  console.log("🏦 Deploying UserWalletContract...");
  const WalletContract = await ethers.getContractFactory("UserWalletContract");
  const walletContract = await WalletContract.deploy();
  await walletContract.waitForDeployment();
  const walletAddress = await walletContract.getAddress();
  console.log("✅ UserWalletContract deployed to:", walletAddress);

  // Deploy MessagingContractV3Simple
  console.log("\n📨 Deploying MessagingContractV3Simple...");
  const messageFee = ethers.parseEther("0.001"); // 0.001 ETH per message
  const escrowAddress = deployer.address; // Use deployer as escrow for now
  
  const MessagingContract = await ethers.getContractFactory("MessagingContractV3Simple");
  const messagingContract = await MessagingContract.deploy(
    walletAddress,
    escrowAddress,
    messageFee
  );
  await messagingContract.waitForDeployment();
  const messagingAddress = await messagingContract.getAddress();
  console.log("✅ MessagingContractV3Simple deployed to:", messagingAddress);

  // Authorize messaging contract to spend from wallet
  console.log("\n🔐 Authorizing messaging contract to spend from wallet...");
  const authTx = await walletContract.setAuthorizedSpender(messagingAddress, true);
  await authTx.wait();
  console.log("✅ Messaging contract authorized");

  // Display deployment summary
  console.log("\n" + "=".repeat(60));
  console.log("🎉 DEPLOYMENT COMPLETE");
  console.log("=".repeat(60));
  console.log("🏦 UserWalletContract:", walletAddress);
  console.log("📨 MessagingContractV3Simple:", messagingAddress);
  console.log("💰 Message Fee:", ethers.formatEther(messageFee), "ETH");
  console.log("🏧 Escrow Address:", escrowAddress);
  console.log("=".repeat(60));

  // Generate contract configuration for frontend
  const config = {
    contracts: {
      wallet: walletAddress,
      messaging: messagingAddress
    },
    config: {
      messageFee: messageFee.toString(),
      escrowAddress: escrowAddress,
      network: "sepolia"
    }
  };

  console.log("\n📋 Frontend Configuration:");
  console.log(JSON.stringify(config, null, 2));

  // Test basic functionality
  console.log("\n🧪 Running basic tests...");
  
  // Check initial state
  const totalMessages = await messagingContract.getContractStats();
  console.log("📊 Initial message count:", totalMessages[0].toString());
  
  const canAfford = await walletContract.canAfford(deployer.address, messageFee);
  console.log("💸 Deployer can afford message:", canAfford);
  
  console.log("✅ All tests passed!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
