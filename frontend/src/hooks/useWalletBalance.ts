import { useState, useEffect, useCallback } from 'react'
import { WalletService } from '../services/walletService'
import type { WalletBalance } from '../services/walletService'

export function useWalletBalance(userAddress?: string) {
  const [balance, setBalance] = useState<WalletBalance>({ balance: '0', formatted: '0.000' })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>('')

  const refreshBalance = useCallback(async () => {
    if (!userAddress) return

    setIsLoading(true)
    setError('')

    try {
      const walletBalance = await WalletService.getBalance(userAddress)
      setBalance(walletBalance)
    } catch (err: any) {
      setError(err.message || 'Failed to load wallet balance')
      console.error('Failed to load wallet balance:', err)
    } finally {
      setIsLoading(false)
    }
  }, [userAddress])

  useEffect(() => {
    refreshBalance()
  }, [refreshBalance])

  // Listen for wallet events
  useEffect(() => {
    if (!userAddress) return

    let cleanup: (() => void) | undefined

    const setupListener = async () => {
      try {
        cleanup = await WalletService.listenForWalletEvents(userAddress, (event) => {
          console.log('Wallet event:', event)
          // Refresh balance when wallet events occur
          refreshBalance()
        })
      } catch (err) {
        console.error('Failed to setup wallet listener:', err)
      }
    }

    setupListener()

    return () => {
      if (cleanup) cleanup()
    }
  }, [userAddress, refreshBalance])

  return {
    balance,
    isLoading,
    error,
    refreshBalance
  }
}

export function useWalletOperations() {
  const [isDepositing, setIsDepositing] = useState(false)
  const [isWithdrawing, setIsWithdrawing] = useState(false)
  const [error, setError] = useState<string>('')

  const deposit = useCallback(async (amount: string) => {
    setIsDepositing(true)
    setError('')

    try {
      const txHash = await WalletService.deposit(amount)
      console.log('Deposit transaction:', txHash)
      return txHash
    } catch (err: any) {
      setError(err.message || 'Failed to deposit')
      throw err
    } finally {
      setIsDepositing(false)
    }
  }, [])

  const withdraw = useCallback(async (amount: string) => {
    setIsWithdrawing(true)
    setError('')

    try {
      const txHash = await WalletService.withdraw(amount)
      console.log('Withdrawal transaction:', txHash)
      return txHash
    } catch (err: any) {
      setError(err.message || 'Failed to withdraw')
      throw err
    } finally {
      setIsWithdrawing(false)
    }
  }, [])

  const clearError = useCallback(() => {
    setError('')
  }, [])

  return {
    deposit,
    withdraw,
    isDepositing,
    isWithdrawing,
    error,
    clearError
  }
}
