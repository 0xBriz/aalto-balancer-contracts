import { ethers } from "hardhat";

export async function deploySingleRecipientGaugeFactory(minter: string) {
  try {
    const SingleRecipientGaugeFactory = await ethers.getContractFactory(
      "SingleRecipientGaugeFactory"
    );
    const factory = await SingleRecipientGaugeFactory.deploy(minter);
    await factory.deployed();
    console.log("SingleRecipientGaugeFactory deployed to: ", factory.address);
    return factory;
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
}
