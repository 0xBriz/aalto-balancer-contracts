import { ethers } from "hardhat";

export async function deployVeBoost(vault: string, votingEscrow: string) {
  try {
    const BoostV2 = await ethers.getContractFactory("BoostV2");
    // __init__(_boost_v1: address, _ve: address):
    // No V1(VotingEscrowDelegation) implemention, we are starting from V2
    const veBoostContract = await BoostV2.deploy(ethers.constants.AddressZero, votingEscrow);
    await veBoostContract.deployed();
    console.log("BoostV2 deployed to: ", veBoostContract.address);

    const VotingEscrowDelegationProxy = await ethers.getContractFactory(
      "VotingEscrowDelegationProxy"
    );
    const veBoostProxy = await VotingEscrowDelegationProxy.deploy(
      vault,
      votingEscrow,
      veBoostContract.address
    );
    await veBoostProxy.deployed();
    console.log("VotingEscrowDelegationProxy deployed to: ", veBoostProxy.address);

    return {
      veBoostContract,
      veBoostProxy,
    };
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
}
