import { ethers } from "hardhat";

export async function deployVeBoost(vault: string, votingEscrow: string) {
  try {
    const BoostV2 = await ethers.getContractFactory("BoostV2");
    // __init__(_boost_v1: address, _ve: address):
    // No V1(VotingEscrowDelegation) implemention, we are starting from V2
    const veBoost = await BoostV2.deploy(ethers.constants.AddressZero, votingEscrow);
    await veBoost.deployed();
    console.log("BoostV2 deployed to: ", veBoost.address);

    const VotingEscrowDelegationProxy = await ethers.getContractFactory(
      "VotingEscrowDelegationProxy"
    );
    const proxy = await VotingEscrowDelegationProxy.deploy(vault, votingEscrow, veBoost.address);
    await proxy.deployed();
    console.log("VotingEscrowDelegationProxy deployed to: ", proxy.address);
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
}
