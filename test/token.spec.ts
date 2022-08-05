import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { Contract } from "ethers";
import { deployVault } from "../scripts/deploy-vault";
import { deployAdminToken } from "../scripts/deploy-governance-token";
import { expect } from "chai";
import { deployBalTokenAdmin } from "../scripts/lp-mining/deploy-token-admin";

describe("Token Admin", () => {
  let owner: SignerWithAddress;
  let AEQ: Contract;
  let Vault: Contract;
  let BalTokenAdmin: Contract;

  beforeEach(async () => {
    const accounts = await ethers.getSigners();
    owner = accounts[0];

    AEQ = await deployAdminToken();
    Vault = await deployVault();
    BalTokenAdmin = await deployBalTokenAdmin(Vault.address, AEQ.address);
  });

  it("should start", () => {
    expect(true).to.be.true;
  });
});
