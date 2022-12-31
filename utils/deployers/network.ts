import { ethers } from "hardhat";

let chainId: number;

export async function getChainId() {
  if (chainId) return chainId;
  await ethers.provider.ready;
  chainId = ethers.provider.network.chainId;
  return chainId;
}
