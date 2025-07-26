import { expect } from "chai";
import { ethers } from "hardhat";
import { UserWalletContract, MessagingContract, EscrowManager } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("Zephex Messaging System", function () {
  let walletContract: UserWalletContract;
  let messagingContract: MessagingContract;
  let escrowManager: EscrowManager;
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;
  let escrowSigner: SignerWithAddress;

  const MESSAGE_FEE = ethers.parseEther("0.001");
  const MINIMUM_DEPOSIT = ethers.parseEther("0.01");
  const TEST_DEPOSIT = ethers.parseEther("0.1");

  beforeEach(async function () {
    [owner, user1, user2, escrowSigner] = await ethers.getSigners();

    // Deploy UserWalletContract
    const UserWalletFactory = await ethers.getContractFactory("UserWalletContract");
    walletContract = await UserWalletFactory.deploy();
    await walletContract.waitForDeployment();

    // Deploy EscrowManager
    const EscrowFactory = await ethers.getContractFactory("EscrowManager");
    escrowManager = await EscrowFactory.deploy(
      await walletContract.getAddress(),
      [owner.address, escrowSigner.address],
      1 // Required confirmations
    );
    await escrowManager.waitForDeployment();

    // Deploy MessagingContract
    const MessagingFactory = await ethers.getContractFactory("MessagingContract");
    messagingContract = await MessagingFactory.deploy(
      await walletContract.getAddress(),
      await escrowManager.getAddress(),
      MESSAGE_FEE
    );
    await messagingContract.waitForDeployment();

    // Authorize messaging contract to spend from wallet
    await walletContract.setAuthorizedSpender(await messagingContract.getAddress(), true);
  });

  describe("UserWalletContract", function () {
    it("Should accept deposits above minimum", async function () {
      await expect(walletContract.connect(user1).deposit({ value: TEST_DEPOSIT }))
        .to.emit(walletContract, "Deposited")
        .withArgs(user1.address, TEST_DEPOSIT, TEST_DEPOSIT);

      const balance = await walletContract.checkBalance(user1.address);
      expect(balance).to.equal(TEST_DEPOSIT);
    });

    it("Should reject deposits below minimum", async function () {
      const smallDeposit = ethers.parseEther("0.005"); // Below 0.01 ETH
      await expect(walletContract.connect(user1).deposit({ value: smallDeposit }))
        .to.be.revertedWithCustomError(walletContract, "BelowMinimumDeposit");
    });

    it("Should allow withdrawals", async function () {
      // First deposit
      await walletContract.connect(user1).deposit({ value: TEST_DEPOSIT });
      
      const withdrawAmount = ethers.parseEther("0.05");
      const initialBalance = await ethers.provider.getBalance(user1.address);
      
      await expect(walletContract.connect(user1).withdraw(withdrawAmount))
        .to.emit(walletContract, "Withdrawn")
        .withArgs(user1.address, withdrawAmount, TEST_DEPOSIT - withdrawAmount);
    });

    it("Should prevent unauthorized spending", async function () {
      await walletContract.connect(user1).deposit({ value: TEST_DEPOSIT });
      
      await expect(walletContract.connect(user2).spend(user1.address, MESSAGE_FEE))
        .to.be.revertedWithCustomError(walletContract, "UnauthorizedSpender");
    });

    it("Should allow authorized contracts to spend", async function () {
      await walletContract.connect(user1).deposit({ value: TEST_DEPOSIT });
      
      // This should work since messaging contract is authorized
      await expect(messagingContract.connect(user1).sendMessage(
        user2.address, 
        "QmTestIPFSHash123456789"
      )).to.not.be.reverted;
    });
  });

  describe("MessagingContract", function () {
    beforeEach(async function () {
      // Setup users with deposits
      await walletContract.connect(user1).deposit({ value: TEST_DEPOSIT });
      await walletContract.connect(user2).deposit({ value: TEST_DEPOSIT });
    });

    it("Should send message with valid parameters", async function () {
      const testCID = "QmTestIPFSHash123456789";
      
      await expect(messagingContract.connect(user1).sendMessage(user2.address, testCID))
        .to.emit(messagingContract, "MessageSent")
        .withArgs(1, user1.address, user2.address, testCID, await getBlockTimestamp(), MESSAGE_FEE);
    });

    it("Should reject messages with insufficient balance", async function () {
      // User with no deposit
      const [, , , userWithoutFunds] = await ethers.getSigners();
      
      await expect(messagingContract.connect(userWithoutFunds).sendMessage(
        user1.address, 
        "QmTestIPFSHash"
      )).to.be.revertedWithCustomError(messagingContract, "InsufficientBalance");
    });

    it("Should reject invalid CIDs", async function () {
      await expect(messagingContract.connect(user1).sendMessage(user2.address, ""))
        .to.be.revertedWithCustomError(messagingContract, "InvalidCID");
      
      // Too long CID
      const longCID = "Q".repeat(201);
      await expect(messagingContract.connect(user1).sendMessage(user2.address, longCID))
        .to.be.revertedWithCustomError(messagingContract, "InvalidCID");
    });

    it("Should prevent messaging to self", async function () {
      await expect(messagingContract.connect(user1).sendMessage(user1.address, "QmTestCID"))
        .to.be.revertedWithCustomError(messagingContract, "InvalidReceiver");
    });

    it("Should enforce rate limiting", async function () {
      const testCID = "QmTestIPFSHash";
      
      // Send max messages per hour
      for (let i = 0; i < 100; i++) {
        await messagingContract.connect(user1).sendMessage(user2.address, `${testCID}${i}`);
      }
      
      // 101st message should fail
      await expect(messagingContract.connect(user1).sendMessage(user2.address, testCID))
        .to.be.revertedWithCustomError(messagingContract, "RateLimitExceeded");
    });

    it("Should retrieve sent and received messages", async function () {
      const testCID1 = "QmTestCID1";
      const testCID2 = "QmTestCID2";
      
      await messagingContract.connect(user1).sendMessage(user2.address, testCID1);
      await messagingContract.connect(user2).sendMessage(user1.address, testCID2);
      
      const sentMessages = await messagingContract.getSentMessages(user1.address);
      const receivedMessages = await messagingContract.getReceivedMessages(user1.address);
      
      expect(sentMessages.length).to.equal(1);
      expect(receivedMessages.length).to.equal(1);
    });

    it("Should handle conversations correctly", async function () {
      const testCID1 = "QmTestCID1";
      const testCID2 = "QmTestCID2";
      
      await messagingContract.connect(user1).sendMessage(user2.address, testCID1);
      await messagingContract.connect(user2).sendMessage(user1.address, testCID2);
      
      const conversation = await messagingContract.getConversation(user1.address, user2.address);
      expect(conversation.length).to.equal(2);
    });

    it("Should paginate messages correctly", async function () {
      // Send multiple messages
      for (let i = 0; i < 5; i++) {
        await messagingContract.connect(user1).sendMessage(user2.address, `QmTestCID${i}`);
      }
      
      const [messageIds, hasMore] = await messagingContract.getMessagesPaginated(
        user1.address, 0, 3, true
      );
      
      expect(messageIds.length).to.equal(3);
      expect(hasMore).to.be.true;
    });

    it("Should get latest messages", async function () {
      for (let i = 0; i < 3; i++) {
        await messagingContract.connect(user1).sendMessage(user2.address, `QmTestCID${i}`);
      }
      
      const latestMessages = await messagingContract.getLatestMessages(user1.address, 2, true);
      expect(latestMessages.length).to.equal(2);
    });
  });

  describe("EscrowManager", function () {
    it("Should receive funds from messaging", async function () {
      await walletContract.connect(user1).deposit({ value: TEST_DEPOSIT });
      
      const initialEscrowBalance = await ethers.provider.getBalance(await escrowManager.getAddress());
      
      await messagingContract.connect(user1).sendMessage(user2.address, "QmTestCID");
      
      const finalEscrowBalance = await ethers.provider.getBalance(await escrowManager.getAddress());
      expect(finalEscrowBalance - initialEscrowBalance).to.equal(MESSAGE_FEE);
    });

    it("Should require multisig for withdrawals", async function () {
      // Send funds to escrow
      await walletContract.connect(user1).deposit({ value: TEST_DEPOSIT });
      await messagingContract.connect(user1).sendMessage(user2.address, "QmTestCID");
      
      const withdrawAmount = MESSAGE_FEE;
      const txHash = await escrowManager.submitTransaction(
        owner.address,
        withdrawAmount,
        "Test withdrawal"
      );
      
      // Should be executed immediately since we only need 1 confirmation
      const tx = await escrowManager.transactions(txHash);
      expect(tx.executed).to.be.true;
    });

    it("Should handle refunds correctly", async function () {
      await walletContract.connect(user1).deposit({ value: TEST_DEPOSIT });
      await messagingContract.connect(user1).sendMessage(user2.address, "QmTestCID");
      
      const refundAmount = MESSAGE_FEE;
      await escrowManager.issueRefund(user1.address, refundAmount);
      
      const availableRefund = await escrowManager.getRefundAmount(user1.address);
      expect(availableRefund).to.equal(refundAmount);
      
      await expect(escrowManager.connect(user1).claimRefund())
        .to.emit(escrowManager, "RefundClaimed")
        .withArgs(user1.address, refundAmount);
    });
  });

  describe("Admin Functions", function () {
    it("Should allow owner to update message fee", async function () {
      const newFee = ethers.parseEther("0.002");
      
      await expect(messagingContract.setMessageFee(newFee))
        .to.emit(messagingContract, "MessageFeeUpdated")
        .withArgs(MESSAGE_FEE, newFee);
      
      expect(await messagingContract.messageFee()).to.equal(newFee);
    });

    it("Should allow owner to block/unblock users", async function () {
      await expect(messagingContract.setUserBlocked(user1.address, true))
        .to.emit(messagingContract, "UserBlocked")
        .withArgs(user1.address, true);
      
      expect(await messagingContract.blockedUsers(user1.address)).to.be.true;
    });

    it("Should prevent non-owners from admin functions", async function () {
      await expect(messagingContract.connect(user1).setMessageFee(ethers.parseEther("0.002")))
        .to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should allow pausing and unpausing", async function () {
      await messagingContract.pause();
      
      await walletContract.connect(user1).deposit({ value: TEST_DEPOSIT });
      await expect(messagingContract.connect(user1).sendMessage(user2.address, "QmTestCID"))
        .to.be.revertedWith("Pausable: paused");
      
      await messagingContract.unpause();
      await expect(messagingContract.connect(user1).sendMessage(user2.address, "QmTestCID"))
        .to.not.be.reverted;
    });
  });

  describe("Gas Optimization", function () {
    it("Should use reasonable gas for message sending", async function () {
      await walletContract.connect(user1).deposit({ value: TEST_DEPOSIT });
      
      const tx = await messagingContract.connect(user1).sendMessage(user2.address, "QmTestCID");
      const receipt = await tx.wait();
      
      console.log("Gas used for sending message:", receipt?.gasUsed.toString());
      // Should be under 200k gas
      expect(receipt?.gasUsed).to.be.lessThan(200000);
    });
  });

  // Helper function
  async function getBlockTimestamp(): Promise<number> {
    const block = await ethers.provider.getBlock('latest');
    return block!.timestamp;
  }
});
