import { ethers } from "hardhat";

export async function deployRewardOnlyGaugeFactory(balToken: string, vault: string, auth: string) {
  try {
    // __init__(minter: address, veBoostProxy: address, authorizerAdaptor: address)
    const RewardsOnlyGauge = await ethers.getContractFactory("RewardsOnlyGauge");
    const v5 = await RewardsOnlyGauge.deploy(balToken, vault, auth);
    await v5.deployed();
    console.log("RewardsOnlyGauge deployed to: ", v5.address);

    const RewardsOnlyGaugeFactory = await ethers.getContractFactory("LiquidityGaugeFactory");
    const factory = await RewardsOnlyGaugeFactory.deploy(v5.address);
    await factory.deployed();
    console.log("RewardsOnlyGaugeFactory deployed to: ", factory.address);
    return factory.address;
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
}
