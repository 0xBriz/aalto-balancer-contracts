import { ethers } from "hardhat";

// Needed for BalancerMinter
export async function deployVeDelegationProxy(vault: string, votingEscrow: string, auth: string) {
  try {
    // IVault vault,
    // IERC20 votingEscrow,
    // IVeDelegation delegation

    // Need PreseededVotingEscrowDelegation.vy deployed as the delegation param..I think
    //__init__(
    // _voting_escrow: address,
    // _name: String[32],
    // _symbol: String[32],
    // _base_uri: String[128],
    // _authorizer_adaptor: address,
    // _preseeded_boost_calls: CreateBoostCall[MAX_PRESEEDED_BOOSTS],
    //  _preseeded_approval_calls: SetApprovalForAllCall[MAX_PRESEEDED_APPROVALS])

    const MAX_PRESEEDED_APPROVALS = 10;
    const preseeded_boost_calls = [];
    const preseeded_approval_calls = [];
    // Fill in for now
    for (let i = 0; i < MAX_PRESEEDED_APPROVALS; i++) {
      preseeded_boost_calls.push([
        [(ethers.constants.AddressZero, ethers.constants.AddressZero, 0, 0, 0, 0)],
      ]);
      preseeded_approval_calls.push((ethers.constants.AddressZero, ethers.constants.AddressZero));
    }

    const name = "VotingEscrow Delegation";
    const symbol = "veBoost";
    const baseURI = "";

    const PreseededVotingEscrowDelegation = await ethers.getContractFactory(
      "PreseededVotingEscrowDelegation"
    );
    const delegationImpl = await PreseededVotingEscrowDelegation.deploy(
      votingEscrow,
      name,
      symbol,
      baseURI,
      auth,
      preseeded_boost_calls,
      preseeded_approval_calls
    );
    await delegationImpl.deployed();
    console.log("PreseededVotingEscrowDelegation deployed to: ", delegationImpl.address);

    const VotingEscrowDelegationProxy = await ethers.getContractFactory(
      "VotingEscrowDelegationProxy"
    );
    const proxy = await VotingEscrowDelegationProxy.deploy(
      vault,
      votingEscrow,
      delegationImpl.address
    );
    await proxy.deployed();
    console.log("VotingEscrowDelegationProxy deployed to: ", proxy.address);
    return proxy.address;
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
}
