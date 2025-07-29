# Zephex Smart Contracts

**Decentralized messaging system with IPFS storage and user wallet management**

Smart contracts for the Zephex end-to-end encrypted messaging platform, featuring IPFS integration, user wallet management, and escrow-based fee system.

## 📋 Overview

Zephex implements a fully decentralized messaging architecture where:
- **Messages encrypted client-side** before IPFS storage
- **IPFS CIDs stored on-chain** for message retrieval
- **User wallets manage spending** with deposit/withdrawal system
- **Escrow handles message fees** with refund capability
- **Rate limiting prevents spam** and abuse

## 🏗️ Smart Contract Architecture

### Core Contracts

#### 1. MessagingContractV3Simple.sol
**Primary messaging contract with IPFS integration**

```solidity
interface MessagingContract {
    function sendMessage(address receiver, string memory cid) external returns (uint256);
    function getMessage(uint256 messageId) external view returns (Message memory);
    function getConversation(address user1, address user2, uint256 limit) external view returns (uint256[] memory);
}
```

**Key Features:**
- IPFS CID storage for encrypted message content
- Rate limiting (100 messages/hour by default)
- User blocking and contract pause functionality
- Conversation indexing and pagination
- Integration with user wallet for fee payment
- Event logging for message tracking

**Gas Optimized:**
- Custom error messages (lower gas than string reverts)
- Packed storage layout
- Minimal external dependencies

#### 2. UserWalletContractSimple.sol
**User deposit/withdrawal management system**

```solidity
interface UserWallet {
    function deposit() external payable;
    function withdraw(uint256 amount) external;
    function spend(address from, uint256 amount) external returns (bool);
    function checkBalance(address user) external view returns (uint256);
}
```

**Key Features:**
- Minimum deposit requirement (0.01 ETH)
- Authorized spender pattern for messaging contracts
- Balance tracking and spending history
- Emergency withdrawal capabilities
- Transparent fund management

#### 3. SimpleEscrow.sol
**Message fee escrow and refund system**

```solidity
interface Escrow {
    function withdraw(address to, uint256 amount) external;
    function issueRefund(address user, uint256 amount) external;
    function claimRefund() external;
}
```

**Key Features:**
- Holds message fees from transactions
- Owner-controlled fund withdrawal
- User refund system for disputed messages
- Transparent accounting and statistics

## 📊 Contract Parameters

### Message System
| Parameter | Default Value | Description |
|-----------|---------------|-------------|
| Message Fee | 0.001 ETH | Cost per message |
| Rate Limit | 100 messages/hour | Anti-spam protection |
| Rate Window | 1 hour | Time window for rate limiting |
| Max CID Length | 200 characters | IPFS CID limit |

### User Wallet
| Parameter | Value | Description |
|-----------|-------|-------------|
| Minimum Deposit | 0.01 ETH | Required minimum deposit |
| Withdrawal Limit | User Balance | Maximum withdrawal amount |

### Network Configuration
- **Solidity Version**: ^0.8.19
- **Target Network**: Sepolia Testnet
- **Chain ID**: 11155111
- **Optimizer**: Enabled (200 runs)

## 🚀 Deployment

### Prerequisites

1. **Environment Setup**:
   ```bash
   npm install
   cp .env.example .env
   ```

2. **Required Environment Variables**:
   ```bash
   SEPOLIA_PRIVATE_KEY=your_wallet_private_key
   INFURA_PROJECT_ID=your_infura_project_id
   ETHERSCAN_API_KEY=your_etherscan_api_key
   ```

### Deployment Commands

```bash
# Compile all contracts
npm run compile

# Deploy to Sepolia testnet  
npm run deploy:sepolia

# Run comprehensive tests
npm run test

# Clean build artifacts
npm run clean
```

### Custom Deployment

```bash
# Deploy V3 Simple contracts (recommended)
npx hardhat run scripts/deploy-v3.ts --network sepolia

# Deploy all contracts with verification
npx hardhat run scripts/deploy-all.ts --network sepolia

# Verify deployed contracts
npx hardhat verify --network sepolia <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
```

## 📝 Contract Interfaces

### Message Structure
```solidity
struct Message {
    address sender;     // Message sender
    address receiver;   // Message recipient  
    string cid;         // IPFS content identifier
    uint256 timestamp;  // Block timestamp
}
```

### Core Functions

#### Messaging Contract
```solidity
// Send encrypted message via IPFS
function sendMessage(address receiver, string memory cid) external returns (uint256 messageId);

// Get message by ID
function getMessage(uint256 messageId) external view returns (Message memory);

// Get user's sent/received messages
function getMessages(address user, bool sent) external view returns (uint256[] memory);

// Get conversation between two users
function getConversation(address user1, address user2, uint256 limit) 
    external view returns (uint256[] memory);

// Check if user can send message
function canSendMessage(address user) external view returns (bool canSend, uint8 reason);
```

#### User Wallet
```solidity
// Deposit ETH into messaging wallet
function deposit() external payable;

// Withdraw ETH from wallet
function withdraw(uint256 amount) external;

// Check user balance
function checkBalance(address user) external view returns (uint256);

// Check if user can afford amount
function canAfford(address user, uint256 amount) external view returns (bool);
```

## 🧪 Testing

### Test Structure
```
test/
├── MessagingContract.test.ts    # Core messaging functionality
├── UserWallet.test.ts          # Wallet operations
├── Escrow.test.ts              # Fee management
└── Integration.test.ts         # End-to-end workflows
```

