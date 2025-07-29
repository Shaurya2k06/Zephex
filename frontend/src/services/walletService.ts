// Wallet Integration Service for Zephex V3
// Handles wallet deposits, withdrawals, and messaging contract authorization

import { ethers } from 'ethers';
import { getProvider, getSigner } from './web3Service';
import { CONTRACT_ADDRESSES } from '../utils/constants';

// Wallet ABI for the functions we need
const WALLET_ABI = [
  "function deposit() external payable",
  "function withdraw(uint256 amount) external", 
  "function checkBalance(address user) external view returns (uint256)",
  "function canAfford(address user, uint256 amount) external view returns (bool)",
  "function setAuthorizedSpender(address spender, bool authorized) external",
  "function isAuthorizedSpender(address spender) external view returns (bool)",
  "function spend(address from, uint256 amount) external returns (bool)",
  "event Deposited(address indexed user, uint256 amount, uint256 newBalance)",
  "event Withdrawn(address indexed user, uint256 amount, uint256 remainingBalance)",
  "event Spent(address indexed from, address indexed spender, uint256 amount, uint256 remainingBalance)"
];

export interface WalletBalance {
  balance: string; // In ETH
  balanceWei: bigint;
  canAffordMessage: boolean;
}

export interface DepositResult {
  txHash: string;
  newBalance: string;
}

export interface WithdrawalResult {
  txHash: string;
  remainingBalance: string;
}

export class WalletService {
  private static instance: WalletService;
  private walletContract: ethers.Contract | null = null;

  private constructor() {}

  static getInstance(): WalletService {
    if (!WalletService.instance) {
      WalletService.instance = new WalletService();
    }
    return WalletService.instance;
  }

  /**
   * Initialize wallet contract
   */
  async initialize(): Promise<void> {
    try {
      const provider = getProvider();
      const network = await provider.getNetwork();
      const chainId = Number(network.chainId);
      
      const addresses = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES];
      if (!addresses) {
        throw new Error(`Unsupported network: ${chainId}`);
      }

      // Initialize wallet contract
      this.walletContract = new ethers.Contract(addresses.wallet, WALLET_ABI, provider);
      
      console.log('✅ Wallet service initialized');
      console.log('🏦 Wallet Contract:', addresses.wallet);
      
    } catch (error) {
      console.error('❌ Failed to initialize wallet service:', error);
      throw error;
    }
  }

  /**
   * Get user's wallet balance
   */
  async getBalance(userAddress: string): Promise<WalletBalance> {
    if (!this.walletContract) {
      await this.initialize();
    }

    try {
      const balanceWei = await this.walletContract!.checkBalance(userAddress);
      const balance = ethers.formatEther(balanceWei);
      
      // Check if user can afford a message (0.001 ETH)
      const messageFee = ethers.parseEther('0.001');
      const canAffordMessage = await this.walletContract!.canAfford(userAddress, messageFee);
      
      return {
        balance,
        balanceWei,
        canAffordMessage
      };
    } catch (error) {
      console.error('❌ Failed to get wallet balance:', error);
      throw error;
    }
  }

  /**
   * Deposit ETH into user's wallet
   */
  async deposit(amountEth: string): Promise<DepositResult> {
    if (!this.walletContract) {
      await this.initialize();
    }

    try {
      console.log(`💰 Depositing ${amountEth} ETH to wallet...`);
      
      const signer = await getSigner();
      const walletWithSigner = this.walletContract!.connect(signer);
      
      const amountWei = ethers.parseEther(amountEth);
      
      // Call deposit function
      const tx = await walletWithSigner.getFunction('deposit')({ value: amountWei });
      
      console.log('⏳ Waiting for deposit confirmation...');
      await tx.wait();
      
      console.log(`✅ Deposit successful! TX: ${tx.hash}`);
      
      // Get updated balance
      const userAddress = await signer.getAddress();
      const updatedBalance = await this.getBalance(userAddress);
      
      return {
        txHash: tx.hash,
        newBalance: updatedBalance.balance
      };
    } catch (error: any) {
      console.error('❌ Deposit failed:', error);
      throw new Error(`Deposit failed: ${error.message}`);
    }
  }

  /**
   * Withdraw ETH from user's wallet
   */
  async withdraw(amountEth: string): Promise<WithdrawalResult> {
    if (!this.walletContract) {
      await this.initialize();
    }

    try {
      console.log(`💸 Withdrawing ${amountEth} ETH from wallet...`);
      
      const signer = await getSigner();
      const walletWithSigner = this.walletContract!.connect(signer);
      
      const amountWei = ethers.parseEther(amountEth);
      const tx = await walletWithSigner.getFunction('withdraw')(amountWei);
      
      console.log('⏳ Waiting for withdrawal confirmation...');
      await tx.wait();
      
      console.log(`✅ Withdrawal successful! TX: ${tx.hash}`);
      
      // Get updated balance
      const userAddress = await signer.getAddress();
      const updatedBalance = await this.getBalance(userAddress);
      
      return {
        txHash: tx.hash,
        remainingBalance: updatedBalance.balance
      };
    } catch (error: any) {
      console.error('❌ Withdrawal failed:', error);
      throw new Error(`Withdrawal failed: ${error.message}`);
    }
  }

  /**
   * Check if messaging contract is authorized to spend from wallet
   */
  async isMessagingAuthorized(): Promise<boolean> {
    if (!this.walletContract) {
      await this.initialize();
    }

    try {
      const provider = getProvider();
      const network = await provider.getNetwork();
      const chainId = Number(network.chainId);
      
      const addresses = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES];
      if (!addresses) {
        return false;
      }

      const isAuthorized = await this.walletContract!.isAuthorizedSpender(addresses.messaging);
      console.log('🔐 Messaging contract authorization status:', isAuthorized ? '✅ Authorized' : '❌ Not authorized');
      
      return isAuthorized;
    } catch (error) {
      console.error('❌ Failed to check authorization:', error);
      return false;
    }
  }

  /**
   * Authorize messaging contract to spend from wallet
   */
  async authorizeMessagingContract(): Promise<string> {
    if (!this.walletContract) {
      await this.initialize();
    }

    try {
      console.log('🔐 Authorizing messaging contract...');
      
      const signer = await getSigner();
      const walletWithSigner = this.walletContract!.connect(signer);
      
      const provider = getProvider();
      const network = await provider.getNetwork();
      const chainId = Number(network.chainId);
      
      const addresses = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES];
      if (!addresses) {
        throw new Error(`Unsupported network: ${chainId}`);
      }

      const tx = await walletWithSigner.getFunction('setAuthorizedSpender')(addresses.messaging, true);
      
      console.log('⏳ Waiting for authorization confirmation...');
      await tx.wait();
      
      console.log('✅ Messaging contract authorized!');
      
      return tx.hash;
    } catch (error: any) {
      console.error('❌ Authorization failed:', error);
      throw new Error(`Authorization failed: ${error.message}`);
    }
  }
}

// Export singleton instance
export const walletService = WalletService.getInstance();
