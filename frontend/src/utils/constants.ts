// Contract addresses for different networks
export const CONTRACT_ADDRESSES = {
  // Sepolia Testnet
  11155111: '0x4C3F5a84041E562928394d63b3E339bE70DBcC17', // Deployed MessagingContract
  // Local Hardhat Network
  31337: '0x5FbDB2315678afecb367f032d93F642f64180aa3', // Will be updated after local deployment
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
