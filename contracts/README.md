# Zephex Smart Contracts

This directory contains the smart contracts for the Zephex end-to-end encrypted messaging system built on Ethereum.

## 📋 Overview

Zephex implements a fully decentralized messaging system where:
- Messages are encrypted client-side before being stored on IPFS
- Only IPFS content identifiers (CIDs) are stored on-chain
- Users manage their own wallets with deposit/withdrawal functionality
- Message fees are handled through an escrow system
- Rate limiting prevents spam and abuse

## 🏗️ Architecture

### Core Contracts

#### 1. MessagingContract.sol
**Primary messaging contract with full OpenZeppelin integration**

- **Purpose**: Handles encrypted message transmission via IPFS storage
- **Features**:
  - IPFS CID storage for encrypted messages
  - Rate limiting (100 messages/hour by default)
  - User blocking/unblocking (admin)
  - Message fee collection
  - Conversation indexing
  - Pagination support
- **Dependencies**: OpenZeppelin (Ownable, ReentrancyGuard, Pausable)

#### 2. MessagingContractV3Simple.sol
**Simplified messaging contract without OpenZeppelin dependencies**

- **Purpose**: Lightweight version for gas optimization
- **Features**: Same core functionality as MessagingContract but with custom implementations
- **Gas Optimized**: Reduced external dependencies for lower deployment costs

#### 3. UserWalletContract.sol
**User wallet management with OpenZeppelin security**

- **Purpose**: Manages user deposits, withdrawals, and spending authorization
- **Features**:
  - Minimum deposit requirement (0.01 ETH)
  - Authorized spender pattern for messaging contracts
  - Emergency withdrawal (admin)
  - Balance tracking and statistics
- **Security**: ReentrancyGuard, Ownable, Pausable

#### 4. SimpleEscrow.sol
**Message fee escrow system**

- **Purpose**: Holds and manages message fees with refund capability
- **Features**:
  - Fee collection from messaging contracts
  - Refund system for disputed messages
  - Owner withdrawal functionality
  - Transparent fund tracking

### Legacy/Alternative Contracts

- **MessagingContractV3.sol**: Previous version with different architecture
- **UserWalletContractSimple.sol**: Simplified wallet without OpenZeppelin
- **EscrowManager.sol**: Advanced escrow with multi-sig capabilities

## 🚀 Deployment

### Prerequisites

1. **Environment Setup**:
   ```bash
   npm install
   cp .env.example .env
   ```

2. **Required Environment Variables**:
   ```env
   SEPOLIA_PRIVATE_KEY=your_private_key_here
   INFURA_PROJECT_ID=your_infura_project_id
   ETHERSCAN_API_KEY=your_etherscan_api_key
   ```

### Deployment Commands

```bash
# Compile contracts
npm run compile

# Deploy to Sepolia testnet
npm run deploy:sepolia

# Run tests
npm run test

# Clean artifacts
npm run clean
```

### Custom Deployment Scripts

```bash
# Deploy all contracts (production-ready)
npx hardhat run scripts/deploy-all.ts --network sepolia

# Deploy V3 simple contracts (gas optimized)
npx hardhat run scripts/deploy-v3.ts --network sepolia

# Production deployment with verification
npx hardhat run scripts/deploy-production.ts --network sepolia
```

## 📊 Contract Specifications

### Message Structure
```solidity
struct Message {
    address sender;     // Message sender address
    address receiver;   // Message recipient address
    string cid;         // IPFS content identifier
    uint256 timestamp;  // Block timestamp
    uint256 messageId;  // Unique message identifier
}
```

### Key Parameters

| Parameter | Value | Description |
|-----------|-------|-------------|
| Minimum Deposit | 0.01 ETH | Required minimum for wallet deposits |
| Message Fee | 0.001 ETH | Fee per message (configurable) |
| Rate Limit | 100 msg/hour | Maximum messages per user per hour |
| Rate Window | 1 hour | Time window for rate limiting |
| Max CID Length | 200 chars | Maximum IPFS CID string length |

