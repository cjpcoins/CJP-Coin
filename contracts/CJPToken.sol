// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Import OpenZeppelin Contracts
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CockroachJantaParty is ERC20, Ownable {
    uint256 public constant BURN_RATE = 1; // 1%

    constructor() ERC20("The Cockroach Janta Party", "CJP") Ownable(msg.sender) {
        // Mint 1000 Billion tokens to the deployer (1,000,000,000,000 * 10^18)
        _mint(msg.sender, 1_000_000_000_000 * 10 ** decimals());
    }

    /**
     * @dev Overrides the internal update function to implement the 1% burn on transfers.
     * OpenZeppelin v5 uses _update instead of _transfer.
     */
    function _update(address from, address to, uint256 value) internal virtual override {
        // If minting or burning directly, no transfer tax applies
        if (from == address(0) || to == address(0)) {
            super._update(from, to, value);
            return;
        }

        // Calculate 1% burn amount
        uint256 burnAmount = (value * BURN_RATE) / 100;
        uint256 sendAmount = value - burnAmount;

        // Burn 1% from the sender
        if (burnAmount > 0) {
            // Send to dead address (burn)
            super._update(from, address(0), burnAmount);
        }

        // Send remaining 99% to the receiver
        super._update(from, to, sendAmount);
    }
}
