// Contract addresses for different networks
export const CONTRACT_ADDRESSES = {
  // Sepolia Testnet
  11155111: '0xAC7eC9008D7Bd2354786E2bdeEd83907D1FB2Cc3',
  // Add other networks as needed
};

// Wallet contract addresses (will be deployed with messaging contract)
export const WALLET_CONTRACT_ADDRESSES = {
  // Sepolia Testnet
  11155111: '0x0000000000000000000000000000000000000000', // Will be updated after wallet deployment
  // Local Hardhat Network
  31337: '0x0000000000000000000000000000000000000000', // Will be updated after local deployment
  // Mainnet (if needed)
  1: '0x0000000000000000000000000000000000000000'
} as const

// Network configurations
export const NETWORKS = {
  11155111: {
    name: 'Sepolia',
    symbol: 'ETH',
    decimals: 18,
    rpcUrl: 'https://sepolia.infura.io/v3/',
    blockExplorer: 'https://sepolia.etherscan.io'
  },
  31337: {
    name: 'Localhost',
    symbol: 'ETH', 
    decimals: 18,
    rpcUrl: 'http://127.0.0.1:8545',
    blockExplorer: ''
  },
  1: {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18,
    rpcUrl: 'https://mainnet.infura.io/v3/',
    blockExplorer: 'https://etherscan.io'
  }
} as const

// App constants
export const MESSAGE_FEE_ETH = '0.001' // 0.001 ETH per message
export const RATE_LIMIT_SECONDS = 1 // 1 second between messages
export const MAX_MESSAGE_LENGTH = 4096 // Max encrypted message length
export const MAX_NONCE_LENGTH = 64 // Max nonce length

// Default values
export const DEFAULT_CHAIN_ID = 11155111 // Sepolia testnet
export const DEFAULT_GAS_LIMIT = 500000
export const DEFAULT_GAS_PRICE = '20000000000' // 20 gwei
