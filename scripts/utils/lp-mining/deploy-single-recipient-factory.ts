import { ethers } from "hardhat";

export async function deploySingleRecipientGaugeFactory(tokenAdmin: string) {
  try {
    const SingleRecipientGaugeFactory = await ethers.getContractFactory(
      "SingleRecipientGaugeFactory"
    );
    const factory = await SingleRecipientGaugeFactory.deploy(tokenAdmin);
    await factory.deployed();
    console.log("SingleRecipientGaugeFactory deployed to: ", factory.address);
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
}
