const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ContriToken", function () {
  let contriToken;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    
    const ContriToken = await ethers.getContractFactory("ContriToken");
    contriToken = await ContriToken.deploy(owner.address);
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await contriToken.owner()).to.equal(owner.address);
    });

    it("Should assign the total supply of tokens to the owner", async function () {
      const ownerBalance = await contriToken.balanceOf(owner.address);
      expect(await contriToken.totalSupply()).to.equal(ownerBalance);
    });
  });
});