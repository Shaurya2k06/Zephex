// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IUserWalletContract {
    function canAfford(address user, uint256 amount) external view returns (bool);
    function spend(address from, uint256 amount) external returns (bool);
}

/**
 * @title MessagingContractV3Simple
 * @dev IPFS-based encrypted messaging with escrow support
 */
contract MessagingContractV3Simple {
    
    struct Message {
        address sender;
        address receiver;
        string cid; // IPFS hash of encrypted content
        uint256 timestamp;
    }
    
    // State variables
    IUserWalletContract public immutable walletContract;
    address public owner;
    address public escrowAddress;
    uint256 public messageFee;
    uint256 public messageCounter;
    
    // Rate limiting
    mapping(address => uint256) public messageCount;
    mapping(address => uint256) public lastMessageTime;
    uint256 public constant RATE_LIMIT_WINDOW = 1 hours;
    uint256 public maxMessagesPerHour = 100;
    
    // Storage
    mapping(uint256 => Message) public messages;
    mapping(address => uint256[]) public userSentMessages;
    mapping(address => uint256[]) public userReceivedMessages;
    mapping(address => mapping(address => uint256[])) public conversationMessages;
    
    // Anti-abuse
    mapping(address => bool) public blockedUsers;
    bool public paused = false;
    
    // Events
    event MessageSent(
        uint256 indexed messageId,
        address indexed sender,
        address indexed receiver,
        string cid,
        uint256 timestamp,
        uint256 feePaid
    );
    event MessageFeeUpdated(uint256 oldFee, uint256 newFee);
    event EscrowAddressUpdated(address oldEscrow, address newEscrow);
    event RateLimitUpdated(uint256 oldLimit, uint256 newLimit);
    event UserBlocked(address indexed user, bool blocked);
    event ContractPaused(bool paused);
    
    // Errors
    error InsufficientBalance();
    error InvalidReceiver();
    error InvalidEscrowAddress();
    error RateLimitExceeded();
    error TransferFailed();
    error UserIsBlocked();
    error InvalidCID();
    error ZeroAddress();
    error OnlyOwner();
    error ContractIsPaused();
    
    modifier onlyOwner() {
        if (msg.sender != owner) revert OnlyOwner();
        _;
    }
    
    modifier whenNotPaused() {
        if (paused) revert ContractIsPaused();
        _;
    }
    
    modifier notBlocked() {
        if (blockedUsers[msg.sender]) revert UserIsBlocked();
        _;
    }
    
    modifier validReceiver(address receiver) {
        if (receiver == address(0) || receiver == msg.sender) revert InvalidReceiver();
        _;
    }
    
    modifier validCID(string memory cid) {
        if (bytes(cid).length == 0 || bytes(cid).length > 200) revert InvalidCID();
        _;
    }
    
    modifier rateLimited() {
        if (block.timestamp - lastMessageTime[msg.sender] < RATE_LIMIT_WINDOW) {
            if (messageCount[msg.sender] >= maxMessagesPerHour) {
                revert RateLimitExceeded();
            }
        } else {
            messageCount[msg.sender] = 0;
        }
        _;
    }
    
    constructor(
        address _walletContract,
        address _escrowAddress,
        uint256 _messageFee
    ) {
        if (_walletContract == address(0)) revert ZeroAddress();
        if (_escrowAddress == address(0)) revert InvalidEscrowAddress();
        
        walletContract = IUserWalletContract(_walletContract);
        owner = msg.sender;
        escrowAddress = _escrowAddress;
        messageFee = _messageFee;
        messageCounter = 0;
    }
    
    /**
     * @dev Send an encrypted message via IPFS CID
     * @param receiver Address of the message recipient
     * @param cid IPFS content identifier of the encrypted message
     * @return messageId Unique identifier for the message
     */
    function sendMessage(address receiver, string memory cid)
        external
        whenNotPaused
        notBlocked
        validReceiver(receiver)
        validCID(cid)
        rateLimited
        returns (uint256 messageId)
    {
        // Check if user has sufficient balance
        if (!walletContract.canAfford(msg.sender, messageFee)) {
            revert InsufficientBalance();
        }
        
        // Deduct fee from user's wallet
        bool success = walletContract.spend(msg.sender, messageFee);
        if (!success) revert InsufficientBalance();
        
        // Transfer fee to escrow
        if (messageFee > 0) {
            (bool transferSuccess, ) = payable(escrowAddress).call{value: messageFee}("");
            if (!transferSuccess) revert TransferFailed();
        }
        
        // Create message
        messageCounter++;
        messageId = messageCounter;
        
        messages[messageId] = Message({
            sender: msg.sender,
            receiver: receiver,
            cid: cid,
            timestamp: block.timestamp
        });
        
        // Update indexes
        userSentMessages[msg.sender].push(messageId);
        userReceivedMessages[receiver].push(messageId);
        conversationMessages[msg.sender][receiver].push(messageId);
        conversationMessages[receiver][msg.sender].push(messageId);
        
        // Update rate limiting
        if (block.timestamp - lastMessageTime[msg.sender] >= RATE_LIMIT_WINDOW) {
            messageCount[msg.sender] = 1;
        } else {
            messageCount[msg.sender]++;
        }
        lastMessageTime[msg.sender] = block.timestamp;
        
        emit MessageSent(messageId, msg.sender, receiver, cid, block.timestamp, messageFee);
        
        return messageId;
    }
    
    /**
     * @dev Get message details by ID
     */
    function getMessage(uint256 messageId) external view returns (Message memory message) {
        return messages[messageId];
    }
    
    /**
     * @dev Get messages for a user
     * @param user User address
     * @param sent True for sent messages, false for received
     */
    function getMessages(address user, bool sent) external view returns (uint256[] memory messageIds) {
        return sent ? userSentMessages[user] : userReceivedMessages[user];
    }
    
    /**
     * @dev Get conversation between two users
     * @param user1 First user address
     * @param user2 Second user address
     * @param limit Maximum number of messages (0 = all)
     */
    function getConversation(address user1, address user2, uint256 limit) 
        external 
        view 
        returns (uint256[] memory messageIds) 
    {
        uint256[] storage allMessages = conversationMessages[user1][user2];
        
        if (limit == 0 || limit >= allMessages.length) {
            return allMessages;
        }
        
        uint256 startIndex = allMessages.length - limit;
        messageIds = new uint256[](limit);
        
        for (uint256 i = 0; i < limit; i++) {
            messageIds[i] = allMessages[startIndex + i];
        }
        
        return messageIds;
    }
    
    /**
     * @dev Get latest messages for a user
     */
    function getLatestMessages(address user, uint256 count, bool sent)
        external
        view
        returns (Message[] memory latestMessages)
    {
        uint256[] storage messageIds = sent ? userSentMessages[user] : userReceivedMessages[user];
        
        if (messageIds.length == 0 || count == 0) {
            return new Message[](0);
        }
        
        uint256 startIndex = messageIds.length > count ? messageIds.length - count : 0;
        uint256 resultLength = messageIds.length - startIndex;
        
        latestMessages = new Message[](resultLength);
        
        for (uint256 i = 0; i < resultLength; i++) {
            uint256 messageId = messageIds[startIndex + i];
            latestMessages[i] = messages[messageId];
        }
    }
    
    /**
     * @dev Check if user can send a message
     */
    function canSendMessage(address user) external view returns (bool canSend, uint8 reason) {
        if (blockedUsers[user]) return (false, 3); // Blocked
        if (!walletContract.canAfford(user, messageFee)) return (false, 1); // Insufficient balance
        
        if (block.timestamp - lastMessageTime[user] < RATE_LIMIT_WINDOW) {
            if (messageCount[user] >= maxMessagesPerHour) return (false, 2); // Rate limited
        }
        
        return (true, 0); // Can send
    }
    
    // Admin functions
    
    function setMessageFee(uint256 newFee) external onlyOwner {
        uint256 oldFee = messageFee;
        messageFee = newFee;
        emit MessageFeeUpdated(oldFee, newFee);
    }
    
    function setEscrowAddress(address newEscrow) external onlyOwner {
        if (newEscrow == address(0)) revert InvalidEscrowAddress();
        address oldEscrow = escrowAddress;
        escrowAddress = newEscrow;
        emit EscrowAddressUpdated(oldEscrow, newEscrow);
    }
    
    function setRateLimit(uint256 newLimit) external onlyOwner {
        uint256 oldLimit = maxMessagesPerHour;
        maxMessagesPerHour = newLimit;
        emit RateLimitUpdated(oldLimit, newLimit);
    }
    
    function setUserBlocked(address user, bool blocked) external onlyOwner {
        blockedUsers[user] = blocked;
        emit UserBlocked(user, blocked);
    }
    
    function setPaused(bool _paused) external onlyOwner {
        paused = _paused;
        emit ContractPaused(_paused);
    }
    
    function getContractStats() external view returns (
        uint256 totalMessages,
        uint256 currentFee,
        address escrowAddr,
        uint256 totalFeesCollected
    ) {
        return (
            messageCounter,
            messageFee,
            escrowAddress,
            messageCounter * messageFee
        );
    }
    
    receive() external payable {
        if (msg.value > 0) {
            (bool success, ) = payable(escrowAddress).call{value: msg.value}("");
            if (!success) revert TransferFailed();
        }
    }
}
