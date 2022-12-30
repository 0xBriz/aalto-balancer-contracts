import { BigNumber } from "ethers";
import { ethers } from "hardhat";

// Needed for BalancerMinter
export async function deployTokenAdmin(
  vault: string,
  balToken: string,
  initialMintAllowance: BigNumber
) {
  try {
    const BalancerTokenAdmin = await ethers.getContractFactory("BalancerTokenAdmin");
    const admin = await BalancerTokenAdmin.deploy(vault, balToken, initialMintAllowance);
    await admin.deployed();
    console.log("BalancerTokenAdmin deployed to: ", admin.address);
    return admin;
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
}
