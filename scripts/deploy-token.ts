import { ethers } from "hardhat";

export async function deployToken() {
  try {
    const AQX = await ethers.getContractFactory("AQX");
    const token = await AQX.deploy();
    await token.deployed();
    console.log("AQX address: ", token.address);
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
}
