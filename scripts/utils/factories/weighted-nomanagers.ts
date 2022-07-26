import { ethers } from "hardhat";

export async function deployWeightedNoAssetManagersFactory(vault: string) {
  try {
    const WeightedPoolFactory = await ethers.getContractFactory("WeightedPoolNoAMFactory");
    const weighted = await WeightedPoolFactory.deploy(vault);
    await weighted.deployed();
    console.log("WeightedPoolNoAMFactory deployed to: ", weighted.address);
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
}
