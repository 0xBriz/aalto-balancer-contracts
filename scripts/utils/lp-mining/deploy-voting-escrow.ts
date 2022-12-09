import { ethers } from "hardhat";

export async function deployVotingEscrow(
  tokenAddress: string,
  veTokenName: string,
  veTokenSymbol: string,
  authAdapter: string
) {
  try {
    const VotingEscrow = await ethers.getContractFactory("VotingEscrow");
    const ve = await VotingEscrow.deploy(tokenAddress, veTokenName, veTokenSymbol, authAdapter);
    await ve.deployed();
    console.log("VotingEscrow deployed to: ", ve.address);
    return ve;
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
}
