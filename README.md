# Zephex

**Fully On-Chain Encrypted Messaging App with IPFS Storage**

A decentralized, censorship-resistant, privacy-focused messaging application where encrypted messages are stored on IPFS and message metadata is stored on-chain with end-to-end encryption.

## 🚀 Features

- **End-to-End Encryption**: Messages encrypted client-side before IPFS storage
- **IPFS Integration**: Encrypted content stored on IPFS, only CIDs on-chain
- **Wallet Authentication**: MetaMask integration for seamless login
- **User Wallet System**: Deposit/withdrawal functionality with spending authorization
- **Escrow System**: Message fees held in escrow with refund capability
- **Rate Limiting**: Anti-spam protection (100 messages/hour default)
- **Decentralized**: No central servers or authorities
- **Privacy-First**: Only sender and recipient can decrypt messages
- **Comic-Style UI**: Fun, engaging interface with comic book aesthetics
- **Responsive Design**: Works on desktop and mobile

## 🛠 Tech Stack

### Frontend
- **React + TypeScript + Vite** - Modern frontend framework
- **TailwindCSS** - Utility-first CSS framework
- **Ethers.js** - Web3 wallet interaction
- **MetaMask** - Wallet connection and encryption
- **Framer Motion** - Animations and transitions
- **Radix UI** - Accessible component primitives

### Smart Contracts
- **Solidity ^0.8.19** - Smart contract language
- **Hardhat** - Development framework
- **OpenZeppelin** - Security-audited contract libraries
- **Sepolia Testnet** - Test network

### Blockchain Architecture
- **IPFS Storage**: Encrypted messages stored off-chain
- **On-Chain Metadata**: Message CIDs, sender/receiver, timestamps
- **User Wallets**: Deposit-based spending system
- **Escrow Management**: Fee collection and refund system
- **Rate Limiting**: Configurable message limits per user

## 🏗 Smart Contract Architecture

### Core Contracts

#### 1. MessagingContractV3Simple.sol
- **Primary messaging contract** with IPFS integration
- Stores IPFS CIDs of encrypted messages on-chain
- Integrates with user wallet system for fee payment
- Rate limiting and anti-spam protection
- Conversation indexing and pagination

#### 2. UserWalletContractSimple.sol
- **User deposit/withdrawal management**
- Minimum deposit requirement (0.01 ETH)
- Authorized spender pattern for messaging contracts
- Balance tracking and spending authorization

#### 3. SimpleEscrow.sol
- **Message fee escrow system**
- Holds fees from messaging transactions
- Refund capability for disputed messages
- Owner withdrawal functionality

### Contract Features
- **Minimum Deposit**: 0.01 ETH required for wallet deposits
- **Message Fee**: 0.001 ETH per message (configurable)
- **Rate Limiting**: 100 messages per hour per user
- **IPFS CID Storage**: Up to 200 character CID strings
- **Anti-Abuse**: User blocking and contract pause functionality

## 🏁 Quick Start

### Prerequisites
- Node.js 18+
- MetaMask wallet
- Sepolia ETH for testing

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Smart Contract Setup
```bash
cd contracts
npm install
npx hardhat compile
npx hardhat test
```

### Deploy Contracts
```bash
# Deploy to Sepolia
cd contracts
npx hardhat run scripts/deploy-v3.ts --network sepolia
```

## 📱 How to Use

1. **Landing Page**: View the introduction and click "Get Started"
2. **Connect Wallet**: Click "Connect MetaMask" to authenticate
3. **Deposit Funds**: Deposit ETH into your messaging wallet (minimum 0.01 ETH)
4. **Send Messages**: 
   - Encrypt message content client-side
   - Upload encrypted content to IPFS
   - Send IPFS CID through smart contract
5. **Receive Messages**: Retrieve CIDs from blockchain and decrypt content from IPFS

## 🔒 Security & Privacy

### Encryption Flow
1. **Client-Side Encryption**: Messages encrypted before leaving browser
2. **IPFS Upload**: Encrypted content uploaded to IPFS
3. **On-Chain Storage**: Only IPFS CID stored on blockchain
4. **Decryption**: Recipients fetch from IPFS and decrypt locally

