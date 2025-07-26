import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES } from '../utils/constants';

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
  private chainId: number;

  constructor(provider: ethers.BrowserProvider, chainId: number) {
    this.provider = provider;
    this.chainId = chainId;
    
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
    const walletWithSigner = this.walletContract.connect(signer);
    
    const amountWei = ethers.parseEther(amountEth);
    const tx = await walletWithSigner.deposit({ value: amountWei });
    
    return tx.hash;
  }

  /**
   * Withdraw ETH from user's wallet
   */
  async withdraw(amountEth: string): Promise<string> {
    const signer = await this.provider.getSigner();
    const walletWithSigner = this.walletContract.connect(signer);
    
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
   * Encrypt message content
   */
  private async encryptMessage(content: string, recipientAddress: string): Promise<string> {
    // For now, we'll use a simple base64 encoding
    // In production, you'd want to use proper encryption with recipient's public key
    const messageData: EncryptedMessage = {
      content,
      timestamp: Date.now(),
      from: await (await this.provider.getSigner()).getAddress(),
      to: recipientAddress
    };

    return btoa(JSON.stringify(messageData));
  }

  /**
   * Decrypt message content
   */
  private decryptMessage(encryptedContent: string): EncryptedMessage {
    try {
      return JSON.parse(atob(encryptedContent));
    } catch (error) {
      throw new Error('Failed to decrypt message');
    }
  }

  /**
   * Upload content to IPFS (mock implementation)
   */
  private async uploadToIPFS(content: string): Promise<string> {
    // This is a mock implementation
    // In production, you'd use a real IPFS service like Pinata, Infura IPFS, or local IPFS node
    
    // For now, we'll simulate IPFS by creating a hash-like CID
    const encoder = new TextEncoder();
    const data = encoder.encode(content);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
    
    // Simulate IPFS CID format
    return `Qm${hashHex.substring(0, 44)}`;
  }

  /**
   * Retrieve content from IPFS (mock implementation)
   */
  private async retrieveFromIPFS(cid: string): Promise<string> {
    // This is a mock implementation
    // In production, you'd retrieve from actual IPFS
    
    // For demo purposes, we'll store the content in localStorage with the CID as key
    const stored = localStorage.getItem(`ipfs_${cid}`);
    if (!stored) {
      throw new Error('Content not found in IPFS');
    }
    return stored;
  }

  /**
   * Send a message
   */
  async sendMessage(to: string, content: string): Promise<string> {
    try {
      const signer = await this.provider.getSigner();
      const messagingWithSigner = this.messagingContract.connect(signer);

      // 1. Encrypt the message
      const encryptedContent = await this.encryptMessage(content, to);

      // 2. Upload to IPFS
      const cid = await this.uploadToIPFS(encryptedContent);
      
      // Store in localStorage for demo (in production, this would be on IPFS)
      localStorage.setItem(`ipfs_${cid}`, encryptedContent);

      // 3. Send transaction
      const tx = await messagingWithSigner.sendMessage(to, cid);
      
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
      // 1. Retrieve from IPFS
      const encryptedContent = await this.retrieveFromIPFS(message.cid);
      
      // 2. Decrypt content
      const decrypted = this.decryptMessage(encryptedContent);
      
      return decrypted.content;
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
