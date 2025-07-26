// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "./UserWalletContract.sol";

/**
 * @title MessagingContractV3
 * @dev End-to-end encrypted messaging system using IPFS for storage with escrow support
 * @notice Messages are encrypted off-chain and stored on-chain as IPFS CIDs
 */
contract MessagingContractV3 is Ownable, ReentrancyGuard, Pausable {
    
    // Message structure - matches your specification exactly
    struct Message {
        address sender;
        address receiver;
        string cid; // IPFS hash of encrypted content
        uint256 timestamp;
    }
    
    // State variables
    UserWalletContract public immutable walletContract;
    address public escrowAddress;
    uint256 public messageFee; // Fee in wei (ETH)
    uint256 public messageCounter;
    
    // Rate limiting
    mapping(address => uint256) public messageCount;
    mapping(address => uint256) public lastMessageTime;
    uint256 public constant RATE_LIMIT_WINDOW = 1 hours;
    uint256 public maxMessagesPerHour = 100;
    
    // Storage - indexed by messageId
    mapping(uint256 => Message) public messages;
    mapping(address => uint256[]) public userSentMessages;
    mapping(address => uint256[]) public userReceivedMessages;
    mapping(address => mapping(address => uint256[])) public conversationMessages;
    
    // Anti-abuse
    mapping(address => bool) public blockedUsers;
    
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
    
    // Errors
    error InsufficientBalance();
    error InvalidReceiver();
    error EmptyMessage();
    error InvalidEscrowAddress();
    error RateLimitExceeded();
    error InvalidFee();
    error TransferFailed();
    error UserBlocked();
    error InvalidCID();
    error ZeroAddress();
    
    modifier notBlocked() {
        if (blockedUsers[msg.sender]) revert UserBlocked();
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
        // Check rate limiting
        if (block.timestamp - lastMessageTime[msg.sender] < RATE_LIMIT_WINDOW) {
            if (messageCount[msg.sender] >= maxMessagesPerHour) {
                revert RateLimitExceeded();
            }
        } else {
            // Reset counter if window passed
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
        
        walletContract = UserWalletContract(_walletContract);
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
        nonReentrant
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
     * @param messageId Message identifier
     * @return message Message struct
     */
    function getMessage(uint256 messageId) external view returns (Message memory message) {
        return messages[messageId];
    }
    
    /**
     * @dev Get all messages for a user (sent or received)
     * @param user User address
     * @param sent True for sent messages, false for received
     * @return messageIds Array of message IDs
     */
    function getMessages(address user, bool sent) external view returns (uint256[] memory messageIds) {
        return sent ? userSentMessages[user] : userReceivedMessages[user];
    }
    
    /**
     * @dev Get conversation between two users with limit
     * @param user1 First user address
     * @param user2 Second user address
     * @param limit Maximum number of messages to return (0 = all)
     * @return messageIds Array of message IDs
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
        
        // Return last 'limit' messages
        uint256 startIndex = allMessages.length - limit;
        messageIds = new uint256[](limit);
        
        for (uint256 i = 0; i < limit; i++) {
            messageIds[i] = allMessages[startIndex + i];
        }
        
        return messageIds;
    }
    
    /**
     * @dev Get latest messages for a user
     * @param user User address
     * @param count Number of latest messages to get
     * @param sent True for sent messages, false for received
     * @return latestMessages Array of Message structs
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
     * @dev Get message count for user
     * @param user User address
     * @param sent True for sent count, false for received count
     * @return count Number of messages
     */
    function getMessageCount(address user, bool sent) external view returns (uint256 count) {
        return sent ? userSentMessages[user].length : userReceivedMessages[user].length;
    }
    
    /**
     * @dev Get conversation count between two users
     * @param user1 First user address
     * @param user2 Second user address
     * @return count Number of messages in conversation
     */
    function getConversationCount(address user1, address user2) external view returns (uint256 count) {
        return conversationMessages[user1][user2].length;
    }
    
    /**
     * @dev Check if user can send a message (balance + rate limit check)
     * @param user User address
     * @return canSend Whether user can send a message
     * @return reason Reason if cannot send (0=can send, 1=insufficient balance, 2=rate limited, 3=blocked)
     */
    function canSendMessage(address user) external view returns (bool canSend, uint8 reason) {
        // Check if blocked
        if (blockedUsers[user]) {
            return (false, 3);
        }
        
        // Check balance
        if (!walletContract.canAfford(user, messageFee)) {
            return (false, 1);
        }
        
        // Check rate limit
        if (block.timestamp - lastMessageTime[user] < RATE_LIMIT_WINDOW) {
            if (messageCount[user] >= maxMessagesPerHour) {
                return (false, 2);
            }
        }
        
        return (true, 0);
    }
    
    // Admin functions
    
    /**
     * @dev Update message fee (admin only)
     * @param newFee New fee amount in wei
     */
    function setMessageFee(uint256 newFee) external onlyOwner {
        uint256 oldFee = messageFee;
        messageFee = newFee;
        emit MessageFeeUpdated(oldFee, newFee);
    }
    
    /**
     * @dev Update escrow address (admin only)
     * @param newEscrow New escrow address
     */
    function setEscrowAddress(address newEscrow) external onlyOwner {
        if (newEscrow == address(0)) revert InvalidEscrowAddress();
        address oldEscrow = escrowAddress;
        escrowAddress = newEscrow;
        emit EscrowAddressUpdated(oldEscrow, newEscrow);
    }
    
    /**
     * @dev Update rate limit (admin only)
     * @param newLimit New max messages per hour
     */
    function setRateLimit(uint256 newLimit) external onlyOwner {
        uint256 oldLimit = maxMessagesPerHour;
        maxMessagesPerHour = newLimit;
        emit RateLimitUpdated(oldLimit, newLimit);
    }
    
    /**
     * @dev Block/unblock a user (admin only)
     * @param user User address
     * @param blocked Whether to block the user
     */
    function setUserBlocked(address user, bool blocked) external onlyOwner {
        blockedUsers[user] = blocked;
        emit UserBlocked(user, blocked);
    }
    
    /**
     * @dev Get contract statistics
     * @return totalMessages Total messages sent
     * @return currentFee Current message fee
     * @return escrowAddr Current escrow address
     * @return totalFeesCollected Total fees collected
     */
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
    
    /**
     * @dev Pause/unpause contract
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Receive ETH from wallet contract for forwarding to escrow
     */
    receive() external payable {
        // Forward to escrow if any ETH is sent directly
        if (msg.value > 0) {
            (bool success, ) = payable(escrowAddress).call{value: msg.value}("");
            if (!success) revert TransferFailed();
        }
    }
}
