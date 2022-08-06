import { ethers } from "hardhat";

export async function deployGaugeController(votingEscrow: string, authAdapter: string) {
  try {
    //__init__(_voting_escrow: address, _authorizer_adaptor: address):
    const GaugeController = await ethers.getContractFactory("GaugeController");
    const gc = await GaugeController.deploy(votingEscrow, authAdapter);
    await gc.deployed();
    console.log("GaugeController deployed to: ", gc.address);
    return gc;
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
}
