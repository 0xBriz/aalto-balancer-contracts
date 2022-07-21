import { ethers } from "hardhat";

export async function deployBootstrapPoolFactory(vault: string) {
  try {
    const LiquidityBootstrappingPoolFactory = await ethers.getContractFactory(
      "LiquidityBootstrappingPoolFactory"
    );
    const lbp = await LiquidityBootstrappingPoolFactory.deploy(vault);
    await lbp.deployed();
    console.log("LiquidityBootstrappingPoolFactory deployed to: ", lbp.address);
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
}
