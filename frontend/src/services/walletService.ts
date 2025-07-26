import { ethers } from 'ethers'
import { getContract, getContractReadOnly } from './web3Service'

export interface WalletBalance {
  balance: string
  formatted: string
}

// Wallet service for the in-built wallet functionality
export class WalletService {
  
  /**
   * Deposit ETH into the user's in-built wallet
   */
  static async deposit(amount: string): Promise<string> {
    try {
      const contract = await getContract()
      
      const transaction = await contract.depositToWallet({
        value: ethers.parseEther(amount),
        gasLimit: 100000
      })
      
      await transaction.wait()
      return transaction.hash
    } catch (error: any) {
      console.error('Failed to deposit to wallet:', error)
      throw new Error(error.message || 'Failed to deposit to wallet')
    }
  }

  /**
   * Withdraw ETH from the user's in-built wallet
   */
  static async withdraw(amount: string): Promise<string> {
    try {
      const contract = await getContract()
      
      const transaction = await contract.withdrawFromWallet(
        ethers.parseEther(amount),
        { gasLimit: 100000 }
      )
      
      await transaction.wait()
      return transaction.hash
    } catch (error: any) {
      console.error('Failed to withdraw from wallet:', error)
      throw new Error(error.message || 'Failed to withdraw from wallet')
    }
  }

  /**
   * Get user's wallet balance
   */
  static async getBalance(userAddress: string): Promise<WalletBalance> {
    try {
      const contract = await getContractReadOnly()
      
      const balance = await contract.getWalletBalance(userAddress)
      const formatted = ethers.formatEther(balance)
      
      return {
        balance: balance.toString(),
        formatted
      }
    } catch (error: any) {
      console.error('Failed to get wallet balance:', error)
      throw new Error(error.message || 'Failed to get wallet balance')
    }
  }

  /**
   * Listen for wallet events
   */
  static async listenForWalletEvents(
    userAddress: string, 
    callback: (event: { type: 'deposit' | 'withdrawal', amount: string, timestamp: number }) => void
  ): Promise<() => void> {
    try {
      const contract = await getContractReadOnly()
      
      // Listen for deposit events
      const depositFilter = contract.filters.Deposit(userAddress)
      const withdrawalFilter = contract.filters.Withdrawal(userAddress)
      
      const handleDeposit = (user: string, amount: bigint, timestamp: bigint) => {
        if (user.toLowerCase() === userAddress.toLowerCase()) {
          callback({
            type: 'deposit',
            amount: ethers.formatEther(amount),
            timestamp: Number(timestamp)
          })
        }
      }
      
      const handleWithdrawal = (user: string, amount: bigint, timestamp: bigint) => {
        if (user.toLowerCase() === userAddress.toLowerCase()) {
          callback({
            type: 'withdrawal',
            amount: ethers.formatEther(amount),
            timestamp: Number(timestamp)
          })
        }
      }
      
      contract.on(depositFilter, handleDeposit)
      contract.on(withdrawalFilter, handleWithdrawal)
      
      // Return cleanup function
      return () => {
        contract.off(depositFilter, handleDeposit)
        contract.off(withdrawalFilter, handleWithdrawal)
      }
    } catch (error: any) {
      console.error('Failed to listen for wallet events:', error)
      return () => {} // Return empty cleanup function
    }
  }
}
