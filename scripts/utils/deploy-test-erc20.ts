import { BigNumber } from "ethers";
import { ethers } from "hardhat";

export async function deployTestERC20(initialMint: BigNumber) {
  try {
    const TestERC20 = await ethers.getContractFactory("TestERC20");
    const token = await TestERC20.deploy(initialMint);
    await token.deployed();
    console.log("TestERC20 address: ", token.address);
    return token;
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
}
