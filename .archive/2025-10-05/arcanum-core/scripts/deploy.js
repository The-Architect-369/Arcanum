const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  const ChainCode = await hre.ethers.getContractFactory("ChainCode");
  const acc = await ChainCode.deploy();
  await acc.deployed();
  console.log("ACC deployed to:", acc.address);

  const MANA = await hre.ethers.getContractFactory("MANA");
  const mana = await MANA.deploy();
  await mana.deployed();
  console.log("MANA deployed to:", mana.address);
}

main().catch((e) => { console.error(e); process.exitCode = 1; });
