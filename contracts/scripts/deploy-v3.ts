import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Deploying Zephex V3 Messaging System...\n");

  const [deployer] = await ethers.getSigners();
  
  console.log("📋 Deployment Configuration:");
  console.log("Deployer address:", deployer.address);
  console.log("Deployer balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "ETH");
  console.log("Network:", (await deployer.provider.getNetwork()).name);
  console.log("Chain ID:", (await deployer.provider.getNetwork()).chainId);
  
  // Configuration
  const MESSAGE_FEE = ethers.parseEther("0.001"); // 0.001 ETH per message
  
  console.log("\n⚙️ Contract Configuration:");
  console.log("Message Fee:", ethers.formatEther(MESSAGE_FEE), "ETH");

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
    const escrowContract = await EscrowFactory.deploy(deployer.address); // Temporary, will update later
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
    
    // Authorize messaging contract to spend from wallet
    console.log("Authorizing MessagingContract to spend from WalletContract...");
    const authTx = await walletContract.setAuthorizedSpender(messagingAddress, true);
    await authTx.wait();
    console.log("✅ Authorization complete");

    // 5. Test deposit (optional)
    console.log("\n🧪 Testing with sample deposit...");
    const depositAmount = ethers.parseEther("0.1"); // 0.1 ETH test deposit
    const depositTx = await walletContract.deposit({ value: depositAmount });
    await depositTx.wait();
    
    const balance = await walletContract.checkBalance(deployer.address);
    console.log("✅ Test deposit successful. Balance:", ethers.formatEther(balance), "ETH");

    // 6. Test message sending
    console.log("\n📨 Testing message sending...");
    const testCID = "QmTestIPFSHashForDeploymentTest12345";
    const [user2] = await ethers.getSigners();
    
    // First deposit for user2 to test receiving
    await walletContract.connect(user2 || deployer).deposit({ value: ethers.parseEther("0.05") });
    
    const messageTx = await messagingContract.sendMessage(
      user2?.address || deployer.address,
      testCID
    );
    await messageTx.wait();
    console.log("✅ Test message sent successfully");

    // 7. Display deployment summary
    console.log("\n🎉 DEPLOYMENT COMPLETE!");
    console.log("==========================================");
    console.log("📋 Contract Addresses:");
    console.log("UserWalletContractSimple:", walletAddress);
    console.log("SimpleEscrow:", escrowAddress);
    console.log("MessagingContractV3Simple:", messagingAddress);
    
    console.log("\n⚙️ Configuration:");
    console.log("Message Fee:", ethers.formatEther(MESSAGE_FEE), "ETH");
    console.log("Minimum Deposit:", "0.01 ETH");
    console.log("Rate Limit:", "100 messages/hour");
    
    console.log("\n🔐 Security Features:");
    console.log("✅ Access control");
    console.log("✅ Pausable contracts");
    console.log("✅ Rate limiting");
    console.log("✅ Escrow system");
    console.log("✅ IPFS-based storage");

    console.log("\n📝 Next Steps:");
    console.log("1. Update frontend contract addresses");
    console.log("2. Test messaging functionality");
    console.log("3. Configure rate limits if needed");
    console.log("4. Set up IPFS integration");

    // 8. Save deployment info for frontend
    const deploymentInfo = {
      network: (await deployer.provider.getNetwork()).name,
      chainId: Number((await deployer.provider.getNetwork()).chainId),
      deployer: deployer.address,
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
      },
      abi: {
        wallet: "UserWalletContractSimple",
        messaging: "MessagingContractV3Simple",
        escrow: "SimpleEscrow"
      }
    };

    console.log("\n💾 Deployment info:");
    console.log(JSON.stringify(deploymentInfo, null, 2));

    // 9. Generate contract interaction examples
    console.log("\n📚 Contract Interaction Examples:");
    console.log("// Deposit ETH");
    console.log(`await walletContract.deposit({ value: ethers.parseEther("0.1") })`);
    
    console.log("\n// Send message");
    console.log(`await messagingContract.sendMessage("0x...", "QmIPFSHash...")`);
    
    console.log("\n// Get messages");
    console.log(`await messagingContract.getMessages(userAddress, true) // sent messages`);
    console.log(`await messagingContract.getMessages(userAddress, false) // received messages`);

    return {
      walletContract,
      escrowContract,
      messagingContract,
      addresses: {
        wallet: walletAddress,
        escrow: escrowAddress,
        messaging: messagingAddress,
      },
      config: deploymentInfo
    };

  } catch (error) {
    console.error("❌ Deployment failed:", error);
    throw error;
  }
}

// Handle both direct execution and module export
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export default main;
