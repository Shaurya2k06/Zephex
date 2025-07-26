// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title WalletContract
 * @dev In-built wallet system for automatic message payments
 */
contract WalletContract {
    // Events
    event Deposit(address indexed user, uint256 amount, uint256 timestamp);
    event Withdrawal(address indexed user, uint256 amount, uint256 timestamp);
    event AutoPayment(address indexed user, uint256 amount, uint256 timestamp);

    // User wallet balances
    mapping(address => uint256) public balances;
    
    // Contract owner
    address public owner;
    
    // Minimum deposit amount
    uint256 public constant MIN_DEPOSIT = 0.001 ether;
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier hasBalance(uint256 _amount) {
        require(balances[msg.sender] >= _amount, "Insufficient wallet balance");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /**
     * @dev Deposit ETH into user's wallet
     */
    function deposit() external payable {
        require(msg.value >= MIN_DEPOSIT, "Minimum deposit is 0.001 ETH");
        
        balances[msg.sender] += msg.value;
        
        emit Deposit(msg.sender, msg.value, block.timestamp);
    }

    /**
     * @dev Withdraw ETH from user's wallet
     */
    function withdraw(uint256 _amount) external hasBalance(_amount) {
        require(_amount > 0, "Amount must be greater than 0");
        
        balances[msg.sender] -= _amount;
        payable(msg.sender).transfer(_amount);
        
        emit Withdrawal(msg.sender, _amount, block.timestamp);
    }

    /**
     * @dev Auto-deduct payment for message (internal function)
     */
    function deductPayment(address _user, uint256 _amount) external onlyOwner returns (bool) {
        if (balances[_user] >= _amount) {
            balances[_user] -= _amount;
            emit AutoPayment(_user, _amount, block.timestamp);
            return true;
        }
        return false;
    }

    /**
     * @dev Get user's wallet balance
     */
    function getBalance(address _user) external view returns (uint256) {
        return balances[_user];
    }

    /**
     * @dev Get contract's total balance
     */
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }

    /**
     * @dev Emergency withdraw by owner
     */
    function emergencyWithdraw() external onlyOwner {
        payable(owner).transfer(address(this).balance);
    }

    // Fallback and receive functions
    receive() external payable {
        balances[msg.sender] += msg.value;
        emit Deposit(msg.sender, msg.value, block.timestamp);
    }
    
    fallback() external payable {
        balances[msg.sender] += msg.value;
        emit Deposit(msg.sender, msg.value, block.timestamp);
    }
}
