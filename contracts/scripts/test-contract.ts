import { ethers } from "hardhat";

async function main() {
  const contractAddress = "0xDbC3bD080E2273B740F3DB928C65d463DD9bb0a4";
  
  // Get the contract factory
  const MessagingContractV2 = await ethers.getContractFactory("MessagingContractV2");
  
  // Connect to the deployed contract
  const contract = MessagingContractV2.attach(contractAddress);
  
  // Get the signer (deployer account)
  const [deployer] = await ethers.getSigners();
  console.log("Testing with account:", deployer.address);
  
  try {
    // Test getWalletBalance function
    console.log("Testing getWalletBalance...");
    const balance = await contract.getWalletBalance(deployer.address);
    console.log("Wallet balance:", ethers.formatEther(balance), "ETH");
    
    // Test MESSAGE_FEE constant
    console.log("Testing MESSAGE_FEE...");
    const messageFee = await contract.MESSAGE_FEE();
    console.log("Message fee:", ethers.formatEther(messageFee), "ETH");
    
    // Test owner
    console.log("Testing owner...");
    const owner = await contract.owner();
    console.log("Contract owner:", owner);
    
  } catch (error) {
    console.error("Error testing contract:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
