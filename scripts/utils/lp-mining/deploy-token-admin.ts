import { ethers } from "hardhat";

// Needed for BalancerMinter
export async function deployTokenAdmin(vault: string, balToken: string) {
  try {
    const BalancerTokenAdmin = await ethers.getContractFactory("BalancerTokenAdmin");
    const admin = await BalancerTokenAdmin.deploy(vault, balToken);
    await admin.deployed();
    console.log("BalancerTokenAdmin deployed to: ", admin.address);
    return admin;
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
}
