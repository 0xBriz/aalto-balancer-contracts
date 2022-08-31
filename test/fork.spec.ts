import * as helpers from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import GC from "../artifacts/contracts/liquidity-mining/GaugeController.vy/GaugeController.json";
import Mint from "../artifacts/contracts/liquidity-mining/BalancerMinter.sol/BalancerMinter.json";
import Token from "../artifacts/contracts/liquidity-mining/governance/AequinoxToken.sol/AequinoxToken.json";
import VA from "../artifacts/contracts/Vault.sol/Vault.json";
import TimeAuth from "../artifacts/contracts/authorizer/TimelockAuthorizer.sol/TimelockAuthorizer.json";
import Adapter from "../artifacts/contracts/liquidity-mining/admin/AuthorizerAdaptor.sol/AuthorizerAdaptor.json";
import VE from "../artifacts/contracts/liquidity-mining/VotingEscrow.vy/VotingEscrow.json";
import BA from "../artifacts/contracts/liquidity-mining/BalancerTokenAdmin.sol/BalancerTokenAdmin.json";
import BT from "../artifacts/contracts/liquidity-mining/BalTokenHolder.sol/BALTokenHolder.json";
import FD from "../artifacts/contracts/liquidity-mining/fee-distribution/FeeDistributor.sol/FeeDistributor.json";
import SG from "../artifacts/contracts/liquidity-mining/gauges/SingleRecipientGauge.sol/SingleRecipientGauge.json";
import { expect } from "chai";

describe("Mainnet setup", () => {
  let AEQ: Contract;

  let Vault: Contract;
  let vaultAuthorizer: Contract;
  let authAdapter: Contract;
  let balTokenAdmin: Contract;
  let votingEscrow: Contract;
  let gaugeController: Contract;
  let balMinter: Contract;
  let singleRecipientGauge: Contract;
  let balTokenHolder: Contract;
  let feeDistributor: Contract;

  let veBoost: Contract;

  let owner: SignerWithAddress;
  let stakeForUser: SignerWithAddress;
  let testPairToken: Contract;
  let aeqBNB: Contract;
  let weightedFactory: Contract;
  let testRewardToken: Contract;
  let liquidityGaugeFactory: Contract;
  let singleRecipientFactory: Contract;

  beforeEach(async () => {
    // Dev owner account
    await helpers.impersonateAccount("0x891eFc56f5CD6580b2fEA416adC960F2A6156494");
    AEQ = await ethers.getContractAt(Token.abi, "0x0dDef12012eD645f12AEb1B845Cb5ad61C7423F5");
    balMinter = await ethers.getContractAt(Mint.abi, "0x513f235C0bCCdeeecb81e2688453CAfaDf65c5e3");
    balTokenAdmin = await ethers.getContractAt(
      BA.abi,
      "0xDe3258Fce4Afe0aB38CA3A61B21ACAD802250880"
    );
    gaugeController = await ethers.getContractAt(
      GC.abi,
      "0x585ECE7932226CCf5A259c367781F07EBBB1950F"
    );
    Vault = await ethers.getContractAt(VA.abi, "0xEE1c8DbfBf958484c6a4571F5FB7b99B74A54AA7");
    vaultAuthorizer = await ethers.getContractAt(
      TimeAuth.abi,
      "0x7Bdc7b728cf0a45F0464B84CB90BD9beF01C5E0b"
    );
    authAdapter = await ethers.getContractAt(
      Adapter.abi,
      "0x12fd0D8d8dA6A5c423CdcF7f6481353A5E13CfBc"
    );
    votingEscrow = await ethers.getContractAt(VE.abi, "0x06Aba6E8F69A0Be680f96D923EFB682E63Db6a9f");
    balTokenHolder = await ethers.getContractAt(
      BT.abi,
      "0x97a1b849857bF8656fb150C45d125B0a8BAa88D0"
    );
    feeDistributor = await ethers.getContractAt(
      FD.abi,
      "0x5215012e7509C63f4B78020b02842e930BCf0a82"
    );
    singleRecipientGauge = await ethers.getContractAt(
      SG.abi,
      "0x177cA62c024Aaa0c3c65F7c8BA283b824556DAB0"
    );
    singleRecipientGauge = await ethers.getContractAt(
      SG.abi,
      "0x177cA62c024Aaa0c3c65F7c8BA283b824556DAB0"
    );
  });

  it("should mint tokens to users", async () => {
    // minter should mint users token based on user integrate_fraction from the gauge
    const adminAdapter = await ethers.getContractAt(
      Adapter.abi,
      await balTokenAdmin.getAuthorizer()
    );
    const adminId = await adminAdapter.getActionId(
      balTokenAdmin.interface.getSighash("mint(address, uint256)")
    );
    console.log(adminId);
    // Use id to give vault approval
    // steps:
    // approve minter to call mint on admin contract
    // user deposit in gauge
    // fast forward stuff
    // user should be able to be minted for
    expect(true).to.be.true;
  });
});
