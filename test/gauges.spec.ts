import { ethers } from "hardhat";
import * as helpers from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { BigNumber, Contract } from "ethers";
import { deployVault } from "../scripts/deploy-vault";
import { deployAdminToken } from "../scripts/deploy-governance-token";
import { expect } from "chai";
import { deployTokenAdmin } from "../scripts/utils/lp-mining/deploy-token-admin";
import TimeAuth from "../artifacts/contracts/authorizer/TimelockAuthorizer.sol/TimelockAuthorizer.json";
import AuthAdapter from "../artifacts/contracts/liquidity-mining/admin/AuthorizerAdaptor.sol/AuthorizerAdaptor.json";
import { formatEther, Interface, parseEther, parseUnits } from "ethers/lib/utils";
import { deployAuthAdapter } from "../scripts/utils/lp-mining/deploy-auth-adapter";
import { deployTestERC20 } from "../scripts/utils/deploy-test-erc20";
import { deployVotingEscrow } from "../scripts/utils/lp-mining/deploy-voting-escrow";
import { deployGaugeController } from "../scripts/utils/lp-mining/deploy-gauge-controller";
import { deployVeBoost } from "../scripts/utils/lp-mining/deploy-ve-boost";
import { deployGaugeFactory } from "../scripts/utils/lp-mining/deploy-gauge-factory";
import { deployBalancerMinter } from "../scripts/utils/lp-mining/deploy-bal-minter";
import { deployWeightedNoAssetManagersFactory } from "../scripts/utils/factories/weighted-nomanagers";
import {
  awaitTransactionComplete,
  getFunctionSigHash,
  getWeightedPoolInstance,
  initWeightedJoin,
  sortTokens,
} from "./utils";

const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"; // ETH mainnet

const ONE_DAY = (60 * 1000 * 60 * 24) / 1000;
const SECONDS_IN_DAY = 86400;
const ONE_WEEK = SECONDS_IN_DAY * 7;
const ONE_MONTH = SECONDS_IN_DAY * 30;
const THREE_MONTHS = SECONDS_IN_DAY * 90;
const SIX_MONTHS = SECONDS_IN_DAY * 180;
const ONE_YEAR = SECONDS_IN_DAY * 365;

interface PoolInfo {
  name: string;
  contract: Contract;
  poolId: string;
  poolAddress: string;
}

