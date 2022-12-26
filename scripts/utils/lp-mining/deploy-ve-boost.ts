import { ethers } from "hardhat";

export async function deployVeBoost(vault: string, votingEscrow: string) {
  try {
    const BoostV2 = await ethers.getContractFactory("BoostV2");
    // __init__(_boost_v1: address, _ve: address):
    // No V1(VotingEscrowDelegation) implemention, we are starting from V2
    const veBoostImpl = await BoostV2.deploy(ethers.constants.AddressZero, votingEscrow);
    await veBoostImpl.deployed();
    console.log("BoostV2 deployed to: ", veBoostImpl.address);

    const VotingEscrowDelegationProxy = await ethers.getContractFactory(
      "VotingEscrowDelegationProxy"
    );
    const veBoostProxy = await VotingEscrowDelegationProxy.deploy(
      vault,
      votingEscrow,
      veBoostImpl.address
    );
    await veBoostProxy.deployed();
    console.log("VotingEscrowDelegationProxy deployed to: ", veBoostProxy.address);

    return {
      veBoostContract: veBoostImpl,
      veBoostProxy,
    };
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
}
