import { ethers } from "hardhat";

export async function deployBalTokenAdmin(vault: string, balToken: string) {
  try {
    const BalancerTokenAdmin = await ethers.getContractFactory("BalancerTokenAdmin");
    const contract = await BalancerTokenAdmin.deploy(vault, balToken);
    await contract.deployed();
    console.log("BalancerTokenAdmin address: ", contract.address);

    return contract;
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
}
