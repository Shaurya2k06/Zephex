import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'

interface User {
  address: string
  publicKey?: string
  isConnected: boolean
}

interface WalletContextType {
  user: User | null
  isConnecting: boolean
  error: string
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
}

interface WalletProviderProps {
  children: ReactNode
}

// Add MetaMask to window type
declare global {
  interface Window {
    ethereum?: any
  }
}

export function WalletProvider({ children }: WalletProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState('')

  const connectWallet = async () => {
    setIsConnecting(true)
    setError('')
    
    try {
      if (!window.ethereum) {
        throw new Error('MetaMask is not installed')
      }
      
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      })
      
      if (accounts.length > 0) {
        const address = accounts[0]
        setUser({
          address,
          isConnected: true
        })
        
        // Store connection state
        localStorage.setItem('wallet_connected', 'true')
        localStorage.setItem('wallet_address', address)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet')
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnectWallet = () => {
    setUser(null)
    localStorage.removeItem('wallet_connected')
    localStorage.removeItem('wallet_address')
  }

  // Auto-connect on page load if previously connected
  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum && localStorage.getItem('wallet_connected')) {
        try {
          const accounts = await window.ethereum.request({ 
            method: 'eth_accounts' 
          })
          
          if (accounts.length > 0) {
            setUser({
              address: accounts[0],
              isConnected: true
            })
          }
        } catch (err) {
          console.error('Failed to check wallet connection:', err)
        }
      }
    }
    
    checkConnection()
  }, [])

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet()
        } else {
          setUser({
            address: accounts[0],
            isConnected: true
          })
        }
      }

      window.ethereum.on('accountsChanged', handleAccountsChanged)
      
      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
      }
    }
  }, [])

  const value: WalletContextType = {
    user,
    isConnecting,
    error,
    connectWallet,
    disconnectWallet
  }

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  )
}
