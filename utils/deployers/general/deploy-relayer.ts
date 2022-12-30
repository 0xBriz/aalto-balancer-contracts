import { ethers } from "hardhat";

export async function deployRelayer(vault: string) {
  // Will deploy a BalancerRelayer for itself during construction
  const BaseRelayerLibrary = await ethers.getContractFactory("BaseRelayerLibrary");
  const relayer = await BaseRelayerLibrary.deploy(vault);
  await relayer.deployed();
  console.log("BaseRelayerLibrary: ", relayer.address);
  console.log("BalancerRelayer at: ", await relayer.getEntrypoint());
  return relayer;
}
