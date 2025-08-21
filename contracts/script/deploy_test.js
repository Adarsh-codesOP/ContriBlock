// Simple deployment script to test the contracts
const hre = require("hardhat");

async function main() {
  console.log("Deploying contracts...");

  // Get the signers
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy ContriToken
  const ContriToken = await hre.ethers.getContractFactory("ContriToken");
  const contriToken = await ContriToken.deploy(deployer.address);
  await contriToken.waitForDeployment();
  console.log("ContriToken deployed to:", await contriToken.getAddress());

  // Deploy Controller
  const Controller = await hre.ethers.getContractFactory("Controller");
  const controller = await Controller.deploy(await contriToken.getAddress(), deployer.address);
  await controller.waitForDeployment();
  console.log("Controller deployed to:", await controller.getAddress());

  // Set controller in ContriToken
  await contriToken.setController(await controller.getAddress());
  console.log("Controller set in ContriToken");

  console.log("Deployment completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });