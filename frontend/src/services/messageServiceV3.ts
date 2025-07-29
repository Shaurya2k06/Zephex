import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES } from '../utils/constants';
import { ipfsService } from './ipfsService';
import { encryptionService } from './encryptionServiceV2';

// Import ABIs - we'll use simple ABI arrays for now
const MessagingV3ABI = [
  "function sendMessage(address receiver, string memory cid) external returns (uint256)",
  "function getMessage(uint256 messageId) external view returns (tuple(address sender, address receiver, string cid, uint256 timestamp))",
  "function getMessages(address user, bool sent) external view returns (uint256[])",
  "function getConversation(address user1, address user2, uint256 limit) external view returns (uint256[])",
  "function canSendMessage(address user) external view returns (bool, uint8)",
  "function getContractStats() external view returns (uint256, uint256, address, uint256)",
  "event MessageSent(uint256 indexed messageId, address indexed sender, address indexed receiver, string cid, uint256 timestamp, uint256 feePaid)"
];

const WalletABI = [
  "function deposit() external payable",
  "function withdraw(uint256 amount) external",
  "function checkBalance(address user) external view returns (uint256)",
  "function canAfford(address user, uint256 amount) external view returns (bool)"
];

export interface MessageV3 {
  sender: string;
  receiver: string;
  cid: string; // IPFS CID of encrypted content
  timestamp: number;
  messageId?: number;
}

export interface EncryptedMessage {
  content: string;
  timestamp: number;
  from: string;
  to: string;
}

export class MessageServiceV3 {
  private provider: ethers.BrowserProvider;
  private messagingContract: ethers.Contract;
  private walletContract: ethers.Contract;

  constructor(provider: ethers.BrowserProvider, chainId: number) {
    this.provider = provider;
    
    const addresses = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES];
    if (!addresses) {
      throw new Error(`Unsupported chain ID: ${chainId}`);
    }

    this.messagingContract = new ethers.Contract(
      addresses.messaging,
      MessagingV3ABI,
      provider
    );

