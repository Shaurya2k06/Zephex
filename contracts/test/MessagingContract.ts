import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("MessagingContract", function () {
  // We define a fixture to reuse the same setup in every test.
  async function deployMessagingContractFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, alice, bob, charlie] = await ethers.getSigners();

    const MessagingContract = await ethers.getContractFactory("MessagingContract");
    const messagingContract = await MessagingContract.deploy();

    return { messagingContract, owner, alice, bob, charlie };
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { messagingContract, owner } = await loadFixture(deployMessagingContractFixture);
      expect(await messagingContract.owner()).to.equal(owner.address);
    });

    it("Should start unpaused", async function () {
      const { messagingContract } = await loadFixture(deployMessagingContractFixture);
      expect(await messagingContract.isPaused()).to.equal(false);
    });

    it("Should have zero total messages initially", async function () {
      const { messagingContract } = await loadFixture(deployMessagingContractFixture);
      expect(await messagingContract.getTotalMessageCount()).to.equal(0);
    });
  });

  describe("Public Key Registration", function () {
    it("Should allow users to register public keys", async function () {
      const { messagingContract, alice } = await loadFixture(deployMessagingContractFixture);
      
      const publicKey = "0x04abc123def456..."; // Mock public key
      
      await expect(messagingContract.connect(alice).registerPublicKey(publicKey))
        .to.emit(messagingContract, "PublicKeyRegistered")
        .withArgs(alice.address, publicKey, anyValue);
      
      expect(await messagingContract.getPublicKey(alice.address)).to.equal(publicKey);
      expect(await messagingContract.isUserRegistered(alice.address)).to.equal(true);
    });

    it("Should reject empty public keys", async function () {
      const { messagingContract, alice } = await loadFixture(deployMessagingContractFixture);
      
      await expect(messagingContract.connect(alice).registerPublicKey(""))
        .to.be.revertedWith("Public key cannot be empty");
    });

    it("Should allow updating public keys", async function () {
      const { messagingContract, alice } = await loadFixture(deployMessagingContractFixture);
      
      const publicKey1 = "0x04abc123def456...";
      const publicKey2 = "0x04def789ghi012...";
      
      await messagingContract.connect(alice).registerPublicKey(publicKey1);
      await messagingContract.connect(alice).registerPublicKey(publicKey2);
      
      expect(await messagingContract.getPublicKey(alice.address)).to.equal(publicKey2);
    });
  });

  describe("Message Sending", function () {
    it("Should send messages successfully", async function () {
      const { messagingContract, alice, bob } = await loadFixture(deployMessagingContractFixture);
      
      const encryptedContent = "encrypted_message_content_here";
      const nonce = "unique_nonce_123";
      const messageFee = ethers.parseEther("0.001");
      
      await expect(
        messagingContract.connect(alice).sendMessage(bob.address, encryptedContent, nonce, {
          value: messageFee
        })
      )
        .to.emit(messagingContract, "MessageSent")
        .withArgs(alice.address, bob.address, encryptedContent, anyValue, nonce);
      
      expect(await messagingContract.getMessageCount(bob.address)).to.equal(1);
      expect(await messagingContract.getTotalMessageCount()).to.equal(1);
    });

    it("Should reject messages with insufficient fee", async function () {
      const { messagingContract, alice, bob } = await loadFixture(deployMessagingContractFixture);
      
      const encryptedContent = "encrypted_message_content_here";
      const nonce = "unique_nonce_123";
      const insufficientFee = ethers.parseEther("0.0005"); // Less than required 0.001
      
      await expect(
        messagingContract.connect(alice).sendMessage(bob.address, encryptedContent, nonce, {
          value: insufficientFee
        })
      ).to.be.revertedWith("Insufficient fee");
    });

    it("Should reject empty messages", async function () {
      const { messagingContract, alice, bob } = await loadFixture(deployMessagingContractFixture);
      
      const messageFee = ethers.parseEther("0.001");
      
      await expect(
        messagingContract.connect(alice).sendMessage(bob.address, "", "nonce", {
          value: messageFee
        })
      ).to.be.revertedWith("Message cannot be empty");
    });

    it("Should reject messages to self", async function () {
      const { messagingContract, alice } = await loadFixture(deployMessagingContractFixture);
      
      const messageFee = ethers.parseEther("0.001");
      
      await expect(
        messagingContract.connect(alice).sendMessage(alice.address, "message", "nonce", {
          value: messageFee
        })
      ).to.be.revertedWith("Cannot send message to yourself");
    });

    it("Should reject messages to zero address", async function () {
      const { messagingContract, alice } = await loadFixture(deployMessagingContractFixture);
      
      const messageFee = ethers.parseEther("0.001");
      
      await expect(
        messagingContract.connect(alice).sendMessage(ethers.ZeroAddress, "message", "nonce", {
          value: messageFee
        })
      ).to.be.revertedWith("Invalid recipient address");
    });

    it("Should enforce rate limiting", async function () {
      const { messagingContract, alice, bob } = await loadFixture(deployMessagingContractFixture);
      
      const messageFee = ethers.parseEther("0.001");
      
      // Send first message
      await messagingContract.connect(alice).sendMessage(bob.address, "message1", "nonce1", {
        value: messageFee
      });
      
      // Try to send second message immediately (should fail due to rate limiting)
      await expect(
        messagingContract.connect(alice).sendMessage(bob.address, "message2", "nonce2", {
          value: messageFee
        })
      ).to.be.revertedWith("Rate limit exceeded");
      
      // Wait for rate limit to pass (rate limit is 1 second, so we need to advance more than 1 second)
      await time.increase(2);
      
      // Now it should work
      await expect(
        messagingContract.connect(alice).sendMessage(bob.address, "message2", "nonce2", {
          value: messageFee
        })
      ).to.not.be.reverted;
    });
  });

  describe("Message Retrieval", function () {
    it("Should retrieve messages correctly", async function () {
      const { messagingContract, alice, bob } = await loadFixture(deployMessagingContractFixture);
      
      const messageFee = ethers.parseEther("0.001");
      
      // Send multiple messages
      await messagingContract.connect(alice).sendMessage(bob.address, "message1", "nonce1", {
        value: messageFee
      });
      
      await time.increase(2);
      
      await messagingContract.connect(alice).sendMessage(bob.address, "message2", "nonce2", {
        value: messageFee
      });
      
      // Retrieve messages
      const messages = await messagingContract.getMessages(bob.address, 0, 10);
      
      expect(messages.length).to.equal(2);
      expect(messages[0].encryptedContent).to.equal("message2"); // Newest first
      expect(messages[1].encryptedContent).to.equal("message1");
      expect(messages[0].from).to.equal(alice.address);
      expect(messages[0].to).to.equal(bob.address);
    });

    it("Should handle pagination correctly", async function () {
      const { messagingContract, alice, bob } = await loadFixture(deployMessagingContractFixture);
      
      const messageFee = ethers.parseEther("0.001");
      
      // Send 3 messages
      for (let i = 1; i <= 3; i++) {
        await messagingContract.connect(alice).sendMessage(bob.address, `message${i}`, `nonce${i}`, {
          value: messageFee
        });
        await time.increase(2);
      }
      
      // Get first page (limit 2)
      const page1 = await messagingContract.getMessages(bob.address, 0, 2);
      expect(page1.length).to.equal(2);
      expect(page1[0].encryptedContent).to.equal("message3"); // Newest first
      expect(page1[1].encryptedContent).to.equal("message2");
      
      // Get second page
      const page2 = await messagingContract.getMessages(bob.address, 2, 2);
      expect(page2.length).to.equal(1);
      expect(page2[0].encryptedContent).to.equal("message1");
    });

    it("Should return empty array for non-existent messages", async function () {
      const { messagingContract, bob } = await loadFixture(deployMessagingContractFixture);
      
      const messages = await messagingContract.getMessages(bob.address, 0, 10);
      expect(messages.length).to.equal(0);
    });
  });

  describe("Conversations", function () {
    it("Should retrieve conversation between two users", async function () {
      const { messagingContract, alice, bob, charlie } = await loadFixture(deployMessagingContractFixture);
      
      const messageFee = ethers.parseEther("0.001");
      
      // Alice sends to Bob
      await messagingContract.connect(alice).sendMessage(bob.address, "alice_to_bob_1", "nonce1", {
        value: messageFee
      });
      
      await time.increase(2);
      
      // Bob sends to Alice
      await messagingContract.connect(bob).sendMessage(alice.address, "bob_to_alice_1", "nonce2", {
        value: messageFee
      });
      
      await time.increase(2);
      
      // Charlie sends to Alice (should not be in Alice-Bob conversation)
      await messagingContract.connect(charlie).sendMessage(alice.address, "charlie_to_alice", "nonce3", {
        value: messageFee
      });
      
      await time.increase(2);
      
      // Alice sends to Bob again
      await messagingContract.connect(alice).sendMessage(bob.address, "alice_to_bob_2", "nonce4", {
        value: messageFee
      });
      
      // Get conversation between Alice and Bob
      const conversation = await messagingContract.getConversation(alice.address, bob.address, 10);
      
      expect(conversation.length).to.equal(3);
      expect(conversation[0].encryptedContent).to.equal("alice_to_bob_2"); // Newest first
      expect(conversation[1].encryptedContent).to.equal("bob_to_alice_1");
      expect(conversation[2].encryptedContent).to.equal("alice_to_bob_1");
    });
  });

  describe("Admin Functions", function () {
    it("Should allow owner to pause and unpause", async function () {
      const { messagingContract, owner, alice, bob } = await loadFixture(deployMessagingContractFixture);
      
      // Pause contract
      await messagingContract.connect(owner).pause();
      expect(await messagingContract.isPaused()).to.equal(true);
      
      // Try to send message while paused (should fail)
      const messageFee = ethers.parseEther("0.001");
      await expect(
        messagingContract.connect(alice).sendMessage(bob.address, "message", "nonce", {
          value: messageFee
        })
      ).to.be.revertedWith("Contract is paused");
      
      // Unpause contract
      await messagingContract.connect(owner).unpause();
      expect(await messagingContract.isPaused()).to.equal(false);
      
      // Now message should work
      await expect(
        messagingContract.connect(alice).sendMessage(bob.address, "message", "nonce", {
          value: messageFee
        })
      ).to.not.be.reverted;
    });

    it("Should only allow owner to pause", async function () {
      const { messagingContract, alice } = await loadFixture(deployMessagingContractFixture);
      
      await expect(
        messagingContract.connect(alice).pause()
      ).to.be.revertedWith("Only owner can call this function");
    });

    it("Should allow owner to withdraw fees", async function () {
      const { messagingContract, owner, alice, bob } = await loadFixture(deployMessagingContractFixture);
      
      const messageFee = ethers.parseEther("0.001");
      
      // Send a message to generate fees
      await messagingContract.connect(alice).sendMessage(bob.address, "message", "nonce", {
        value: messageFee
      });
      
      // Check contract balance
      expect(await ethers.provider.getBalance(await messagingContract.getAddress())).to.equal(messageFee);
      
      // Withdraw fees
      const initialBalance = await ethers.provider.getBalance(owner.address);
      const tx = await messagingContract.connect(owner).withdrawFees();
      const receipt = await tx.wait();
      const gasUsed = receipt!.gasUsed * tx.gasPrice!;
      
      const finalBalance = await ethers.provider.getBalance(owner.address);
      expect(finalBalance).to.equal(initialBalance + messageFee - gasUsed);
      
      // Contract balance should be zero
      expect(await ethers.provider.getBalance(await messagingContract.getAddress())).to.equal(0);
    });

    it("Should allow owner to transfer ownership", async function () {
      const { messagingContract, owner, alice } = await loadFixture(deployMessagingContractFixture);
      
      await messagingContract.connect(owner).transferOwnership(alice.address);
      expect(await messagingContract.owner()).to.equal(alice.address);
    });
  });

  describe("Edge Cases", function () {
    it("Should handle very long encrypted content", async function () {
      const { messagingContract, alice, bob } = await loadFixture(deployMessagingContractFixture);
      
      const messageFee = ethers.parseEther("0.001");
      const longContent = "a".repeat(4096); // Max length
      
      await expect(
        messagingContract.connect(alice).sendMessage(bob.address, longContent, "nonce", {
          value: messageFee
        })
      ).to.not.be.reverted;
      
      // Wait for rate limit
      await time.increase(2);
      
      const tooLongContent = "a".repeat(4097); // Over max length
      
      await expect(
        messagingContract.connect(alice).sendMessage(bob.address, tooLongContent, "nonce2", {
          value: messageFee
        })
      ).to.be.revertedWith("Message too long");
    });

    it("Should handle maximum pagination limits", async function () {
      const { messagingContract, alice } = await loadFixture(deployMessagingContractFixture);
      
      await expect(
        messagingContract.getMessages(alice.address, 0, 101) // Over limit
      ).to.be.revertedWith("Invalid limit");
      
      await expect(
        messagingContract.getMessages(alice.address, 0, 0) // Zero limit
      ).to.be.revertedWith("Invalid limit");
    });
  });
});
