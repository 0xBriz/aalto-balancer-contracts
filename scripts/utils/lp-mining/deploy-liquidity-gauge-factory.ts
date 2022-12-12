import { ethers } from "hardhat";

export async function deployLiquidityGaugeFactory(
  minter: string,
  veBoostProxy: string,
  authEntryAdapter: string,
  admin: string
) {
  try {
    // __init__(minter: address, veBoostProxy: address, authorizerAdaptor: address)
    const LiquidityGaugeV5 = await ethers.getContractFactory("LiquidityGaugeV5Admin");
    const gaugeContract = await LiquidityGaugeV5.deploy(
      minter,
      veBoostProxy,
      authEntryAdapter,
      admin
    );
    await gaugeContract.deployed();
    console.log("LiquidityGaugeV5 deployed to: ", gaugeContract.address);

    const LiquidityGaugeFactory = await ethers.getContractFactory("LiquidityGaugeFactory");
    const factory = await LiquidityGaugeFactory.deploy(gaugeContract.address);
    await factory.deployed();
    console.log("LiquidityGaugeFactory deployed to: ", factory.address);
    return {
      factory,
      gaugeContract,
    };
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
}

export async function deployLiquidityGaugeFactoryNoAdmin(
  minter: string,
  veBoostProxy: string,
  authEntryAdapter: string
) {
  try {
    // __init__(minter: address, veBoostProxy: address, authorizerAdaptor: address)
    const LiquidityGaugeV5 = await ethers.getContractFactory("LiquidityGaugeV5");
    const gaugeContract = await LiquidityGaugeV5.deploy(minter, veBoostProxy, authEntryAdapter);
    await gaugeContract.deployed();
    console.log("LiquidityGaugeV5 template deployed to: ", gaugeContract.address);

    const LiquidityGaugeFactory = await ethers.getContractFactory("LiquidityGaugeFactory");
    const factory = await LiquidityGaugeFactory.deploy(gaugeContract.address);
    await factory.deployed();
    console.log("LiquidityGaugeFactory deployed to: ", factory.address);
    return {
      factory,
      gaugeContract,
    };
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
}
