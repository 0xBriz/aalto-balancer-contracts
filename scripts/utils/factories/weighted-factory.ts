import { ethers } from "hardhat";

export async function deployWeightedFactory(vault: string) {
  try {
    const WeightedPoolFactory = await ethers.getContractFactory(
      "WeightedPoolFactory"
    );
    const weighted = await WeightedPoolFactory.deploy(vault);
    await weighted.deployed();
    console.log("WeightedPoolFactory deployed to: ", weighted.address);
  } catch (error) {
    throw error;
  }
}
