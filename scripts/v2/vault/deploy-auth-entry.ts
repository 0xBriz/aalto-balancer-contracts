import { ethers } from "hardhat";

export async function deployAuthEntry(authAdapter: string) {
  try {
    const AuthorizerAdaptorEntrypoint = await ethers.getContractFactory(
      "AuthorizerAdaptorEntrypoint"
    );
    const ct = await AuthorizerAdaptorEntrypoint.deploy(authAdapter);
    await ct.deployed();
    console.log("AuthorizerAdaptorEntrypoint deployed to: ", ct.address);
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
}
