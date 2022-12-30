import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";

export async function getSigners(): Promise<SignerWithAddress[]> {
  const { ethers } = await import("hardhat");
  return ethers.getSigners();
}

export async function getSigner(index = 0): Promise<SignerWithAddress> {
  return (await getSigners())[index];
}
