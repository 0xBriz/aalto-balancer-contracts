import { ethers } from "hardhat";

export async function getChainId() {
  await ethers.provider.ready;
  return ethers.provider.network.chainId;
}
