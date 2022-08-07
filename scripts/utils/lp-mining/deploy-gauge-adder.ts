import { ethers } from "hardhat";

export async function deployGaugeAdder(gaugeController: string) {
  try {
    const GaugeAdder = await ethers.getContractFactory("GaugeAdder");
    const contract = await GaugeAdder.deploy(gaugeController);
    await contract.deployed();
    console.log("GaugeAdder deployed to: ", contract.address);
    return contract;
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
}
