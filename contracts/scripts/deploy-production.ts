import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Deploying Zephex V3 Messaging System...\n");

  const [deployer] = await ethers.getSigners();
  
  console.log("📋 Deployment Configuration:");
  console.log("Deployer address:", deployer.address);
  console.log("Network:", (await deployer.provider.getNetwork()).name);
  console.log("Chain ID:", (await deployer.provider.getNetwork()).chainId);
  
  const MESSAGE_FEE = ethers.parseEther("0.001");

  try {
    // 1. Deploy UserWalletContract
    console.log("\n📱 Deploying UserWalletContract...");
    const UserWalletFactory = await ethers.getContractFactory("UserWalletContract");
    const walletContract = await UserWalletFactory.deploy();
    await walletContract.waitForDeployment();
    const walletAddress = await walletContract.getAddress();
    
    console.log("✅ UserWalletContract deployed to:", walletAddress);

    // 2. Deploy SimpleEscrow
    console.log("\n🏦 Deploying SimpleEscrow...");
    const EscrowFactory = await ethers.getContractFactory("SimpleEscrow");
    const escrowContract = await EscrowFactory.deploy(deployer.address);
    await escrowContract.waitForDeployment();
    const escrowAddress = await escrowContract.getAddress();
    
    console.log("✅ SimpleEscrow deployed to:", escrowAddress);

    // 3. Deploy MessagingContractV3Simple
    console.log("\n💬 Deploying MessagingContractV3Simple...");
    const MessagingFactory = await ethers.getContractFactory("MessagingContractV3Simple");
    const messagingContract = await MessagingFactory.deploy(
      walletAddress,
      escrowAddress,
      MESSAGE_FEE
    );
    await messagingContract.waitForDeployment();
    const messagingAddress = await messagingContract.getAddress();
    
    console.log("✅ MessagingContractV3Simple deployed to:", messagingAddress);

    // 4. Configure contracts
    console.log("\n🔧 Configuring contracts...");
    const authTx = await walletContract.setAuthorizedSpender(messagingAddress, true);
    await authTx.wait();
    console.log("✅ MessagingContract authorized to spend from WalletContract");

    // 5. Display deployment summary
    console.log("\n🎉 DEPLOYMENT COMPLETE!");
    console.log("==========================================");
    console.log("📋 Contract Addresses:");
    console.log("UserWalletContract:", walletAddress);
    console.log("SimpleEscrow:", escrowAddress);  
    console.log("MessagingContractV3Simple:", messagingAddress);
    
    console.log("\n⚙️ Configuration:");
    console.log("Message Fee:", ethers.formatEther(MESSAGE_FEE), "ETH");
    console.log("Minimum Deposit:", "0.01 ETH");
    console.log("Rate Limit:", "100 messages/hour");

    // Generate deployment info for frontend
    const deploymentInfo = {
      network: (await deployer.provider.getNetwork()).name,
      chainId: Number((await deployer.provider.getNetwork()).chainId),
      timestamp: new Date().toISOString(),
      contracts: {
        UserWalletContract: walletAddress,
        SimpleEscrow: escrowAddress,
        MessagingContract: messagingAddress,
      },
      configuration: {
        messageFee: MESSAGE_FEE.toString(),
        messageFeeETH: ethers.formatEther(MESSAGE_FEE),
        minimumDeposit: "0.01",
        rateLimitPerHour: 100,
      }
    };

    console.log("\n💾 Save these addresses to your frontend:");
    console.log(`VITE_WALLET_CONTRACT_ADDRESS=${walletAddress}`);
    console.log(`VITE_MESSAGING_CONTRACT_ADDRESS=${messagingAddress}`);
    console.log(`VITE_ESCROW_CONTRACT_ADDRESS=${escrowAddress}`);
    console.log(`VITE_MESSAGE_FEE=${ethers.formatEther(MESSAGE_FEE)}`);

    return deploymentInfo;

  } catch (error) {
    console.error("❌ Deployment failed:", error);
    throw error;
  }
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export default main;
