import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";

describe("Name of the group", () => {
  let owner: SignerWithAddress;

  beforeEach(async () => {
    const accounts = await ethers.getSigners();
    owner = accounts[0];
  });
});
