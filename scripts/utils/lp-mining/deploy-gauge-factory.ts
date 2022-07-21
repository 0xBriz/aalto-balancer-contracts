import { ethers } from "hardhat";

export async function deployGaugeFactory(minter: string, veBoostProxy: string, auth: string) {
  try {
    // __init__(minter: address, veBoostProxy: address, authorizerAdaptor: address)
    const LiquidityGaugeV5 = await ethers.getContractFactory("LiquidityGaugeV5");
    const v5 = await LiquidityGaugeV5.deploy(minter, veBoostProxy, auth);
    await v5.deployed();
    console.log("LiquidityGaugeV5 deployed to: ", v5.address);

    const LiquidityGaugeFactory = await ethers.getContractFactory("LiquidityGaugeFactory");
    const factory = await LiquidityGaugeFactory.deploy(v5.address);
    await factory.deployed();
    console.log("LiquidityGaugeFactory deployed to: ", factory.address);
    return factory.address;
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
}
