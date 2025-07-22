// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title MessagingContract
 * @dev Fully on-chain encrypted messaging system
 * @notice This contract stores encrypted messages on-chain with end-to-end encryption
 */
contract MessagingContract {
    // Events
    event MessageSent(
        address indexed from,
        address indexed to,
        string encryptedContent,
        uint256 timestamp,
        string nonce
    );
    
    event PublicKeyRegistered(
        address indexed user,
        string publicKey,
        uint256 timestamp
    );

    // Structs
    struct Message {
        address from;
        address to;
        string encryptedContent;
        uint256 timestamp;
        string nonce;
    }

    struct UserProfile {
        string publicKey;
        uint256 messageCount;
        bool isRegistered;
    }

    mapping(address => UserProfile) public userProfiles;
    mapping(address => Message[]) private userMessages; 
    mapping(address => uint256) public messageCounts;
    
    Message[] private allMessages;

    uint256 public constant MAX_MESSAGE_LENGTH = 4096; 
    uint256 public constant MAX_NONCE_LENGTH = 64;
    uint256 public constant MESSAGE_FEE = 0.001 ether; 
    
    address public owner;
    bool public isPaused = false;
    
    mapping(address => uint256) public lastMessageTime;
    uint256 public constant RATE_LIMIT_DURATION = 1 seconds; 

    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier whenNotPaused() {
        require(!isPaused, "Contract is paused");
        _;
    }
    
    modifier rateLimited() {
        require(
            lastMessageTime[msg.sender] == 0 || 
            block.timestamp > lastMessageTime[msg.sender] + RATE_LIMIT_DURATION,
            "Rate limit exceeded"
        );
        _;
    }

    modifier validMessageData(string memory _encryptedContent, string memory _nonce) {
        require(bytes(_encryptedContent).length > 0, "Message cannot be empty");
        require(bytes(_encryptedContent).length <= MAX_MESSAGE_LENGTH, "Message too long");
        require(bytes(_nonce).length > 0, "Nonce cannot be empty");
        require(bytes(_nonce).length <= MAX_NONCE_LENGTH, "Nonce too long");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /**
     * @dev Register or update user's public key
     * @param _publicKey The user's encryption public key
     */
    function registerPublicKey(string memory _publicKey) external {
        require(bytes(_publicKey).length > 0, "Public key cannot be empty");
        require(bytes(_publicKey).length <= 256, "Public key too long");
        
        userProfiles[msg.sender].publicKey = _publicKey;
        userProfiles[msg.sender].isRegistered = true;
        
        emit PublicKeyRegistered(msg.sender, _publicKey, block.timestamp);
    }

    /**
     * @dev Send an encrypted message
     * @param _to Recipient address
     * @param _encryptedContent Encrypted message content
     * @param _nonce Unique nonce for the message
     */
    function sendMessage(
        address _to,
        string memory _encryptedContent,
        string memory _nonce
    ) 
        external 
        payable 
        whenNotPaused 
        rateLimited 
        validMessageData(_encryptedContent, _nonce)
    {
        require(_to != address(0), "Invalid recipient address");
        require(_to != msg.sender, "Cannot send message to yourself");
        require(msg.value >= MESSAGE_FEE, "Insufficient fee");
        
        // Verify recipient has registered a public key (optional check)
        // require(userProfiles[_to].isRegistered, "Recipient not registered");

        Message memory newMessage = Message({
            from: msg.sender,
            to: _to,
            encryptedContent: _encryptedContent,
            timestamp: block.timestamp,
            nonce: _nonce
        });

        // Store message for recipient
        userMessages[_to].push(newMessage);
        
        // Store in global array for pagination
        allMessages.push(newMessage);
        
        // Update counters
        messageCounts[_to]++;
        userProfiles[msg.sender].messageCount++;
        
        // Update rate limiting
        lastMessageTime[msg.sender] = block.timestamp;

        emit MessageSent(
            msg.sender,
            _to,
            _encryptedContent,
            block.timestamp,
            _nonce
        );
    }

    /**
     * @dev Get messages for a specific user (with pagination)
     * @param _user The user whose messages to retrieve
     * @param _offset Starting index
     * @param _limit Maximum number of messages to return
     * @return Array of messages
     */
    function getMessages(
        address _user,
        uint256 _offset,
        uint256 _limit
    ) external view returns (Message[] memory) {
        require(_limit > 0 && _limit <= 100, "Invalid limit");
        
        Message[] storage messages = userMessages[_user];
        uint256 totalMessages = messages.length;
        
        if (_offset >= totalMessages) {
            return new Message[](0);
        }
        
        uint256 end = _offset + _limit;
        if (end > totalMessages) {
            end = totalMessages;
        }
        
        uint256 resultLength = end - _offset;
        Message[] memory result = new Message[](resultLength);
        
        for (uint256 i = 0; i < resultLength; i++) {
            result[i] = messages[totalMessages - 1 - (_offset + i)]; // Return newest first
        }
        
        return result;
    }

    /**
     * @dev Get message count for a user
     * @param _user The user address
     * @return Number of messages received by the user
     */
    function getMessageCount(address _user) external view returns (uint256) {
        return messageCounts[_user];
    }

    /**
     * @dev Get user's public key
     * @param _user The user address
     * @return The user's public key
     */
    function getPublicKey(address _user) external view returns (string memory) {
        return userProfiles[_user].publicKey;
    }

    /**
     * @dev Check if user is registered
     * @param _user The user address
     * @return Whether the user has registered a public key
     */
    function isUserRegistered(address _user) external view returns (bool) {
        return userProfiles[_user].isRegistered;
    }

    /**
     * @dev Get total number of messages in the system
     * @return Total message count
     */
    function getTotalMessageCount() external view returns (uint256) {
        return allMessages.length;
    }

    /**
     * @dev Get conversation between two users
     * @param _user1 First user address
     * @param _user2 Second user address
     * @param _limit Maximum number of messages to return
     * @return Array of messages between the two users
     */
    function getConversation(
        address _user1,
        address _user2,
        uint256 _limit
    ) external view returns (Message[] memory) {
        require(_limit > 0 && _limit <= 50, "Invalid limit");
        
        // Count messages between users
        uint256 count = 0;
        for (uint256 i = 0; i < allMessages.length; i++) {
            if (
                (allMessages[i].from == _user1 && allMessages[i].to == _user2) ||
                (allMessages[i].from == _user2 && allMessages[i].to == _user1)
            ) {
                count++;
            }
        }
        
        if (count == 0) {
            return new Message[](0);
        }
        
        uint256 resultLength = count > _limit ? _limit : count;
        Message[] memory result = new Message[](resultLength);
        uint256 resultIndex = 0;

        for (uint256 i = allMessages.length; i > 0 && resultIndex < resultLength; i--) {
            uint256 index = i - 1;
            if (
                (allMessages[index].from == _user1 && allMessages[index].to == _user2) ||
                (allMessages[index].from == _user2 && allMessages[index].to == _user1)
            ) {
                result[resultIndex] = allMessages[index];
                resultIndex++;
            }
        }
        
        return result;
    }

    // Admin functions
    
    /**
     * @dev Pause the contract (emergency stop)
     */
    function pause() external onlyOwner {
        isPaused = true;
    }

    /**
     * @dev Unpause the contract
     */
    function unpause() external onlyOwner {
        isPaused = false;
    }

    /**
     * @dev Update message fee
     * @param _newFee New fee amount in wei
     */
    function updateMessageFee(uint256 _newFee) external onlyOwner {
        // Commented out for now since MESSAGE_FEE is constant
        // MESSAGE_FEE = _newFee;
    }

    /**
     * @dev Withdraw collected fees
     */
    function withdrawFees() external onlyOwner {
        require(address(this).balance > 0, "No fees to withdraw");
        payable(owner).transfer(address(this).balance);
    }

    /**
     * @dev Transfer ownership
     * @param _newOwner New owner address
     */
    function transferOwnership(address _newOwner) external onlyOwner {
        require(_newOwner != address(0), "Invalid new owner");
        owner = _newOwner;
    }

    // Fallback and receive functions
    receive() external payable {}
    fallback() external payable {}
}