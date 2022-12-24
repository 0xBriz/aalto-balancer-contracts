import { ethers } from "hardhat";

export async function deployMulticall() {
  try {
    const Multicall2 = await ethers.getContractFactory("Multicall2");
    const multi = await Multicall2.deploy();
    await multi.deployed();
    console.log("Multicall2 deployed to: ", multi.address);
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
}

export async function deployMulticallV1() {
  try {
    const Multicall2 = await ethers.getContractFactory("Multicall");
    const multi = await Multicall2.deploy();
    await multi.deployed();
    console.log("Multicall V1 deployed to: ", multi.address);
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
}
