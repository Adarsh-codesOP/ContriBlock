// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ContriToken
 * @dev ERC20 token for the ContriBlock platform
 * Only the Controller contract can mint and burn tokens
 */
contract ContriToken is ERC20, Ownable {
    address public controller;

    event Minted(address indexed to, uint256 amount);
    event Burned(address indexed from, uint256 amount);

    /**
     * @dev Constructor that gives the msg.sender all of existing tokens.
     */
    constructor(address initialOwner) ERC20("ContriToken", "CTR") Ownable(initialOwner) {}

    /**
     * @dev Set the controller address
     * @param _controller The address of the controller contract
     */
    function setController(address _controller) external onlyOwner {
        require(_controller != address(0), "Controller cannot be zero address");
        controller = _controller;
    }

    /**
     * @dev Mint tokens to an address
     * @param to The address to mint tokens to
     * @param amount The amount of tokens to mint
     */
    function mint(address to, uint256 amount) external {
        require(msg.sender == controller, "Only controller can mint");
        require(to != address(0), "Cannot mint to zero address");
        require(amount > 0, "Amount must be greater than zero");

        _mint(to, amount);
        emit Minted(to, amount);
    }

    /**
     * @dev Burn tokens from an address
     * @param from The address to burn tokens from
     * @param amount The amount of tokens to burn
     */
    function burn(address from, uint256 amount) external {
        require(msg.sender == controller, "Only controller can burn");
        require(amount > 0, "Amount must be greater than zero");

        _burn(from, amount);
        emit Burned(from, amount);
    }
}