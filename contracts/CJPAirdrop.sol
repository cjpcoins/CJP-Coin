// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract CJPAirdrop is Ownable, ReentrancyGuard {
    IERC20 public immutable cjpToken;
    
    uint256 public constant REWARD_AMOUNT = 10000 * 10**18; // 10,000 CJP
    uint256 public constant COOLDOWN_PERIOD = 24 hours;
    
    mapping(address => uint256) public lastClaimTime;
    
    event Claimed(address indexed user, uint256 amount);
    
    constructor(address _cjpTokenAddress) Ownable(msg.sender) {
        require(_cjpTokenAddress != address(0), "Invalid token address");
        cjpToken = IERC20(_cjpTokenAddress);
    }
    
    function claim() external nonReentrant {
        require(block.timestamp >= lastClaimTime[msg.sender] + COOLDOWN_PERIOD, "Must wait 24 hours between claims");
        
        // Ensure contract has enough balance
        uint256 contractBalance = cjpToken.balanceOf(address(this));
        require(contractBalance >= REWARD_AMOUNT, "Airdrop pool is empty");
        
        // Update claim time BEFORE transfer to prevent reentrancy (Checks-Effects-Interactions pattern)
        lastClaimTime[msg.sender] = block.timestamp;
        
        // Transfer tokens (Note: This will trigger the 1% burn tax from the CJP Token contract!)
        require(cjpToken.transfer(msg.sender, REWARD_AMOUNT), "Transfer failed");
        
        emit Claimed(msg.sender, REWARD_AMOUNT);
    }
    
    // Allow owner to withdraw remaining tokens if they ever want to end the airdrop early
    function withdrawLeftovers() external onlyOwner {
        uint256 balance = cjpToken.balanceOf(address(this));
        require(balance > 0, "No tokens to withdraw");
        require(cjpToken.transfer(owner(), balance), "Transfer failed");
    }
}
