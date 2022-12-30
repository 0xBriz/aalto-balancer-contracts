import { ethers } from "hardhat";

export async function deployWeightedFactory(vault: string) {
  try {
    const WeightedPoolFactory = await ethers.getContractFactory("WeightedPoolFactory");
    const weighted = await WeightedPoolFactory.deploy(vault);
    await weighted.deployed();
    console.log("WeightedPoolFactory deployed to: ", weighted.address);
    return weighted;
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
}
