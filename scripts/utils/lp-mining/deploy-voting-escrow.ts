import { ethers } from "hardhat";

export async function deployVotingEscrow(
  tokenAddress: string,
  veTokenName: string,
  veTokenSymbol: string,
  authAdapter: string,
  stakingAdmin: string
) {
  try {
    //  __init__(token_addr: address, _name: String[64], _symbol: String[32], _authorizer_adaptor: address):
    const VotingEscrow = await ethers.getContractFactory("VotingEscrow");
    const ve = await VotingEscrow.deploy(
      tokenAddress,
      veTokenName,
      veTokenSymbol,
      authAdapter,
      stakingAdmin
    );
    await ve.deployed();
    console.log("VotingEscrow deployed to: ", ve.address);
    return ve;
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
}
