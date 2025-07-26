import { useWallet } from '../../contexts/WalletContext'
import { useWalletInfo } from '../../hooks/useWallet'
import { useState } from 'react'

interface WalletConnectProps {
  className?: string
}

export function WalletConnect({ className = '' }: WalletConnectProps) {
  const { user, isConnecting, error, connectWallet, disconnectWallet } = useWallet()
  const { walletInfo, isLoading: isLoadingInfo, refreshWalletInfo } = useWalletInfo()
  const [showDetails, setShowDetails] = useState(false)

  const isOnSepolia = walletInfo?.chainId === 11155111

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const formatBalance = (balance: string) => {
    const num = parseFloat(balance)
    if (num < 0.001) return '< 0.001 ETH'
    return `${num.toFixed(4)} ETH`
  }

  if (!user?.isConnected) {
    return (
      <div className={`flex flex-col items-center space-y-4 ${className}`}>
        <button
          onClick={connectWallet}
          disabled={isConnecting}
          className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2"
        >
          {isConnecting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Connecting...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 2v8h10V6H5z" clipRule="evenodd" />
              </svg>
              <span>Connect MetaMask</span>
            </>
          )}
        </button>
        
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-red-700 dark:text-red-400 text-sm max-w-md">
            <p className="font-medium">Connection Failed</p>
            <p>{error}</p>
          </div>
        )}
        
        <div className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-md">
          <p>Connect your MetaMask wallet to start using Zephex</p>
          <p className="mt-1">Zephex operates on Sepolia testnet</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main wallet info card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Connection status indicator */}
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Connected
              </span>
            </div>
            
            {/* Sepolia badge */}
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
              isOnSepolia 
                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
            }`}>
              {isOnSepolia ? 'Sepolia' : 'Wrong Network'}
            </div>
          </div>
          
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <svg className={`w-5 h-5 transition-transform ${showDetails ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
        
        {/* Address and balance */}
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400">Address</span>
            <code className="text-sm font-mono text-gray-900 dark:text-white">
              {formatAddress(user.address)}
            </code>
          </div>
          
          {walletInfo && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">Balance</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {isLoadingInfo ? (
                  <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-4 w-16 rounded"></div>
                ) : (
                  formatBalance(walletInfo.balance)
                )}
              </span>
            </div>
          )}
        </div>
      </div>
      
      {/* Expanded details */}
      {showDetails && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4">
          {/* Network warning for non-Sepolia */}
          {!isOnSepolia && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-800 dark:text-red-200">
                    Incorrect Network
                  </p>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                    Zephex only works on Sepolia testnet. Please switch to Sepolia in MetaMask to use the platform.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Wallet details */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">Full Address</span>
              <button
                onClick={() => navigator.clipboard.writeText(user.address)}
                className="text-sm font-mono text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center space-x-1"
              >
                <span>{user.address}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
            
            {walletInfo && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Chain ID</span>
                  <span className="text-sm font-mono text-gray-900 dark:text-white">
                    {walletInfo.chainId}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Network</span>
                  <span className="text-sm font-mono text-gray-900 dark:text-white">
                    {walletInfo.chainName || 'Unknown'}
                  </span>
                </div>
              </>
            )}
          </div>
          
          {/* Actions */}
          <div className="flex space-x-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={refreshWalletInfo}
              disabled={isLoadingInfo}
              className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              {isLoadingInfo ? 'Refreshing...' : 'Refresh'}
            </button>
            
            <button
              onClick={disconnectWallet}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Disconnect
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
