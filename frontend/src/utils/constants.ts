// Contract addresses for different networks
export const CONTRACT_ADDRESSES = {
  // Sepolia Testnet - New V3 Messaging System
  11155111: {
    messaging: '0xf388F7e76e546183420a9C64CbA8A45eC31A668F',
    wallet: '0x356C2eBF9D6Bd617300F2476beF1E43452D064BF',
    escrow: '0x6809a01e367CEd8Ee03D87180590eA4161ad0ce1'
  },
  // Local Hardhat Network
  31337: {
    messaging: '0x0000000000000000000000000000000000000000',
    wallet: '0x0000000000000000000000000000000000000000',
    escrow: '0x0000000000000000000000000000000000000000'
  },
  // Mainnet (for future deployment)
  1: {
    messaging: '0x0000000000000000000000000000000000000000',
    wallet: '0x0000000000000000000000000000000000000000',
    escrow: '0x0000000000000000000000000000000000000000'
  }
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

// App constants - Updated for V3 system
export const MESSAGE_FEE_ETH = '0.001' // 0.001 ETH per message
export const MINIMUM_DEPOSIT_ETH = '0.01' // 0.01 ETH minimum deposit
export const RATE_LIMIT_HOURS = 1 // 1 hour rate limit window
export const MAX_MESSAGES_PER_HOUR = 100 // 100 messages per hour
export const MAX_CID_LENGTH = 200 // Max IPFS CID length
export const RATE_LIMIT_WINDOW = 3600 // 1 hour in seconds

// Default values
export const DEFAULT_CHAIN_ID = 11155111 // Sepolia testnet
export const DEFAULT_GAS_LIMIT = 500000
export const DEFAULT_GAS_PRICE = '20000000000' // 20 gwei
