require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
require("./tasks/accounts"); // Custom accounts task

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.20",
      },
    ],
  },
  networks: {
    hardhat: {
      // built-in in-memory Hardhat network
    },
    localhost: {
      url: "http://127.0.0.1:8545",
    },
    custom: {
      url: process.env.WEB3_RPC_URL || "",
      accounts: process.env.ADMIN_PRIVATE_KEY ? [process.env.ADMIN_PRIVATE_KEY] : [],
    },
  },
  paths: {
    sources: "./src",    // your Solidity files
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};
