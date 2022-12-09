import { ethers } from "hardhat";

export async function deployGovernanceToken(name: string, symbol: string) {
  try {
    const GovernanceToken = await ethers.getContractFactory("GovernanceToken");
    const token = await GovernanceToken.deploy(name, symbol);
    await token.deployed();
    console.log(`${name} address: `, token.address);
    return token;
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
}