### Security Features
- **Wallet-Based Authentication**: No passwords, only wallet signatures
- **Rate Limiting**: Prevents spam attacks
- **User Blocking**: Admin can block malicious users
- **Emergency Pause**: Contract can be paused in emergencies
- **Escrow System**: Fee refunds for disputed messages

## 🏗 Current Architecture

### Frontend Structure
```
App.tsx                     # Main application with routing logic
├── contexts/           
│   └── WalletContext      # Wallet connection management
├── components/
│   ├── LandingScreen      # Introduction/welcome page
│   ├── ChatApplication    # Main messaging interface (in development)
│   └── magicui/           # Comic text and visual effects
│       ├── comic-text     # Comic book style text
│       └── dot-pattern    # Animated background pattern
└── App.css               # Global styles and animations
```

### Smart Contract Integration
```
MessagingContractV3Simple   # Main messaging logic
├── UserWalletContract     # Balance management
├── SimpleEscrow          # Fee escrow
└── IPFS Network          # Encrypted content storage
```

## 🧪 Testing

### Contract Tests
```bash
cd contracts
npm run test
```

### Frontend Tests
```bash
cd frontend
npm run test
```

### Test Coverage
- ✅ Smart contract deployment and functionality
- ✅ User wallet deposit/withdrawal
- ✅ Message sending with IPFS CID storage
- ✅ Rate limiting and anti-spam
- ✅ Escrow fee management
- ✅ Frontend wallet connection
- ✅ Landing page and navigation

## 🔧 Configuration

### Environment Variables
```bash
# contracts/.env
SEPOLIA_PRIVATE_KEY=your_private_key
INFURA_PROJECT_ID=your_infura_id  
ETHERSCAN_API_KEY=your_etherscan_key
```

### Contract Parameters
| Parameter | Value | Description |
|-----------|-------|-------------|
| Minimum Deposit | 0.01 ETH | Required for wallet deposits |
| Message Fee | 0.001 ETH | Fee per message |
| Rate Limit | 100 msg/hour | Anti-spam protection |
| Max CID Length | 200 chars | IPFS CID limit |

## 🚧 Current Status

### ✅ Completed Features
- Complete smart contract architecture with IPFS integration
- User wallet system with deposit/withdrawal
- Escrow system for message fees
- Rate limiting and anti-spam protection
- Frontend landing page with comic aesthetics
- Wallet connection with MetaMask
- Responsive design and animations

### 🔄 In Progress  
- ChatApplication component implementation
- IPFS client integration in frontend
- Message encryption/decryption in browser
- Contract deployment and verification
- Frontend-to-contract integration

### 📋 TODO
- Complete messaging UI implementation
- IPFS pinning service integration
- ENS name resolution
- Group messaging capabilities
- Message attachments support
- Mobile app development

## 🛡️ Security Considerations

### Smart Contract Security
- Uses OpenZeppelin battle-tested contracts
- ReentrancyGuard protection
- Input validation and error handling
- Rate limiting prevents abuse
- Emergency pause functionality

### Privacy Features
- Client-side encryption only
- No plaintext data on blockchain
- IPFS content addressing
- Wallet-based identity
- No centralized data storage

## 📁 Project Structure

```
Zephex/
├── frontend/              # React application
│   ├── src/
│   │   ├── components/   # UI components
│   │   ├── contexts/     # React contexts
│   │   └── magicui/      # Custom UI components
│   └── package.json
├── contracts/             # Smart contracts
│   ├── contracts/        # Solidity source
│   ├── scripts/          # Deployment scripts
│   ├── test/            # Contract tests
│   └── package.json
└── README.md             # This file
```

## 🚀 Deployment

### Testnet Deployment
The contracts are designed for Sepolia testnet deployment:

```bash
cd contracts
npm run deploy:sepolia
```

### Production Considerations
- **Mainnet Deployment**: Requires audit and security review
- **IPFS Pinning**: Need reliable pinning service
- **Gas Optimization**: Further optimization for mainnet costs
- **Governance**: Consider upgradeability patterns

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Write tests for new functionality
4. Ensure all tests pass (`npm test`)
5. Commit changes (`git commit -m 'Add amazing feature'`)
6. Push to branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 📄 License

MIT License - see LICENSE file for details

---

**Building the future of decentralized communication** 🚀