### Running Tests
```bash
# Run all tests with gas reporting
REPORT_GAS=true npm test

# Run specific test suite
npx hardhat test test/MessagingContract.test.ts

# Run tests with coverage
npm run test:coverage
```

### Test Coverage
- ✅ Message sending and retrieval
- ✅ User wallet deposit/withdrawal
- ✅ Rate limiting enforcement
- ✅ Fee collection and escrow
- ✅ Access control and security
- ✅ Error handling and edge cases

## 🛡️ Security Features

### Access Control
- **Owner-only functions**: Fee updates, user blocking, emergency pause
- **Authorized spenders**: Only messaging contracts can spend from wallets
- **Rate limiting**: Configurable message limits per user

### Security Patterns
- **Custom errors**: Gas-efficient error handling
- **Input validation**: Comprehensive parameter checking
- **Safe transfers**: Proper ETH transfer with failure handling
- **Reentrancy protection**: Custom guards against reentrancy attacks

### Auditing Considerations
- Minimal external dependencies for reduced attack surface
- Clear separation of concerns between contracts
- Transparent event logging for all operations
- Immutable critical contract addresses

## 📦 Integration Guide

### Frontend Integration

1. **Contract ABIs**: Available in `artifacts/contracts/` after compilation
2. **TypeScript Types**: Generated in `typechain-types/` directory
3. **Network Configuration**: Matches frontend environment variables

### IPFS Workflow

```javascript
// 1. Encrypt message client-side
const encryptedContent = await encrypt(message, recipientPublicKey);

// 2. Upload to IPFS
const cid = await ipfs.add(encryptedContent);

// 3. Send CID via smart contract
const tx = await messagingContract.sendMessage(recipientAddress, cid);

// 4. Recipient retrieves and decrypts
const content = await ipfs.cat(cid);
const decryptedMessage = await decrypt(content, privateKey);
```

## ⚡ Gas Optimization

### Optimization Strategies
- **Packed structs**: Efficient storage layout
- **Custom errors**: Lower gas than string reverts
- **Minimal loops**: Reduced computational complexity
- **Event indexing**: Optimal parameter indexing

### Gas Estimates (Sepolia)
| Operation | Gas Cost | Description |
|-----------|----------|-------------|
| Deploy MessagingContract | ~2.5M | Initial deployment |
| Deploy UserWallet | ~1.8M | Wallet contract deployment |
| Deploy Escrow | ~800k | Escrow deployment |
| Send Message | ~150k | Single message transaction |
| Deposit to Wallet | ~50k | ETH deposit |
| Withdraw from Wallet | ~45k | ETH withdrawal |

## 🔧 Configuration

### Hardhat Configuration
```javascript
// hardhat.config.ts
networks: {
  sepolia: {
    url: `https://sepolia.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
    accounts: [process.env.SEPOLIA_PRIVATE_KEY],
    gas: 6000000,
    gasPrice: 20000000000 // 20 gwei
  }
}
```

### Contract Deployment Sequence
1. **Deploy UserWalletContract** - User balance management
2. **Deploy SimpleEscrow** - Fee collection system  
3. **Deploy MessagingContract** - Main messaging logic with dependencies
4. **Configure Authorizations** - Set messaging contract as authorized spender
5. **Verify Contracts** - Etherscan verification for transparency

## 📁 Directory Structure

```
contracts/
├── contracts/                      # Solidity source files
│   ├── MessagingContractV3Simple.sol    # Main messaging contract
│   ├── UserWalletContractSimple.sol     # User wallet management  
│   ├── SimpleEscrow.sol                 # Fee escrow system
│   └── interfaces/                      # Contract interfaces
├── scripts/                        # Deployment scripts
│   ├── deploy-v3.ts                    # V3 contract deployment
│   ├── deploy-all.ts                   # Complete system deployment
│   └── verify-contracts.ts             # Post-deployment verification
├── test/                          # Test suites
│   ├── MessagingContract.test.ts       # Core messaging tests
│   ├── UserWallet.test.ts              # Wallet functionality tests
│   └── Integration.test.ts             # End-to-end tests
├── artifacts/                     # Compiled contract artifacts
├── typechain-types/               # TypeScript contract types
├── hardhat.config.ts             # Hardhat configuration
└── package.json                  # Dependencies and scripts
```

## 🚨 Important Considerations

### Security Warnings
- **Private Keys**: Never commit private keys to version control
- **Testnet Only**: Current implementation for Sepolia testnet
- **Admin Security**: Secure owner private keys for production deployment

### Production Readiness
- **Security Audit**: Recommend professional audit before mainnet
- **IPFS Reliability**: Consider dedicated IPFS pinning service
- **Gas Optimization**: Further optimization for mainnet deployment
- **Upgrade Strategy**: Contracts are immutable by design

### Known Limitations
- **IPFS Dependency**: Messages unavailable if IPFS content is unpinned
- **Rate Limiting**: Fixed time windows (could be gaming-resistant)
- **Fee Model**: Simple flat fee (could implement dynamic pricing)

## 📞 Development Support

### Debugging
```bash
# Enable detailed logging
DEBUG=hardhat:* npx hardhat test

# Network forking for mainnet testing
npx hardhat node --fork https://mainnet.infura.io/v3/PROJECT_ID
```

### Common Issues
- **Deployment Failures**: Check gas limits and network connectivity
- **Test Failures**: Ensure local hardhat node is running
- **Verification Issues**: Confirm contract addresses and constructor arguments

## 📄 License

MIT License - see LICENSE file for details

---

**Secure, decentralized messaging infrastructure** 🔐
