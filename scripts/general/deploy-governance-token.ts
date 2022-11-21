import { ethers } from "hardhat";

export async function deployGovernanceToken(name: string, symbol: string) {
  try {
    const AequinoxToken = await ethers.getContractFactory("AequinoxToken");
    const token = await AequinoxToken.deploy(name, symbol);
    await token.deployed();
    console.log(`${name} address: `, token.address);
    return token;
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
}
