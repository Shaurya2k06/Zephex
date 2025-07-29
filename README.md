# Zephex

**Fully On-Chain Encrypted Messaging App**

A decentralized, censorship-resistant, privacy-focused messaging application where all messages are stored on-chain with end-to-end encryption.

## 🚀 Features

- **End-to-End Encryption**: Messages encrypted with wallet-derived keys
- **On-Chain Storage**: All messages permanently stored on blockchain
- **Wallet Authentication**: MetaMask integration for seamless login
- **Decentralized**: No central servers or authorities
- **Privacy-First**: Only sender and recipient can decrypt messages
- **Comic-Style UI**: Fun, engaging interface with comic book aesthetics
- **Landing Page**: Beautiful introduction screen
- **Responsive Design**: Works on desktop and mobile

## 🛠 Tech Stack

### Frontend
- **React + TypeScript + Vite** - Modern frontend framework
- **TailwindCSS** - Utility-first CSS framework
- **Ethers.js** - Web3 wallet interaction
- **MetaMask** - Wallet connection and encryption
- **Magic UI Components** - Comic text and dot pattern effects

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

1. **Landing Page**: View the introduction and click "Get Started"
2. **Connect Wallet**: Click "Connect MetaMask" to authenticate
3. **Chat Application**: Access the main messaging interface
4. **Send Messages**: Enter recipient address and message content
5. **View Messages**: All your encrypted messages in the chat interface

## 🔒 Security Features

- **Wallet-Based Authentication**: No passwords, only wallet signatures
- **End-to-End Encryption**: Messages encrypted before blockchain storage
- **Rate Limiting**: 1 second cooldown between messages
- **Input Validation**: Message length and content validation
- **Gas Optimization**: Efficient smart contract design

## 🏗 Architecture

### Frontend Structure
```
App.tsx                     # Main application with routing logic
├── contexts/           
│   └── WalletContext      # Wallet connection management
├── components/
│   ├── LandingScreen      # Introduction/welcome page
│   ├── ChatApplication    # Main messaging interface
│   └── magicui/           # Comic text and visual effects
│       ├── comic-text     # Comic book style text
│       └── dot-pattern    # Animated background pattern
└── App.css               # Global styles and animations
```

### Application Flow
1. **Landing Screen** - Welcome page with "Get Started" button
2. **Wallet Connection** - MetaMask connection with comic-style UI
3. **Loading State** - Shows connecting status with back option
4. **Chat Application** - Main messaging interface (when connected)

### Smart Contract (`MessagingContract.sol`)
```solidity
- sendMessage(address to, string encryptedContent, string nonce)
- registerPublicKey(string publicKey)  
- getMessages(address user) returns (Message[])
- Owner controls and emergency pause
```

## 🎨 UI Features

### Comic Book Aesthetics
- **Comic Text Component**: Stylized comic book fonts
- **Dot Pattern Background**: Animated halftone patterns
- **Bold Colors**: Vibrant gradients and high contrast
- **Floating Elements**: Animated decorative shapes
- **Retro Shadows**: Bold drop shadows and borders

### Animations
- **Bounce Effects**: Loading spinners and decorative elements
- **Hover Animations**: Scale and shadow effects
- **Pulse Glows**: Attention-grabbing button effects
- **Float Animation**: Subtle floating movement
- **Shake Animation**: Error state feedback

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
- ✅ Landing page navigation
- ✅ Loading states and error handling
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
- Complete landing page with comic aesthetics
- Wallet connection with MetaMask integration
- Comic-style UI with animations and effects
- Responsive design for all screen sizes
- Loading states and error handling
- Proper navigation flow between screens
- WalletContext for state management

### 🔄 In Progress  
- ChatApplication component implementation
- Blockchain integration (smart contract connection)
- Real encryption/decryption
- Message history from blockchain
- Gas optimization

### 📋 TODO
- Complete messaging functionality
- IPFS integration for message attachments
- ENS name resolution
- Group messaging
- Stealth addresses
- ZK proof integration

## 🐛 Known Issues

- ChatApplication component needs full implementation
- Need to connect frontend to deployed smart contract
- Encryption implementation pending
- Gas fee estimation needed
- Back button from connecting state returns to landing

## 📞 Development

### Local Development
```bash
# Start frontend
cd frontend
npm run dev

# Start local hardhat node (in contracts directory)
cd contracts
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

## 🎯 Next Steps

1. **Complete ChatApplication Component**
   - Message input and display
   - Contact management
   - Message history

2. **Integrate Smart Contracts**
   - Connect to deployed contract
   - Implement encryption/decryption
   - Handle blockchain transactions

3. **Enhanced Features**
   - Message attachments
   - Group chats
   - User profiles

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