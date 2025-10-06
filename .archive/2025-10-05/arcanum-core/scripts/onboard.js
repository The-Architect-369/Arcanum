const hre = require("hardhat");

async function main() {
  const [deployer, user] = await hre.ethers.getSigners();
  console.log("Deployer:", deployer.address, "User:", user.address);

  // Reuse if already deployed: else deploy fresh
  const ChainCode = await hre.ethers.getContractFactory("ChainCode");
  const acc = await ChainCode.deploy();
  await acc.deployed();
  console.log("ACC:", acc.address);

  const MANA = await hre.ethers.getContractFactory("MANA");
  const mana = await MANA.deploy();
  await mana.deployed();
  console.log("MANA:", mana.address);

  // Mint ACC for user and credit 100 MANA
  const tx1 = await acc.mintACC(user.address);
  await tx1.wait();
  console.log("Minted ACC for", user.address);

  const amount = hre.ethers.parseUnits("100", 18);
  const tx2 = await mana.mint(user.address, amount);
  await tx2.wait();
  console.log("Minted 100 MANA for", user.address);
}

main().catch((e) => { console.error(e); process.exitCode = 1; });
