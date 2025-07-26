// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title UserWalletContract
 * @dev Manages user deposits, withdrawals, and message fee billing with escrow support
 * @notice This contract handles all financial operations for the messaging system
 */
contract UserWalletContract is ReentrancyGuard, Ownable, Pausable {
    // State variables
    mapping(address => uint256) private userBalances;
    mapping(address => bool) private authorizedSpenders; // Messaging contracts that can spend
    
    uint256 public constant MINIMUM_DEPOSIT = 0.01 ether; // 0.01 ETH minimum
    uint256 public totalDeposits;
    uint256 public totalWithdrawals;
    uint256 public totalSpent;
    
    // Events
    event Deposited(address indexed user, uint256 amount, uint256 newBalance);
    event Withdrawn(address indexed user, uint256 amount, uint256 remainingBalance);
    event Spent(address indexed user, address indexed spender, uint256 amount, uint256 remainingBalance);
    event SpenderAuthorized(address indexed spender, bool authorized);
    event EmergencyWithdrawal(address indexed user, uint256 amount);
    
    // Errors
    error InsufficientBalance();
    error BelowMinimumDeposit();
    error UnauthorizedSpender();
    error InvalidAmount();
    error TransferFailed();
    error ZeroAddress();
    
    modifier onlyAuthorizedSpender() {
        if (!authorizedSpenders[msg.sender]) revert UnauthorizedSpender();
        _;
    }
    
    modifier validAmount(uint256 amount) {
        if (amount == 0) revert InvalidAmount();
        _;
    }
    
    constructor() {}
    
    /**
     * @dev Deposit ETH into user's wallet
     * @notice Users must deposit at least MINIMUM_DEPOSIT
     */
    function deposit() external payable nonReentrant whenNotPaused {
        if (msg.value < MINIMUM_DEPOSIT) revert BelowMinimumDeposit();
        
        userBalances[msg.sender] += msg.value;
        totalDeposits += msg.value;
        
        emit Deposited(msg.sender, msg.value, userBalances[msg.sender]);
    }
    
    /**
     * @dev Withdraw ETH from user's wallet
     * @param amount Amount to withdraw in wei
     */
    function withdraw(uint256 amount) external nonReentrant whenNotPaused validAmount(amount) {
        if (userBalances[msg.sender] < amount) revert InsufficientBalance();
        
        userBalances[msg.sender] -= amount;
        totalWithdrawals += amount;
        
        // Transfer using call for better gas efficiency and error handling
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        if (!success) revert TransferFailed();
        
        emit Withdrawn(msg.sender, amount, userBalances[msg.sender]);
    }
    
    /**
     * @dev Spend user's balance (only callable by authorized contracts)
     * @param from User whose balance to deduct
     * @param amount Amount to spend
     * @return success Whether the spending was successful
     */
    function spend(address from, uint256 amount) 
        external 
        onlyAuthorizedSpender 
        nonReentrant 
        whenNotPaused 
        validAmount(amount)
        returns (bool success) 
    {
        if (from == address(0)) revert ZeroAddress();
        if (userBalances[from] < amount) revert InsufficientBalance();
        
        userBalances[from] -= amount;
        totalSpent += amount;
        
        emit Spent(from, msg.sender, amount, userBalances[from]);
        return true;
    }
    
    /**
     * @dev Check user's balance
     * @param user User address
     * @return balance User's current balance
     */
    function checkBalance(address user) external view returns (uint256 balance) {
        return userBalances[user];
    }
    
    /**
     * @dev Check if user can afford a certain amount
     * @param user User address
     * @param amount Amount to check
     * @return canAfford Whether user can afford the amount
     */
    function canAfford(address user, uint256 amount) external view returns (bool canAfford) {
        return userBalances[user] >= amount;
    }
    
    /**
     * @dev Get contract statistics
     * @return totalDep Total deposits
     * @return totalWith Total withdrawals  
     * @return totalSp Total spent
     * @return contractBal Contract balance
     */
    function getStats() external view returns (
        uint256 totalDep,
        uint256 totalWith,
        uint256 totalSp,
        uint256 contractBal
    ) {
        return (totalDeposits, totalWithdrawals, totalSpent, address(this).balance);
    }
    
    // Admin functions
    
    /**
     * @dev Authorize/deauthorize a spender contract
     * @param spender Address to authorize/deauthorize
     * @param authorized Whether to authorize or deauthorize
     */
    function setAuthorizedSpender(address spender, bool authorized) external onlyOwner {
        if (spender == address(0)) revert ZeroAddress();
        authorizedSpenders[spender] = authorized;
        emit SpenderAuthorized(spender, authorized);
    }
    
    /**
     * @dev Check if address is authorized spender
     * @param spender Address to check
     * @return isAuthorized Whether address is authorized
     */
    function isAuthorizedSpender(address spender) external view returns (bool isAuthorized) {
        return authorizedSpenders[spender];
    }
    
    /**
     * @dev Emergency withdrawal for specific user (admin only)
     * @param user User to withdraw for
     * @param amount Amount to withdraw
     */
    function emergencyWithdraw(address user, uint256 amount) external onlyOwner {
        if (user == address(0)) revert ZeroAddress();
        if (userBalances[user] < amount) revert InsufficientBalance();
        
        userBalances[user] -= amount;
        
        (bool success, ) = payable(user).call{value: amount}("");
        if (!success) revert TransferFailed();
        
        emit EmergencyWithdrawal(user, amount);
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
     * @dev Fallback function to receive ETH
     */
    receive() external payable {
        // Allow direct ETH transfers (will be counted as deposits)
        if (msg.value >= MINIMUM_DEPOSIT) {
            userBalances[msg.sender] += msg.value;
            totalDeposits += msg.value;
            emit Deposited(msg.sender, msg.value, userBalances[msg.sender]);
        }
    }
}
