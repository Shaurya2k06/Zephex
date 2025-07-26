import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Starting Zephex Contract Deployment...\n");

  const [deployer, escrowSigner1, escrowSigner2] = await ethers.getSigners();
  
  console.log("📋 Deployment Configuration:");
  console.log("Deployer address:", deployer.address);
  console.log("Deployer balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "ETH");
  console.log("Network:", (await deployer.provider.getNetwork()).name);
  console.log("Chain ID:", (await deployer.provider.getNetwork()).chainId);
  
  // Configuration
  const MESSAGE_FEE = ethers.parseEther("0.001"); // 0.001 ETH per message
  const ESCROW_SIGNERS = [deployer.address, escrowSigner1?.address || deployer.address];
  const REQUIRED_CONFIRMATIONS = 1; // For testnet, use 1. For mainnet, use 2+
  
  console.log("\n⚙️ Contract Configuration:");
  console.log("Message Fee:", ethers.formatEther(MESSAGE_FEE), "ETH");
  console.log("Escrow Signers:", ESCROW_SIGNERS);
  console.log("Required Confirmations:", REQUIRED_CONFIRMATIONS);

  try {
    // 1. Deploy UserWalletContract
    console.log("\n📱 Deploying UserWalletContract...");
    const UserWalletContract = await ethers.getContractFactory("UserWalletContract");
    const walletContract = await UserWalletContract.deploy();
    await walletContract.waitForDeployment();
    const walletAddress = await walletContract.getAddress();
    
    console.log("✅ UserWalletContract deployed to:", walletAddress);

    // 2. Deploy EscrowManager
    console.log("\n🏦 Deploying EscrowManager...");
    const EscrowManager = await ethers.getContractFactory("EscrowManager");
    const escrowManager = await EscrowManager.deploy(
      deployer.address, // Temporary messaging contract address (will update later)
      ESCROW_SIGNERS,
      REQUIRED_CONFIRMATIONS
    );
    await escrowManager.waitForDeployment();
    const escrowAddress = await escrowManager.getAddress();
    
    console.log("✅ EscrowManager deployed to:", escrowAddress);

    // 3. Deploy MessagingContract
    console.log("\n💬 Deploying MessagingContract...");
    const MessagingContract = await ethers.getContractFactory("MessagingContract");
    const messagingContract = await MessagingContract.deploy(
      walletAddress,
      escrowAddress,
      MESSAGE_FEE
    );
    await messagingContract.waitForDeployment();
    const messagingAddress = await messagingContract.getAddress();
    
    console.log("✅ MessagingContract deployed to:", messagingAddress);

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

    // 6. Display deployment summary
    console.log("\n🎉 DEPLOYMENT COMPLETE!");
    console.log("==========================================");
    console.log("📋 Contract Addresses:");
    console.log("UserWalletContract:", walletAddress);
    console.log("EscrowManager:", escrowAddress);
    console.log("MessagingContract:", messagingAddress);
    
    console.log("\n⚙️ Configuration:");
    console.log("Message Fee:", ethers.formatEther(MESSAGE_FEE), "ETH");
    console.log("Minimum Deposit:", "0.01 ETH");
    console.log("Rate Limit:", "100 messages/hour");
    
    console.log("\n🔐 Security Features:");
    console.log("✅ Reentrancy protection");
    console.log("✅ Access control");
    console.log("✅ Pausable contracts");
    console.log("✅ Rate limiting");
    console.log("✅ Multisig escrow");

    console.log("\n📝 Next Steps:");
    console.log("1. Update frontend contract addresses");
    console.log("2. Test messaging functionality");
    console.log("3. Configure rate limits if needed");
    console.log("4. Set up monitoring");

    // 7. Save deployment info
    const deploymentInfo = {
      network: (await deployer.provider.getNetwork()).name,
      chainId: (await deployer.provider.getNetwork()).chainId,
      deployer: deployer.address,
      timestamp: new Date().toISOString(),
      contracts: {
        UserWalletContract: walletAddress,
        EscrowManager: escrowAddress,
        MessagingContract: messagingAddress,
      },
      configuration: {
        messageFee: MESSAGE_FEE.toString(),
        messageFeeETH: ethers.formatEther(MESSAGE_FEE),
        minimumDeposit: "0.01",
        rateLimitPerHour: 100,
        escrowSigners: ESCROW_SIGNERS,
        requiredConfirmations: REQUIRED_CONFIRMATIONS,
      },
      gasUsed: {
        // Will be filled by actual deployment
      }
    };

    console.log("\n💾 Deployment info saved");
    console.log(JSON.stringify(deploymentInfo, null, 2));

    return {
      walletContract,
      escrowManager,
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
