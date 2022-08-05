import { ethers } from "hardhat";

export async function deployAdminToken() {
  try {
    const AEQToken = await ethers.getContractFactory("AEQToken");
    const token = await AEQToken.deploy("Aequinox", "AEQ");
    await token.deployed();
    console.log("AEQToken address: ", token.address);
    return token;
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
}
