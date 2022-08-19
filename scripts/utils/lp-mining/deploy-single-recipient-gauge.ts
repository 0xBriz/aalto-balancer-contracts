import { ethers } from "hardhat";
import factABI from "../../../artifacts/contracts/liquidity-mining/gauges/SingleRecipientGaugeFactory.sol/SingleRecipientGaugeFactory.json";

export async function deploySingleRecipientGauge(factoryAddress: string, tokenHolder: string) {
  try {
    const factory = await ethers.getContractAt(factABI.abi, factoryAddress);
    const tx = await factory.create(tokenHolder);
    const receipt = await tx.wait();
    const events = receipt.events.filter((e) => e.event === "SingleRecipientGaugeCreated");
    const gaugeAddress = events[0].args.gauge;
    console.log("SingleRecipientGauge deployed to: " + gaugeAddress);
    return gaugeAddress;
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
}
