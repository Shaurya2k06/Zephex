// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title UserWalletContract
 * @dev Simplified wallet contract for message fee management
 */
contract UserWalletContract {
    address public owner;
    mapping(address => uint256) private userBalances;
    mapping(address => bool) private authorizedSpenders;
    
    uint256 public constant MINIMUM_DEPOSIT = 0.01 ether;
    uint256 public totalDeposits;
    uint256 public totalWithdrawals;
    uint256 public totalSpent;
    
    // Events
    event Deposited(address indexed user, uint256 amount, uint256 newBalance);
    event Withdrawn(address indexed user, uint256 amount, uint256 remainingBalance);
    event Spent(address indexed user, address indexed spender, uint256 amount, uint256 remainingBalance);
    event SpenderAuthorized(address indexed spender, bool authorized);
    
    // Errors
    error InsufficientBalance();
    error BelowMinimumDeposit();
    error UnauthorizedSpender();
    error InvalidAmount();
    error TransferFailed();
    error ZeroAddress();
    error OnlyOwner();
    
    modifier onlyOwner() {
        if (msg.sender != owner) revert OnlyOwner();
        _;
    }
    
    modifier onlyAuthorizedSpender() {
        if (!authorizedSpenders[msg.sender]) revert UnauthorizedSpender();
        _;
    }
    
    modifier validAmount(uint256 amount) {
        if (amount == 0) revert InvalidAmount();
        _;
    }
    
    constructor() {
        owner = msg.sender;
    }
    
    /**
     * @dev Deposit ETH into user's wallet
     */
    function deposit() external payable {
        if (msg.value < MINIMUM_DEPOSIT) revert BelowMinimumDeposit();
        
        userBalances[msg.sender] += msg.value;
        totalDeposits += msg.value;
        
        emit Deposited(msg.sender, msg.value, userBalances[msg.sender]);
    }
    
    /**
     * @dev Withdraw ETH from user's wallet
     * @param amount Amount to withdraw in wei
     */
    function withdraw(uint256 amount) external validAmount(amount) {
        if (userBalances[msg.sender] < amount) revert InsufficientBalance();
        
        userBalances[msg.sender] -= amount;
        totalWithdrawals += amount;
        
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
     * @return affordable Whether user can afford the amount
     */
    function canAfford(address user, uint256 amount) external view returns (bool affordable) {
        return userBalances[user] >= amount;
    }
    
    /**
     * @dev Authorize/deauthorize a spender contract (admin only)
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
     * @dev Get contract statistics
     */
    function getStats() external view returns (
        uint256 totalDep,
        uint256 totalWith,
        uint256 totalSp,
        uint256 contractBal
    ) {
        return (totalDeposits, totalWithdrawals, totalSpent, address(this).balance);
    }
    
    /**
     * @dev Receive ETH directly
     */
    receive() external payable {
        if (msg.value >= MINIMUM_DEPOSIT) {
            userBalances[msg.sender] += msg.value;
            totalDeposits += msg.value;
            emit Deposited(msg.sender, msg.value, userBalances[msg.sender]);
        }
    }
}
