import { ethers } from "hardhat";

export async function deployLinearPoolFactory(vault: string) {
  try {
    const ERC4626LinearPoolFactory = await ethers.getContractFactory("ERC4626LinearPoolFactory");
    const factory = await ERC4626LinearPoolFactory.deploy(vault);
    await factory.deployed();
    console.log("ERC4626LinearPoolFactory deployed to: ", factory.address);
    return factory;
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
}
