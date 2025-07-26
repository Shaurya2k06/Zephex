# Zephex - Secure Messaging with In-Built Wallet

A decentralized messaging application with end-to-end encryption and an integrated wallet system.

##  Features

###  **Completed**
- **Clean Chat Interface**: WhatsApp/Instagram-style messaging
- **In-Built Wallet**: Deposit/withdraw ETH functionality
- **Automatic Payments**: No manual transaction confirmations for messages
- **End-to-End Encryption**: Secure messaging with MetaMask encryption
- **Real-time Updates**: Live message updates and wallet balance
- **Contact Management**: Add and manage conversation contacts
- **Smart Contract Integration**: MessagingContractV2 with wallet functionality

### 🔧 **Technical Stack**
- **Frontend**: React + TypeScript + Tailwind CSS
- **Smart Contracts**: Solidity (MessagingContractV2 + WalletContract)
- **Blockchain**: Ethereum Sepolia Testnet
- **Encryption**: MetaMask's encryption API
- **Wallet**: MetaMask integration

## 📦 **Contract Addresses (Sepolia)**

- **MessagingContractV2**: `0xB4596322D1fcC9Df9E54Cb9BCC1496C4b1f11749`
- **View on Etherscan**: [https://sepolia.etherscan.io/address/0xB4596322D1fcC9Df9E54Cb9BCC1496C4b1f11749](https://sepolia.etherscan.io/address/0xB4596322D1fcC9Df9E54Cb9BCC1496C4b1f11749)

## 🛠 **Development Setup**

### Prerequisites
- Node.js (v18+)
- MetaMask browser extension
- Sepolia ETH for testing

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Contract Development
```bash
cd contracts
npm install
npx hardhat compile
npx hardhat run scripts/deploy-wallet-messaging.ts --network sepolia
```

## 📱 **How to Use**

1. **Connect Wallet**: Click "Connect MetaMask" to connect your wallet
2. **Fund Wallet**: Use the wallet panel to deposit ETH for messaging
3. **Add Contacts**: Enter a wallet address to start a conversation
4. **Send Messages**: Type and send encrypted messages
5. **Withdraw**: Withdraw remaining balance anytime

## 🔐 **Security Features**

- **End-to-End Encryption**: Messages encrypted with recipient's public key
- **Wallet Isolation**: In-built wallet separate from main wallet
- **Rate Limiting**: 1-second cooldown between messages
- **Access Control**: Only wallet owner can access their messages

## 🎯 **Message Fee**

- **Cost**: 0.001 ETH per message
- **Payment**: Automatically deducted from in-built wallet
- **No Confirmations**: Seamless messaging experience

## 🧪 **Testing**

1. Get Sepolia ETH from faucets:
   - [Sepolia Faucet](https://sepoliafaucet.com/)
   - [Alchemy Faucet](https://www.alchemy.com/faucets/ethereum-sepolia)

2. Open the app at `http://localhost:5173`
3. Connect MetaMask and switch to Sepolia network
4. Deposit some ETH to start messaging

## 📚 **Project Structure**

```
Zephex/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/      # UI components
│   │   ├── contexts/        # React contexts
│   │   ├── hooks/           # Custom hooks
│   │   ├── services/        # API services
│   │   ├── utils/           # Utilities
│   │   └── contracts/       # Contract ABIs
│   └── package.json
├── contracts/               # Smart contracts
│   ├── contracts/          # Solidity files
│   ├── scripts/            # Deployment scripts
│   ├── test/               # Contract tests
│   └── hardhat.config.ts
└── README.md
```

##  **Deployment**

The contracts are already deployed on Sepolia testnet. To deploy on other networks:

1. Update `hardhat.config.ts` with network details
2. Run deployment script: `npx hardhat run scripts/deploy-wallet-messaging.ts --network <network>`
3. Update `frontend/src/utils/constants.ts` with new addresses

## 🐛 **Troubleshooting**

- **MetaMask not connecting**: Refresh page and try again
- **Messages not sending**: Check wallet balance and Sepolia ETH
- **Encryption errors**: Ensure MetaMask is unlocked
- **Network errors**: Switch to Sepolia testnet in MetaMask

## 📄 **License**

MIT License - see LICENSE file for details

---

**Built with ❤️ for secure, decentralized communication**
