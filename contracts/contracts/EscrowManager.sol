// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title EscrowManager
 * @dev Advanced escrow system for managing message fees and refunds
 * @notice Handles escrow operations with multisig support and refund capabilities
 */
contract EscrowManager is Ownable, ReentrancyGuard, Pausable {
    
    // State variables
    address public messagingContract;
    mapping(address => bool) public authorizedWithdrawers;
    mapping(address => uint256) public userRefunds; // Available refunds per user
    
    uint256 public totalEscrowed;
    uint256 public totalWithdrawn;
    uint256 public totalRefunded;
    
    // Multisig variables
    mapping(bytes32 => bool) public executedTransactions;
    mapping(bytes32 => mapping(address => bool)) public confirmations;
    mapping(bytes32 => uint256) public confirmationCounts;
    address[] public signers;
    uint256 public requiredConfirmations;
    
    // Events
    event FundsReceived(address indexed from, uint256 amount, uint256 totalEscrowed);
    event FundsWithdrawn(address indexed to, uint256 amount, address indexed withdrawer);
    event RefundIssued(address indexed user, uint256 amount);
    event RefundClaimed(address indexed user, uint256 amount);
    event SignerAdded(address indexed signer);
    event SignerRemoved(address indexed signer);
    event RequiredConfirmationsChanged(uint256 oldRequired, uint256 newRequired);
    event TransactionSubmitted(bytes32 indexed txHash, address indexed submitter);
    event TransactionConfirmed(bytes32 indexed txHash, address indexed signer);
    event TransactionExecuted(bytes32 indexed txHash);
    
    // Errors
    error UnauthorizedWithdrawer();
    error InsufficientFunds();
    error InvalidAmount();
    error InvalidSigner();
    error AlreadyConfirmed();
    error NotEnoughConfirmations();
    error TransactionAlreadyExecuted();
    error InvalidRequiredConfirmations();
    error TransferFailed();
    error NoRefundAvailable();
    
    struct Transaction {
        address to;
        uint256 amount;
        bool executed;
        uint256 confirmations;
        string description;
    }
    
    mapping(bytes32 => Transaction) public transactions;
    
    modifier onlyAuthorizedWithdrawer() {
        if (!authorizedWithdrawers[msg.sender] && msg.sender != owner()) {
            revert UnauthorizedWithdrawer();
        }
        _;
    }
    
    modifier onlySigner() {
        bool isSigner = false;
        for (uint256 i = 0; i < signers.length; i++) {
            if (signers[i] == msg.sender) {
                isSigner = true;
                break;
            }
        }
        if (!isSigner) revert InvalidSigner();
        _;
    }
    
    modifier validAmount(uint256 amount) {
        if (amount == 0) revert InvalidAmount();
        _;
    }
    
    constructor(
        address _messagingContract,
        address[] memory _signers,
        uint256 _requiredConfirmations
    ) {
        if (_signers.length == 0 || _requiredConfirmations == 0 || _requiredConfirmations > _signers.length) {
            revert InvalidRequiredConfirmations();
        }
        
        messagingContract = _messagingContract;
        signers = _signers;
        requiredConfirmations = _requiredConfirmations;
        
        // Add signers as authorized withdrawers
        for (uint256 i = 0; i < _signers.length; i++) {
            authorizedWithdrawers[_signers[i]] = true;
            emit SignerAdded(_signers[i]);
        }
    }
    
    /**
     * @dev Receive ETH from messaging contract
     */
    receive() external payable {
        totalEscrowed += msg.value;
        emit FundsReceived(msg.sender, msg.value, totalEscrowed);
    }
    
    /**
     * @dev Submit a withdrawal transaction (requires multisig)
     * @param to Address to withdraw to
     * @param amount Amount to withdraw
     * @param description Description of the transaction
     * @return txHash Transaction hash
     */
    function submitTransaction(
        address to,
        uint256 amount,
        string memory description
    ) external onlySigner validAmount(amount) returns (bytes32 txHash) {
        if (amount > address(this).balance) revert InsufficientFunds();
        
        txHash = keccak256(abi.encodePacked(to, amount, description, block.timestamp));
        
        transactions[txHash] = Transaction({
            to: to,
            amount: amount,
            executed: false,
            confirmations: 1,
            description: description
        });
        
        confirmations[txHash][msg.sender] = true;
        confirmationCounts[txHash] = 1;
        
        emit TransactionSubmitted(txHash, msg.sender);
        emit TransactionConfirmed(txHash, msg.sender);
        
        // Auto-execute if we have enough confirmations
        if (confirmationCounts[txHash] >= requiredConfirmations) {
            _executeTransaction(txHash);
        }
        
        return txHash;
    }
    
    /**
     * @dev Confirm a transaction
     * @param txHash Transaction hash to confirm
     */
    function confirmTransaction(bytes32 txHash) external onlySigner {
        if (transactions[txHash].to == address(0)) revert InvalidAmount(); // Transaction doesn't exist
        if (confirmations[txHash][msg.sender]) revert AlreadyConfirmed();
        if (transactions[txHash].executed) revert TransactionAlreadyExecuted();
        
        confirmations[txHash][msg.sender] = true;
        confirmationCounts[txHash]++;
        transactions[txHash].confirmations++;
        
        emit TransactionConfirmed(txHash, msg.sender);
        
        // Auto-execute if we have enough confirmations
        if (confirmationCounts[txHash] >= requiredConfirmations) {
            _executeTransaction(txHash);
        }
    }
    
    /**
     * @dev Execute a confirmed transaction
     * @param txHash Transaction hash to execute
     */
    function executeTransaction(bytes32 txHash) external onlySigner {
        if (confirmationCounts[txHash] < requiredConfirmations) revert NotEnoughConfirmations();
        _executeTransaction(txHash);
    }
    
    /**
     * @dev Internal function to execute transaction
     * @param txHash Transaction hash
     */
    function _executeTransaction(bytes32 txHash) internal {
        Transaction storage txn = transactions[txHash];
        
        if (txn.executed) revert TransactionAlreadyExecuted();
        if (txn.amount > address(this).balance) revert InsufficientFunds();
        
        txn.executed = true;
        totalWithdrawn += txn.amount;
        
        (bool success, ) = payable(txn.to).call{value: txn.amount}("");
        if (!success) revert TransferFailed();
        
        emit TransactionExecuted(txHash);
        emit FundsWithdrawn(txn.to, txn.amount, msg.sender);
    }
    
    /**
     * @dev Issue refund to a user (admin only)
     * @param user User to refund
     * @param amount Amount to refund
     */
    function issueRefund(address user, uint256 amount) 
        external 
        onlyOwner 
        validAmount(amount)
    {
        if (amount > address(this).balance) revert InsufficientFunds();
        
        userRefunds[user] += amount;
        emit RefundIssued(user, amount);
    }
    
    /**
     * @dev Claim available refund
     */
    function claimRefund() external nonReentrant {
        uint256 refundAmount = userRefunds[msg.sender];
        if (refundAmount == 0) revert NoRefundAvailable();
        
        userRefunds[msg.sender] = 0;
        totalRefunded += refundAmount;
        
        (bool success, ) = payable(msg.sender).call{value: refundAmount}("");
        if (!success) {
            // Restore refund if transfer fails
            userRefunds[msg.sender] = refundAmount;
            totalRefunded -= refundAmount;
            revert TransferFailed();
        }
        
        emit RefundClaimed(msg.sender, refundAmount);
    }
    
    /**
     * @dev Get available refund for user
     * @param user User address
     * @return refund Available refund amount
     */
    function getRefundAmount(address user) external view returns (uint256 refund) {
        return userRefunds[user];
    }
    
    /**
     * @dev Emergency withdraw (admin only, bypasses multisig)
     * @param to Address to withdraw to
     * @param amount Amount to withdraw
     */
    function emergencyWithdraw(address to, uint256 amount) 
        external 
        onlyOwner 
        whenPaused 
        validAmount(amount)
    {
        if (amount > address(this).balance) revert InsufficientFunds();
        
        totalWithdrawn += amount;
        
        (bool success, ) = payable(to).call{value: amount}("");
        if (!success) revert TransferFailed();
        
        emit FundsWithdrawn(to, amount, msg.sender);
    }
    
    // Admin functions
    
    /**
     * @dev Add authorized withdrawer
     * @param withdrawer Address to authorize
     */
    function addAuthorizedWithdrawer(address withdrawer) external onlyOwner {
        authorizedWithdrawers[withdrawer] = true;
    }
    
    /**
     * @dev Remove authorized withdrawer
     * @param withdrawer Address to deauthorize
     */
    function removeAuthorizedWithdrawer(address withdrawer) external onlyOwner {
        authorizedWithdrawers[withdrawer] = false;
    }
    
    /**
     * @dev Add signer to multisig
     * @param signer Address to add as signer
     */
    function addSigner(address signer) external onlyOwner {
        for (uint256 i = 0; i < signers.length; i++) {
            if (signers[i] == signer) revert InvalidSigner();
        }
        
        signers.push(signer);
        authorizedWithdrawers[signer] = true;
        emit SignerAdded(signer);
    }
    
    /**
     * @dev Remove signer from multisig
     * @param signer Address to remove
     */
    function removeSigner(address signer) external onlyOwner {
        for (uint256 i = 0; i < signers.length; i++) {
            if (signers[i] == signer) {
                signers[i] = signers[signers.length - 1];
                signers.pop();
                authorizedWithdrawers[signer] = false;
                emit SignerRemoved(signer);
                
                // Adjust required confirmations if needed
                if (requiredConfirmations > signers.length) {
                    uint256 oldRequired = requiredConfirmations;
                    requiredConfirmations = signers.length;
                    emit RequiredConfirmationsChanged(oldRequired, requiredConfirmations);
                }
                break;
            }
        }
    }
    
    /**
     * @dev Change required confirmations
     * @param _requiredConfirmations New required confirmations
     */
    function changeRequiredConfirmations(uint256 _requiredConfirmations) external onlyOwner {
        if (_requiredConfirmations == 0 || _requiredConfirmations > signers.length) {
            revert InvalidRequiredConfirmations();
        }
        
        uint256 oldRequired = requiredConfirmations;
        requiredConfirmations = _requiredConfirmations;
        emit RequiredConfirmationsChanged(oldRequired, _requiredConfirmations);
    }
    
    /**
     * @dev Get contract statistics
     * @return totalEsc Total escrowed
     * @return totalWith Total withdrawn
     * @return totalRef Total refunded
     * @return currentBalance Current contract balance
     * @return signerCount Number of signers
     */
    function getStats() external view returns (
        uint256 totalEsc,
        uint256 totalWith,
        uint256 totalRef,
        uint256 currentBalance,
        uint256 signerCount
    ) {
        return (
            totalEscrowed,
            totalWithdrawn,
            totalRefunded,
            address(this).balance,
            signers.length
        );
    }
    
    /**
     * @dev Get signers array
     * @return signersArray Array of signer addresses
     */
    function getSigners() external view returns (address[] memory signersArray) {
        return signers;
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
}
