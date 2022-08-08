import { ethers } from "hardhat";

export async function deployVeBalHelper(gaugeController: string) {
  try {
    // "veBALHelpers" ref on BAL's front end
    const GaugeControllerQuerier = await ethers.getContractFactory("GaugeControllerQuerier");
    const helper = await GaugeControllerQuerier.deploy(gaugeController);
    await helper.deployed();
    console.log("GaugeControllerQuerier deployed to: ", helper.address);
    return helper.address;
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
}
