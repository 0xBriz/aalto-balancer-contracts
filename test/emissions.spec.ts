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
import { defaultAbiCoder, formatEther, Interface, parseEther, parseUnits } from "ethers/lib/utils";
import { deployAuthAdapter } from "../scripts/utils/lp-mining/deploy-auth-adapter";
import { deployTestERC20 } from "../scripts/utils/deploy-test-erc20";
import { deployVotingEscrow } from "../scripts/utils/lp-mining/deploy-voting-escrow";
import { deployGaugeController } from "../scripts/utils/lp-mining/deploy-gauge-controller";
import { deployVeBoost } from "../scripts/utils/lp-mining/deploy-ve-boost";
import { deployBalancerMinter } from "../scripts/utils/lp-mining/deploy-bal-minter";
import { deployWeightedNoAssetManagersFactory } from "../scripts/utils/factories/weighted-nomanagers";
import {
  awaitTransactionComplete,
  getFunctionSigHash,
  getLiquidityGauge,
  getWeightedPoolInstance,
  initWeightedJoin,
  sortTokens,
} from "./utils";
import GC from "../artifacts/contracts/liquidity-mining/GaugeController.vy/GaugeController.json";
import { deployLiquidityGaugeFactory } from "../scripts/utils/lp-mining/deploy-liquidity-gauge-factory";

const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"; // ETH mainnet

const ONE_DAY = (60 * 1000 * 60 * 24) / 1000;
const SECONDS_IN_DAY = 86400;
const ONE_WEEK = SECONDS_IN_DAY * 7;
const ONE_MONTH = SECONDS_IN_DAY * 30;
const THREE_MONTHS = SECONDS_IN_DAY * 90;
const SIX_MONTHS = SECONDS_IN_DAY * 180;
const ONE_YEAR = SECONDS_IN_DAY * 365;

enum GaugeType {
  LiquidityMiningCommittee,
  veBAL,
  Ethereum,
}

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
  let testRewardToken: Contract;

  const pools: PoolInfo[] = [];

  beforeEach(async () => {
    const accounts = await ethers.getSigners();
    owner = accounts[0];
    stakeForUser = accounts[1];

    Vault = await deployVault(WETH);
    authAdapter = await deployAuthAdapter(Vault.address);
    vaultAuthorizer = await ethers.getContractAt(TimeAuth.abi, await Vault.getAuthorizer(), owner);
    // weightedFactory = await deployWeightedNoAssetManagersFactory(Vault.address);

    AEQ = await deployAdminToken();
    // Mint before handing ownership to token admin
    await AEQ.mint(owner.address, parseEther("1000000"));
    balTokenAdmin = await deployTokenAdmin(Vault.address, AEQ.address);

    // testPairToken = await deployTestERC20(parseEther("1000000"));
    // tokenAdminAuthAdapter = new Contract(
    //   await balTokenAdmin.getAuthorizer(),
    //   AuthAdapter.abi,
    //   owner
    // );

    // const { poolAddress } = await createPool();

    // votingEscrow = await deployVotingEscrow(
    //   poolAddress,
    //   "veToken",
    //   "veToken",
    //   authAdapter.address,
    //   owner.address
    // );

    // const { veBoostContract } = await deployVeBoost(Vault.address, votingEscrow.address);
    // veBoost = veBoostContract;

    // gaugeController = await deployGaugeController(
    //   votingEscrow.address,
    //   authAdapter.address,
    //   owner.address
    // );
    // balMinter = await deployBalancerMinter(balTokenAdmin.address, gaugeController.address);

    // const { factory } = await deployLiquidityGaugeFactory(
    //   balMinter.address,
    //   veBoost.address,
    //   vaultAuthorizer.address,
    //   owner.address
    // );
    // liquidityGaugeFactory = factory;
  });

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
});
