import { ethers } from "hardhat";

export async function deployBalancerMinter(tokenAdmin: string, gaugeController: string) {
  try {
    const BalancerMinter = await ethers.getContractFactory("BalancerMinter");
    const minter = await BalancerMinter.deploy(tokenAdmin, gaugeController);
    await minter.deployed();
    console.log("BalancerMinter deployed to: ", minter.address);
    return minter.address;
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
}