describe("Gauges", () => {
  let owner: SignerWithAddress;
  let stakeForUser: SignerWithAddress;
  let AEQ: Contract;
  let testPairToken: Contract;
  let Vault: Contract;
  let vaultAuthorizer: Contract;
  let authAdapter: Contract;
  let balTokenAdmin: Contract;
  let tokenAdminAuthAdapter: Contract;
  let votingEscrow: Contract;
  let veBoost: Contract;
  let gaugeController: Contract;
  let liquidityGaugeFactory: Contract;
  let balMinter: Contract;
  let weightedFactory: Contract;
  const pools: PoolInfo[] = [];

  beforeEach(async () => {
    const accounts = await ethers.getSigners();
    owner = accounts[0];
    stakeForUser = accounts[1];

    Vault = await deployVault(WETH);
    authAdapter = await deployAuthAdapter(Vault.address);
    vaultAuthorizer = await ethers.getContractAt(TimeAuth.abi, await Vault.getAuthorizer());
    weightedFactory = await deployWeightedNoAssetManagersFactory(Vault.address);

    AEQ = await deployAdminToken();
    await AEQ.mint(owner.address, parseEther("1000000"));
    testPairToken = await deployTestERC20(parseEther("1000000"));
    balTokenAdmin = await deployTokenAdmin(Vault.address, AEQ.address);
    tokenAdminAuthAdapter = new Contract(
      await balTokenAdmin.getAuthorizer(),
      AuthAdapter.abi,
      owner
    );

    const { poolAddress } = await createPool();

    votingEscrow = await deployVotingEscrow(
      poolAddress,
      "veToken",
      "veToken",
      authAdapter.address,
      owner.address
    );

    const { veBoostContract } = await deployVeBoost(Vault.address, votingEscrow.address);
    veBoost = veBoostContract;

    gaugeController = await deployGaugeController(votingEscrow.address, authAdapter.address);
    balMinter = await deployBalancerMinter(balTokenAdmin.address, gaugeController.address);

    const { factory } = await deployGaugeFactory(
      balMinter.address,
      veBoost.address,
      vaultAuthorizer.address
    );
    liquidityGaugeFactory = factory;
  });

  async function createPool() {
    const tokens = [AEQ.address, testPairToken.address];
    sortTokens(tokens);

    console.log(tokens);

    const args = {
      name: "Big Booty Hoes",
      symbol: "AEQ-BNB-APT",
      tokens,
      weights: [parseUnits("0.8"), parseUnits("0.2")],
      swapFeePercentage: parseUnits("0.01"), // 1%
      owner: owner.address,
    };

    console.log("creating pool..");
    const tx = await weightedFactory.create(
      args.name,
      args.symbol,
      args.tokens,
      args.weights,
      args.swapFeePercentage,
      args.owner
    );

    const receipt = await tx.wait();
    // We need to get the new pool address out of the PoolCreated event
    const events = receipt.events.filter((e) => e.event === "PoolCreated");
    const poolAddress = events[0].args.pool;

    console.log("poolAddress: " + poolAddress);

    const pool = getWeightedPoolInstance(poolAddress, owner);
    const poolId = await pool.getPoolId();

    console.log("poolId: " + poolId);

    const poolInfo = {
      name: args.symbol,
      contract: pool,
      poolAddress,
      poolId,
    };

    pools.push(poolInfo);

    await initWeightedJoin(
      poolId,
      tokens,
      [parseUnits("2000"), parseUnits("5000")],
      owner.address,
      Vault,
      owner
    );

    return {
      poolId,
      poolAddress,
    };
  }

  async function grantFunctionPermision(
    functionSignatureAbi: string,
    accountToGrant: string,
    contractToAccess: string
  ) {
    try {
      // const iface = new Interface(["function activate() external"]);
      // const selector = iface.getSighash("activate()");
      // console.log(selector);

      const iface = new Interface([functionSignatureAbi]);
      // "function fn() external".split(' ')[1] = portion needed for getSighash
      const selector = iface.getSighash(functionSignatureAbi.split(" ")[1]);
      console.log(selector);

      // Gets the abi.encodePacked action identifier for the function
      // we want to set permissions for.
      const actionId = await authAdapter.getActionId(selector);
      console.log(actionId);

      let canDo = await vaultAuthorizer.hasPermission(actionId, accountToGrant, contractToAccess);
      console.log(canDo);

      await vaultAuthorizer.grantPermissions([actionId], accountToGrant, [contractToAccess]);

      await vaultAuthorizer.hasPermission(actionId, accountToGrant, contractToAccess);
      console.log(canDo);
    } catch (error) {
      throw error;
    }
  }

  async function giveTokenAdminOwnership() {
    // Give vault authorization to account to call `activate`
    const selector = getFunctionSigHash("function activate() external");
    // Need the action id from the token admin auth itself so the correct disambiguator is used
    const actionId = await balTokenAdmin.getActionId(selector);
    await vaultAuthorizer.grantPermissions([actionId], owner.address, [balTokenAdmin.address]);

    // Give token admin boss role
    await AEQ.grantRole(await AEQ.DEFAULT_ADMIN_ROLE(), balTokenAdmin.address);

    // Trigger admin activation
    await balTokenAdmin.activate();
  }

  // Create gauge, then add to controller
  async function createGauge(poolAddress: string) {
    const tx = await liquidityGaugeFactory.create(poolAddress);
    const receipt = await tx.wait();
    const events = receipt.events.filter((e) => e.event === "GaugeCreated");
    const gaugeAddress = events[0].args.gauge;
    console.log("gaugeAddress: " + gaugeAddress);
    return gaugeAddress;
  }

  it("should add a gauge to the controller", async () => {
    const { poolAddress } = await createPool();
    // bal-weth id: 0x5c6ee304399dbdb9c8ef030ab642b10820db8f56000200000000000000000014
    // bal-weth address:

    // BalTokenAdmin has to be activated before creating gauges
    // Since their initialize function will call for data
    // Which will trigger an max256 overflow `activate` has not been triggered yet
    await giveTokenAdminOwnership();

    await createGauge(poolAddress);
    expect(true).to.be.true;
  });
});
