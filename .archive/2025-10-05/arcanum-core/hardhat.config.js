require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const SEPOLIA_RPC = process.env.SEPOLIA_RPC || "";
const PRIVATE_KEY  = process.env.PRIVATE_KEY || ""; // deployer

module.exports = {
  solidity: "0.8.20",
  networks: {
    hardhat: {},
    sepolia: SEPOLIA_RPC && PRIVATE_KEY ? {
      url: SEPOLIA_RPC,
      accounts: [PRIVATE_KEY],
    } : undefined,
  }
};
