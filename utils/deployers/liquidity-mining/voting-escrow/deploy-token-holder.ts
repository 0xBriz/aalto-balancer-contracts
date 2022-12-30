import { ethers } from "hardhat";

export async function deployBalTokenHolder(balToken: string, vault: string, name: string) {
  try {
    const BALTokenHolder = await ethers.getContractFactory("BALTokenHolder");
    const holder = await BALTokenHolder.deploy(balToken, vault, name);
    await holder.deployed();
    console.log("BALTokenHolder deployed to: ", holder.address);
    return holder;
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
}
