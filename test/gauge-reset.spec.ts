import * as helpers from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { BigNumber, Contract } from "ethers";
import { ethers, network } from "hardhat";
import GC from "../artifacts/contracts/liquidity-mining/GaugeController.vy/GaugeController.json";
import Mint from "../artifacts/contracts/liquidity-mining/BalancerMinter.sol/BalancerMinter.json";
import Token from "../artifacts/contracts/liquidity-mining/governance/AequinoxToken.sol/AequinoxToken.json";
import VA from "../artifacts/contracts/Vault.sol/Vault.json";
import TimeAuth from "../artifacts/contracts/authorizer/TimelockAuthorizer.sol/TimelockAuthorizer.json";
import Adapter from "../artifacts/contracts/liquidity-mining/admin/AuthorizerAdaptor.sol/AuthorizerAdaptor.json";
import VE from "../artifacts/contracts/liquidity-mining/VotingEscrow.vy/VotingEscrow.json";
import VB from "../artifacts/contracts/liquidity-mining/VotingEscrowDelegationProxy.sol/VotingEscrowDelegationProxy.json";
import BA from "../artifacts/contracts/liquidity-mining/BalancerTokenAdmin.sol/BalancerTokenAdmin.json";
import BT from "../artifacts/contracts/liquidity-mining/BalTokenHolder.sol/BALTokenHolder.json";
import FD from "../artifacts/contracts/liquidity-mining/fee-distribution/FeeDistributor.sol/FeeDistributor.json";
import SG from "../artifacts/contracts/liquidity-mining/gauges/SingleRecipientGauge.sol/SingleRecipientGauge.json";
import { expect } from "chai";
import { JsonRpcSigner } from "@ethersproject/providers";
import { defaultAbiCoder, formatEther, parseEther, parseUnits } from "ethers/lib/utils";
import moment from "moment";
import { getPreviousEpoch, toUnixTimestamp } from "./utils";
import { OPERATOR } from "./data";
import { deployLiquidityGaugeFactory } from "../scripts/utils/lp-mining/deploy-liquidity-gauge-factory";

describe("Gauge Reset Process", () => {
  let owner: JsonRpcSigner;

  let gaugeController: Contract;
  let authAdapter: Contract;
  let gaugeFactory: Contract;
  let balMinter: Contract;
  let veBoost: Contract;

  beforeEach(async () => {
    // Dev owner account
    await helpers.impersonateAccount(OPERATOR);
    owner = await ethers.provider.getSigner(OPERATOR);
    await helpers.setBalance(OPERATOR, parseEther("100"));

    gaugeController = await ethers.getContractAt(
      GC.abi,
      "0x585ECE7932226CCf5A259c367781F07EBBB1950F",
      owner
    );

    authAdapter = await ethers.getContractAt(
      Adapter.abi,
      "0x12fd0D8d8dA6A5c423CdcF7f6481353A5E13CfBc",
      owner
    );
    balMinter = await ethers.getContractAt(
      Mint.abi,
      "0x513f235C0bCCdeeecb81e2688453CAfaDf65c5e3",
      owner
    );
    veBoost = await ethers.getContractAt(
      VB.abi,
      "0x63BeeBDc3Bad6893E96A6138641BF694c42b2CB4",
      owner
    );
  });

  async function createNewFactory() {
    const { factory } = await deployLiquidityGaugeFactory(
      balMinter.address,
      veBoost.address,
      authAdapter.address
    );

    gaugeFactory = factory;
  }

  it("should set the current voting gauges type to zero", async () => {
    // add new gauge type
    // zero old typed weight
    // kill current voting gauges
    // deploy new factory
    // deploy new gauges for pools with new factory
    //
  });

  it("should add a new gauge type with proper weight", async () => {
    // Update stake gauge type weight accordingly with the new gauge types according to the contracts math
    // (Get it right this time)
    // add new gauge type
  });

  it("should kill the current voting gauges", async () => {
    // kill current voting gauges
  });

  it("should deploy a new factory", async () => {
    // Need to account for subgraph and front end with this then
    // deploy new factory
    await createNewFactory();
  });

  it("should create new gauges for core pools", async () => {
    // deploy new gauges for pools with new factory
  });

  it("should add new gauges to gauge controller", async () => {
    // Add new ones to controller
  });
});
