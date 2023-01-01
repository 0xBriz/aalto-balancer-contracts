import { ethers } from "hardhat";

let chainId: number;

export async function getChainId() {
  if (chainId) return chainId;
  await ethers.provider.ready;
  chainId = ethers.provider.network.chainId;
  return chainId;
}

export async function getCurrentBlock() {
  return await ethers.provider.getBlock(await ethers.provider.getBlockNumber());
}

export async function getCurrentBlockTimestamp() {
  return (await getCurrentBlock()).timestamp;
}
