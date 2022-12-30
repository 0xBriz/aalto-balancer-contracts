import { ethers } from "hardhat";

export async function deployStablePoolFactory(vault: string) {
  try {
    const StablePoolFactory = await ethers.getContractFactory("StablePoolFactory");
    const stable = await StablePoolFactory.deploy(vault);
    await stable.deployed();
    console.log("StablePoolFactory deployed to: ", stable.address);
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
}
