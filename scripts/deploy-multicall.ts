import { ethers } from "hardhat";

async function main() {
  const Multicall2 = await ethers.getContractFactory("Multicall2");
  const multi = await Multicall2.deploy();
  await multi.deployed();
  console.log("Multicall2 deployed to: ", multi.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
