import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { ethers } from "hardhat";

let admin: SignerWithAddress;

export async function getSigner(): Promise<SignerWithAddress> {
  if (admin) {
    return admin;
  }

  const accounts = await ethers.getSigners();
  admin = accounts[0];
  return admin;
}
