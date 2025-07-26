// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title SimpleEscrow
 * @dev Simple escrow contract for message fees
 */
contract SimpleEscrow {
    address public owner;
    address public messagingContract;
    mapping(address => uint256) public userRefunds;
    
    uint256 public totalReceived;
    uint256 public totalWithdrawn;
    uint256 public totalRefunded;
    
    event FundsReceived(address indexed from, uint256 amount);
    event FundsWithdrawn(address indexed to, uint256 amount);
    event RefundIssued(address indexed user, uint256 amount);
    event RefundClaimed(address indexed user, uint256 amount);
    
    error OnlyOwner();
    error InsufficientFunds();
    error TransferFailed();
    error NoRefundAvailable();
    error ZeroAddress();
    
    modifier onlyOwner() {
        if (msg.sender != owner) revert OnlyOwner();
        _;
    }
    
    constructor(address _messagingContract) {
        owner = msg.sender;
        messagingContract = _messagingContract;
    }
    
    function withdraw(address to, uint256 amount) external onlyOwner {
        if (to == address(0)) revert ZeroAddress();
        if (amount > address(this).balance) revert InsufficientFunds();
        
        totalWithdrawn += amount;
        
        (bool success, ) = payable(to).call{value: amount}("");
        if (!success) revert TransferFailed();
        
        emit FundsWithdrawn(to, amount);
    }
    
    function issueRefund(address user, uint256 amount) external onlyOwner {
        if (user == address(0)) revert ZeroAddress();
        if (amount > address(this).balance) revert InsufficientFunds();
        
        userRefunds[user] += amount;
        emit RefundIssued(user, amount);
    }
    
    function claimRefund() external {
        uint256 refundAmount = userRefunds[msg.sender];
        if (refundAmount == 0) revert NoRefundAvailable();
        
        userRefunds[msg.sender] = 0;
        totalRefunded += refundAmount;
        
        (bool success, ) = payable(msg.sender).call{value: refundAmount}("");
        if (!success) {
            userRefunds[msg.sender] = refundAmount;
            totalRefunded -= refundAmount;
            revert TransferFailed();
        }
        
        emit RefundClaimed(msg.sender, refundAmount);
    }
    
    function getRefundAmount(address user) external view returns (uint256) {
        return userRefunds[user];
    }
    
    function getStats() external view returns (
        uint256 totalRec,
        uint256 totalWith,
        uint256 totalRef,
        uint256 currentBalance
    ) {
        return (totalReceived, totalWithdrawn, totalRefunded, address(this).balance);
    }
    
    receive() external payable {
        totalReceived += msg.value;
        emit FundsReceived(msg.sender, msg.value);
    }
}
