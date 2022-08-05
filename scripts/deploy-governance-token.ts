import { ethers } from "hardhat";

export async function deployAdminToken() {
  try {
    const AequinoxToken = await ethers.getContractFactory("AequinoxToken");
    const token = await AequinoxToken.deploy("Aequinox", "AEQ");
    await token.deployed();
    console.log("AequinoxToken address: ", token.address);
    return token;
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
}