    this.walletContract = new ethers.Contract(
      addresses.wallet,
      WalletABI,
      provider
    );
  }

  /**
   * Deposit ETH into user's wallet
   */
  async deposit(amountEth: string): Promise<string> {
    const signer = await this.provider.getSigner();
    const walletWithSigner = this.walletContract.connect(signer) as any;
    
    const amountWei = ethers.parseEther(amountEth);
    const tx = await walletWithSigner.deposit({ value: amountWei });
    
    return tx.hash;
  }

  /**
   * Withdraw ETH from user's wallet
   */
  async withdraw(amountEth: string): Promise<string> {
    const signer = await this.provider.getSigner();
    const walletWithSigner = this.walletContract.connect(signer) as any;
    
    const amountWei = ethers.parseEther(amountEth);
    const tx = await walletWithSigner.withdraw(amountWei);
    
    return tx.hash;
  }

  /**
   * Get user's wallet balance
   */
  async getBalance(userAddress: string): Promise<string> {
    const balanceWei = await this.walletContract.checkBalance(userAddress);
    return ethers.formatEther(balanceWei);
  }

  /**
   * Check if user can send a message
   */
  async canSendMessage(userAddress: string): Promise<{ canSend: boolean; reason: string }> {
    try {
      const [canSend, reasonCode] = await this.messagingContract.canSendMessage(userAddress);
      
      const reasons = {
        0: 'Can send',
        1: 'Insufficient balance',
        2: 'Rate limited',
        3: 'User blocked'
      };

      return {
        canSend,
        reason: reasons[reasonCode as keyof typeof reasons] || 'Unknown error'
      };
    } catch (error) {
      return { canSend: false, reason: 'Error checking status' };
    }
  }

  /**
   * Send a message
   */
  async sendMessage(to: string, content: string): Promise<string> {
    try {
      const signer = await this.provider.getSigner();
      const messagingWithSigner = this.messagingContract.connect(signer) as any;

      // 1. Initialize encryption if needed
      await encryptionService.initializeUserKeys();

      // 2. Get recipient's public key (mock for now - in production, this would be stored on-chain or shared)
      const recipientPublicKey = encryptionService.generateMockPublicKey(to);

      // 3. Encrypt the message
      const encryptionResult = await encryptionService.encryptMessage(content, recipientPublicKey);
      
      // 4. Upload encrypted message to IPFS
      const ipfsResult = await ipfsService.uploadContent(JSON.stringify(encryptionResult));
      
      console.log(`Message encrypted and uploaded to IPFS: ${ipfsResult.cid}`);

      // 5. Send transaction with IPFS CID
      const tx = await messagingWithSigner.sendMessage(to, ipfsResult.cid);
      
      return tx.hash;
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  }

  /**
   * Get messages for a user
   */
  async getMessages(userAddress: string, sent: boolean = false): Promise<MessageV3[]> {
    try {
      const messageIds = await this.messagingContract.getMessages(userAddress, sent);
      
      const messages: MessageV3[] = [];
      
      for (const messageId of messageIds) {
        try {
          const message = await this.messagingContract.getMessage(messageId);
          
          messages.push({
            sender: message.sender,
            receiver: message.receiver,
            cid: message.cid,
            timestamp: Number(message.timestamp),
            messageId: Number(messageId)
          });
        } catch (error) {
          console.error(`Failed to fetch message ${messageId}:`, error);
        }
      }

      return messages.sort((a, b) => a.timestamp - b.timestamp);
    } catch (error) {
      console.error('Failed to get messages:', error);
      return [];
    }
  }

  /**
   * Get decrypted message content
   */
  async getMessageContent(message: MessageV3): Promise<string> {
    try {
      // 1. Retrieve encrypted content from IPFS
      const encryptedDataString = await ipfsService.getContent(message.cid);
      
      if (!encryptedDataString) {
        return '[Message not found on IPFS]';
      }

      // 2. Parse encryption result
      const encryptionResult = JSON.parse(encryptedDataString);

      // 3. Get sender's public key (mock for now)
      const senderPublicKey = encryptionService.generateMockPublicKey(message.sender);

      // 4. Decrypt the message
      const decryptedContent = await encryptionService.decryptMessage(encryptionResult, senderPublicKey);
      
      return decryptedContent;
    } catch (error) {
      console.error('Failed to get message content:', error);
      return '[Message could not be decrypted]';
    }
  }

  /**
   * Get conversation between two users
   */
  async getConversation(user1: string, user2: string, limit: number = 50): Promise<MessageV3[]> {
    try {
      const messageIds = await this.messagingContract.getConversation(user1, user2, limit);
      
      const messages: MessageV3[] = [];
      
      for (const messageId of messageIds) {
        try {
          const message = await this.messagingContract.getMessage(messageId);
          
          messages.push({
            sender: message.sender,
            receiver: message.receiver,
            cid: message.cid,
            timestamp: Number(message.timestamp),
            messageId: Number(messageId)
          });
        } catch (error) {
          console.error(`Failed to fetch message ${messageId}:`, error);
        }
      }

      return messages.sort((a, b) => a.timestamp - b.timestamp);
    } catch (error) {
      console.error('Failed to get conversation:', error);
      return [];
    }
  }

  /**
   * Get contract statistics
   */
  async getContractStats() {
    try {
      const [totalMessages, currentFee, escrowAddr, totalFeesCollected] = 
        await this.messagingContract.getContractStats();

      return {
        totalMessages: Number(totalMessages),
        currentFee: ethers.formatEther(currentFee),
        escrowAddress: escrowAddr,
        totalFeesCollected: ethers.formatEther(totalFeesCollected)
      };
    } catch (error) {
      console.error('Failed to get contract stats:', error);
      return null;
    }
  }

  /**
   * Listen for new messages
   */
  onNewMessage(callback: (message: MessageV3) => void) {
    this.messagingContract.on('MessageSent', 
      async (messageId: bigint, sender: string, receiver: string, cid: string, timestamp: bigint) => {
        callback({
          sender,
          receiver,
          cid,
          timestamp: Number(timestamp),
          messageId: Number(messageId)
        });
      }
    );
  }

  /**
   * Stop listening for messages
   */
  removeListeners() {
    this.messagingContract.removeAllListeners('MessageSent');
  }
}
