import { ethers } from "hardhat";

export async function deployAuthAdapter(vault: string) {
  try {
    const AuthorizerAdaptor = await ethers.getContractFactory("AuthorizerAdaptor");
    const auth = await AuthorizerAdaptor.deploy(vault);
    await auth.deployed();
    console.log("AuthorizerAdaptor deployed to: ", auth.address);
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
}
