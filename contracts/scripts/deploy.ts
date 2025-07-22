import { ethers } from "hardhat";

async function main() {
  console.log("Deploying MessagingContract...");

  // Get the ContractFactory and Signers here.
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  // Deploy the contract
  const MessagingContract = await ethers.getContractFactory("MessagingContract");
  const messagingContract = await MessagingContract.deploy();

  await messagingContract.waitForDeployment();

  console.log("MessagingContract deployed to:", await messagingContract.getAddress());

  // Verify deployment
  console.log("Verifying deployment...");
  const owner = await messagingContract.owner();
  console.log("Contract owner:", owner);
  console.log("Total message count:", await messagingContract.getTotalMessageCount());
  console.log("Contract is paused:", await messagingContract.isPaused());

  // Save deployment info
  const deploymentInfo = {
    address: await messagingContract.getAddress(),
    deployer: deployer.address,
    network: (await deployer.provider.getNetwork()).name,
    chainId: (await deployer.provider.getNetwork()).chainId.toString(),
    blockNumber: await deployer.provider.getBlockNumber(),
    timestamp: new Date().toISOString(),
  };

  console.log("\n=== Deployment Summary ===");
  console.log(JSON.stringify(deploymentInfo, null, 2));
  
  console.log("\n=== Next Steps ===");
  console.log("1. Update CONTRACT_ADDRESSES in frontend/src/utils/constants.ts");
  console.log("2. Update the ABI in frontend/src/contracts/abi.ts");
  console.log("3. Test the contract with basic operations");
  
  return messagingContract;
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
