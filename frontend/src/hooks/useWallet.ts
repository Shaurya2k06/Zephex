import { useState, useEffect, useCallback } from 'react'
import { ethers } from 'ethers'
import { getProvider, getSigner, switchToNetwork } from '../services/web3Service'

export interface WalletInfo {
  address: string
  balance: string
  chainId: number
  chainName: string
  isConnected: boolean
}

export function useWalletInfo() {
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>('')

  const updateWalletInfo = useCallback(async () => {
    if (!window.ethereum) return

    setIsLoading(true)
    setError('')

    try {
      const provider = getProvider()
      const accounts = await provider.listAccounts()
      
      if (accounts.length === 0) {
        setWalletInfo(null)
        return
      }

      const signer = await getSigner()
      const address = await signer.getAddress()
      const balance = await provider.getBalance(address)
      const network = await provider.getNetwork()

      setWalletInfo({
        address,
        balance: ethers.formatEther(balance),
        chainId: Number(network.chainId),
        chainName: network.name,
        isConnected: true
      })
    } catch (err: any) {
      setError(err.message || 'Failed to get wallet info')
      setWalletInfo(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    updateWalletInfo()

    if (window.ethereum) {
      const handleAccountsChanged = () => updateWalletInfo()
      const handleChainChanged = () => updateWalletInfo()

      window.ethereum.on('accountsChanged', handleAccountsChanged)
      window.ethereum.on('chainChanged', handleChainChanged)

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
        window.ethereum.removeListener('chainChanged', handleChainChanged)
      }
    }
  }, [updateWalletInfo])

  return {
    walletInfo,
    isLoading,
    error,
    refreshWalletInfo: updateWalletInfo
  }
}

export function useNetworkSwitch() {
  const [isSwitching, setIsSwitching] = useState(false)
  const [error, setError] = useState<string>('')

  const switchNetwork = useCallback(async (chainId: number) => {
    setIsSwitching(true)
    setError('')

    try {
      await switchToNetwork(chainId)
    } catch (err: any) {
      setError(err.message || 'Failed to switch network')
      throw err
    } finally {
      setIsSwitching(false)
    }
  }, [])

  return {
    switchNetwork,
    isSwitching,
    error
  }
}

export function useWalletConnection() {
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string>('')

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      setError('MetaMask is not installed')
      return null
    }

    setIsConnecting(true)
    setError('')

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      })

      if (accounts.length === 0) {
        throw new Error('No accounts found')
      }

      const provider = getProvider()
      const signer = await getSigner()
      const address = await signer.getAddress()
      
      return {
        address,
        provider,
        signer
      }
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet')
      return null
    } finally {
      setIsConnecting(false)
    }
  }, [])

  const disconnectWallet = useCallback(() => {
    // Clear any cached data
    localStorage.removeItem('wallet_connected')
    localStorage.removeItem('wallet_address')
    setError('')
  }, [])

  return {
    connectWallet,
    disconnectWallet,
    isConnecting,
    error
  }
}

export function useWalletBalance(address?: string) {
  const [balance, setBalance] = useState<string>('0')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>('')

  const updateBalance = useCallback(async () => {
    if (!address || !window.ethereum) return

    setIsLoading(true)
    setError('')

    try {
      const provider = getProvider()
      const balanceWei = await provider.getBalance(address)
      setBalance(ethers.formatEther(balanceWei))
    } catch (err: any) {
      setError(err.message || 'Failed to get balance')
      setBalance('0')
    } finally {
      setIsLoading(false)
    }
  }, [address])

  useEffect(() => {
    updateBalance()
  }, [updateBalance])

  return {
    balance,
    isLoading,
    error,
    refreshBalance: updateBalance
  }
}
