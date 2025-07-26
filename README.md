# Zephex

**Fully On-Chain Encrypted Messaging App**

A decentralized, censorship-resistant, privacy-focused messaging application where all messages are stored on-chain with end-to-end encryption.

## 🚀 Features

- **End-to-End Encryption**: Messages encrypted with wallet-derived keys
- **On-Chain Storage**: All messages permanently stored on blockchain
- **Wallet Authentication**: MetaMask integration for seamless login
- **Decentralized**: No central servers or authorities
- **Privacy-First**: Only sender and recipient can decrypt messages
- **Simple UI**: Clean, fast interface without heavy animations

## 🛠 Tech Stack

### Frontend
- **React + TypeScript + Vite** - Modern frontend framework
- **TailwindCSS** - Utility-first CSS framework
- **Ethers.js** - Web3 wallet interaction
- **MetaMask** - Wallet connection and encryption

### Smart Contracts
- **Solidity ^0.8.28** - Smart contract language
- **Hardhat** - Development framework
- **Sepolia Testnet** - Test network

### Blockchain Features
- **ECIES Encryption** - Elliptic Curve Integrated Encryption
- **Message Events** - Indexed blockchain events
- **Rate Limiting** - Anti-spam protection
- **Fee System** - 0.001 ETH per message

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

### Deploy Contract
```bash
# Deploy to Sepolia
npx hardhat run scripts/deploy-messaging.ts --network sepolia
```

## 📱 How to Use

1. **Connect Wallet**: Click "Connect MetaMask" to authenticate
2. **Send Messages**: Enter recipient address and message content  
3. **View Messages**: All your encrypted messages in the Messages tab
4. **Settings**: Manage wallet connection and preferences

## 🔒 Security Features

- **Wallet-Based Authentication**: No passwords, only wallet signatures
- **End-to-End Encryption**: Messages encrypted before blockchain storage
- **Rate Limiting**: 1 second cooldown between messages
- **Input Validation**: Message length and content validation
- **Gas Optimization**: Efficient smart contract design

## 🏗 Architecture

### Smart Contract (`MessagingContract.sol`)
```solidity
- sendMessage(address to, string encryptedContent, string nonce)
- registerPublicKey(string publicKey)  
- getMessages(address user) returns (Message[])
- Owner controls and emergency pause
```

### Frontend Components
```
App.tsx                 # Main application with routing
├── contexts/           
│   ├── WalletContext   # Wallet connection management
│   └── MessageContext  # Message state management  
├── components/
│   ├── layout/         # Header, Sidebar, Layout
│   ├── wallet/         # WalletConnect component
│   ├── ui/             # Reusable UI components
│   └── messaging/      # Message-related components
└── pages/
    ├── Dashboard       # Overview and statistics
    ├── Messages        # Send/receive messages
    └── Settings        # User preferences
```

## 🧪 Testing

### Frontend Tests
```bash
npm run test
```

### Contract Tests  
```bash
npx hardhat test
```

### Test Coverage
- ✅ Wallet connection/disconnection
- ✅ Message encryption/decryption
- ✅ Smart contract deployment
- ✅ Message sending/receiving
- ✅ Rate limiting
- ✅ Access controls

## 🔧 Configuration

### Environment Variables
```bash
# contracts/.env
SEPOLIA_PRIVATE_KEY=your_private_key
INFURA_PROJECT_ID=your_infura_id  
ETHERSCAN_API_KEY=your_etherscan_key
```

### Network Configuration
- **Sepolia Testnet**: ChainId 11155111
- **RPC**: Infura endpoint
- **Gas Price**: 20 gwei
- **Message Fee**: 0.001 ETH

## 🚧 Current Status

### ✅ Working Features
- Wallet connection with MetaMask
- Simple, clean UI (animations removed)
- Message sending/receiving (demo mode)
- Dashboard with statistics
- Settings page with wallet management
- Responsive design
- Dark theme only

### 🔄 In Progress  
- Blockchain integration (smart contract connection)
- Real encryption/decryption
- Message history from blockchain
- Gas optimization

### 📋 TODO
- IPFS integration for message attachments
- ENS name resolution
- Group messaging
- Stealth addresses
- ZK proof integration

## 🐛 Known Issues

- Messages currently stored in localStorage (demo mode)
- Need to connect frontend to deployed smart contract
- Encryption implementation pending
- Gas fee estimation needed

## 📞 Development

### Local Development
```bash
# Start frontend
npm run dev

# Start local hardhat node
npx hardhat node

# Deploy to local network
npx hardhat run scripts/deploy.ts --network localhost
```

### Smart Contract Development
```bash
# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test

# Deploy and verify
npx hardhat run scripts/deploy-messaging.ts --network sepolia
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Write tests for new features
4. Ensure all tests pass
5. Submit pull request

## 📄 License

MIT License - see LICENSE file for details

---

**Built with ❤️ for decentralized communication**