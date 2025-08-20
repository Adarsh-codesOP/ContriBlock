// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Counter is Ownable {
  uint public x;
  
  event Increment(uint by);
  event Decrement(uint by);
  event Reset(uint oldValue);

  constructor(address initialOwner) Ownable(initialOwner) {}

  function inc() public {
    x++;
    emit Increment(1);
  }

  function incBy(uint by) public {
    require(by > 0, "incBy: increment should be positive");
    x += by;
    emit Increment(by);
  }
  
  function dec() public {
    require(x > 0, "dec: counter cannot go below zero");
    x--;
    emit Decrement(1);
  }
  
  function decBy(uint by) public {
    require(by > 0, "decBy: decrement should be positive");
    require(x >= by, "decBy: counter cannot go below zero");
    x -= by;
    emit Decrement(by);
  }
  
  function reset() public onlyOwner {
    uint oldValue = x;
    x = 0;
    emit Reset(oldValue);
  }
}
