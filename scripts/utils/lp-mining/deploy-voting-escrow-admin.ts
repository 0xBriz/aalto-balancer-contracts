import { ethers } from "hardhat";

export async function deployVotingEscrowAdmin(
  tokenAddress: string,
  veTokenName: string,
  veTokenSymbol: string,
  authAdapter: string,
  stakingAdmin: string
) {
  try {
    const VotingEscrow = await ethers.getContractFactory("VotingEscrowAdmin");
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
