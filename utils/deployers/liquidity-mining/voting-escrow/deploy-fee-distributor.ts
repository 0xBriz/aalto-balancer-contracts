import { ethers } from "hardhat";

export async function deployFeeDistributor(votingEscrow: string, startTime: number) {
  try {
    const FeeDistributor = await ethers.getContractFactory("FeeDistributor");
    const fees = await FeeDistributor.deploy(votingEscrow, startTime);
    await fees.deployed();
    console.log("FeeDistributor deployed to: ", fees.address);
    return fees;
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
}
