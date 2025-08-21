// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {Counter} from "./Counter.sol";
import {Test} from "forge-std/Test.sol";

// Solidity tests are compatible with foundry, so they
// use the same syntax and offer the same functionality.

contract CounterTest is Test {
  Counter counter;
  address owner = address(this);

  function setUp() public {
    counter = new Counter(owner);
  }

  function test_InitialValue() public view {
    require(counter.x() == 0, "Initial value should be 0");
  }

  function testFuzz_Inc(uint8 x) public {
    for (uint8 i = 0; i < x; i++) {
      counter.inc();
    }
    require(counter.x() == x, "Value after calling inc x times should be x");
  }

  function test_IncByZero() public {
    vm.expectRevert();
    counter.incBy(0);
  }
  
  function test_Dec() public {
    counter.inc();
    counter.inc();
    counter.dec();
    require(counter.x() == 1, "Value after decrementing should be 1");
  }
  
  function test_DecByZero() public {
    vm.expectRevert();
    counter.decBy(0);
  }
  
  function test_DecBelowZero() public {
    counter.inc();
    vm.expectRevert();
    counter.decBy(2);
  }
  
  function test_Reset() public {
    counter.incBy(10);
    counter.reset();
    require(counter.x() == 0, "Value after reset should be 0");
  }
  
  function test_ResetOnlyOwner() public {
    counter.incBy(10);
    vm.prank(address(0x1));
    vm.expectRevert();
    counter.reset();
  }
}
