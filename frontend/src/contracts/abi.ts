// Messaging contract ABI - this should match your deployed contract
export const MESSAGING_CONTRACT_ABI = [
  {
    "type": "constructor",
    "inputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "receive",
    "stateMutability": "payable"
  },
  {
    "type": "fallback",
    "stateMutability": "payable"
  },
  {
    "type": "function",
    "name": "MESSAGE_FEE",
    "inputs": [],
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "MAX_MESSAGE_LENGTH",
    "inputs": [],
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "MAX_NONCE_LENGTH",
    "inputs": [],
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "RATE_LIMIT_DURATION",
    "inputs": [],
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getConversation",
    "inputs": [
      {"name": "_user1", "type": "address"},
      {"name": "_user2", "type": "address"},
      {"name": "_limit", "type": "uint256"}
    ],
    "outputs": [
      {
        "name": "",
        "type": "tuple[]",
        "components": [
          {"name": "from", "type": "address"},
          {"name": "to", "type": "address"},
          {"name": "encryptedContent", "type": "string"},
          {"name": "timestamp", "type": "uint256"},
          {"name": "nonce", "type": "string"}
        ]
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getMessageCount",
    "inputs": [{"name": "_user", "type": "address"}],
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getMessages",
    "inputs": [
      {"name": "_user", "type": "address"},
      {"name": "_offset", "type": "uint256"},
      {"name": "_limit", "type": "uint256"}
    ],
    "outputs": [
      {
        "name": "",
        "type": "tuple[]",
        "components": [
          {"name": "from", "type": "address"},
          {"name": "to", "type": "address"},
          {"name": "encryptedContent", "type": "string"},
          {"name": "timestamp", "type": "uint256"},
          {"name": "nonce", "type": "string"}
        ]
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getPublicKey",
    "inputs": [{"name": "_user", "type": "address"}],
    "outputs": [{"name": "", "type": "string"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getTotalMessageCount",
    "inputs": [],
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "isPaused",
    "inputs": [],
    "outputs": [{"name": "", "type": "bool"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "isUserRegistered",
    "inputs": [{"name": "_user", "type": "address"}],
    "outputs": [{"name": "", "type": "bool"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "lastMessageTime",
    "inputs": [{"name": "", "type": "address"}],
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "messageCounts",
    "inputs": [{"name": "", "type": "address"}],
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "owner",
    "inputs": [],
    "outputs": [{"name": "", "type": "address"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "pause",
    "inputs": [],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "registerPublicKey",
    "inputs": [{"name": "_publicKey", "type": "string"}],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "sendMessage",
    "inputs": [
      {"name": "_to", "type": "address"},
      {"name": "_encryptedContent", "type": "string"},
      {"name": "_nonce", "type": "string"}
    ],
    "outputs": [],
    "stateMutability": "payable"
  },
  {
    "type": "function",
    "name": "transferOwnership",
    "inputs": [{"name": "_newOwner", "type": "address"}],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "unpause",
    "inputs": [],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "updateMessageFee",
    "inputs": [{"name": "_newFee", "type": "uint256"}],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "userProfiles",
    "inputs": [{"name": "", "type": "address"}],
    "outputs": [
      {"name": "publicKey", "type": "string"},
      {"name": "messageCount", "type": "uint256"},
      {"name": "isRegistered", "type": "bool"}
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "withdrawFees",
    "inputs": [],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "event",
    "name": "MessageSent",
    "inputs": [
      {"name": "from", "type": "address", "indexed": true},
      {"name": "to", "type": "address", "indexed": true},
      {"name": "encryptedContent", "type": "string", "indexed": false},
      {"name": "timestamp", "type": "uint256", "indexed": false},
      {"name": "nonce", "type": "string", "indexed": false}
    ]
  },
  {
    "type": "event",
    "name": "PublicKeyRegistered",
    "inputs": [
      {"name": "user", "type": "address", "indexed": true},
      {"name": "publicKey", "type": "string", "indexed": false},
      {"name": "timestamp", "type": "uint256", "indexed": false}
    ]
  }
] as const;