## 🔧 Configuration

### Network Configuration (Hardhat)

- **Solidity Version**: 0.8.28
- **Optimizer**: Enabled (200 runs)
- **Target Network**: Sepolia Testnet
- **Gas Price**: 20 Gwei
- **Chain ID**: 11155111

### Contract Verification

After deployment, verify contracts on Etherscan:

```bash
npx hardhat verify --network sepolia <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
```

## 🧪 Testing

### Test Structure

```bash
test/
├── MessagingContract.test.ts    # Core messaging tests
├── UserWallet.test.ts          # Wallet functionality tests
├── Escrow.test.ts              # Escrow system tests
└── Integration.test.ts         # End-to-end integration tests
```

### Running Tests

```bash
# Run all tests
npm test

# Run with gas reporting
REPORT_GAS=true npm test

# Run specific test file
npx hardhat test test/MessagingContract.test.ts
```

## 🛡️ Security Features

### Access Control
- **Owner-only functions**: Fee updates, user blocking, emergency operations
- **Authorized spenders**: Only messaging contracts can spend from wallets
- **Rate limiting**: Prevents spam and abuse

### Security Patterns
- **ReentrancyGuard**: Prevents reentrancy attacks
- **Pausable**: Emergency pause functionality
- **Input validation**: Comprehensive parameter checking
- **Safe transfers**: Using `call` with proper error handling

### Audit Considerations
- OpenZeppelin battle-tested contracts
- Custom error messages for gas efficiency
- Event logging for transparency
- Immutable critical addresses

## 📁 Directory Structure

```
contracts/
├── contracts/                  # Solidity source files
│   ├── MessagingContract.sol          # Main messaging contract
│   ├── MessagingContractV3Simple.sol  # Gas-optimized version
│   ├── UserWalletContract.sol         # User wallet management
│   ├── SimpleEscrow.sol              # Fee escrow system
│   └── ...                           # Other contracts
├── scripts/                    # Deployment scripts
│   ├── deploy-all.ts                 # Complete deployment
│   ├── deploy-v3.ts                  # V3 contracts only
│   └── deploy-production.ts          # Production deployment
├── test/                      # Test files
├── artifacts/                 # Compiled contract artifacts
├── typechain-types/           # TypeScript contract types
├── hardhat.config.ts         # Hardhat configuration
├── package.json              # Node.js dependencies
└── README.md                 # This file
```

## 🔗 Integration

### Frontend Integration

The contracts are designed to work with the Zephex frontend application:

- **Contract ABIs**: Available in `artifacts/` after compilation
- **TypeScript Types**: Generated in `typechain-types/`
- **Network Configuration**: Matches frontend constants

### IPFS Integration

Messages are stored on IPFS with the following flow:
1. Client encrypts message content
2. Client uploads encrypted content to IPFS
3. Client calls `sendMessage()` with IPFS CID
4. Smart contract stores CID on-chain
5. Recipients retrieve CID and fetch content from IPFS

## 📈 Gas Optimization

### Strategies Implemented
- **Packed structs**: Efficient storage layout
- **Custom errors**: Lower gas than string reverts
- **Minimal external calls**: Reduced cross-contract calls
- **Event indexing**: Optimal event parameter indexing

### Gas Estimates (Sepolia)
- Deploy MessagingContract: ~2.5M gas
- Deploy UserWalletContract: ~1.8M gas
- Send Message: ~150k gas
- Deposit to Wallet: ~50k gas

## 🚨 Important Notes

### Security Warnings
- **Private Keys**: Never commit private keys to version control
- **Testnet Only**: Current deployment is for Sepolia testnet
- **Admin Keys**: Secure admin private keys for production

### Upgrade Considerations
- Contracts are not upgradeable by design for security
- New versions require redeployment
- Migration scripts needed for user funds

## 📞 Support

For technical questions or issues:
- Check the main project README
- Review contract comments and NatSpec documentation
- Examine test files for usage examples

## 📄 License

MIT License - see LICENSE file for details.
