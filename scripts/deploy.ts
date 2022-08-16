import { ethers } from "hardhat";
import { MAINNET_VAULT } from "./addresses";
import { deployGovernanceToken } from "./deploy-governance-token";
import { deployMulticall } from "./deploy-multicall";
import { deployRelayer } from "./deploy-relayer";
import { deployVault } from "./deploy-vault";
import { deployBootstrapPoolFactory } from "./utils/factories/lbp-factory";
import { deployStablePoolFactory } from "./utils/factories/stable-factory";
import { deployWeightedFactory } from "./utils/factories/weighted-factory";
import { deployWeightedNoAssetManagersFactory } from "./utils/factories/weighted-nomanagers";
import { deployAuthAdapter } from "./utils/lp-mining/deploy-auth-adapter";
import { deployBalancerMinter } from "./utils/lp-mining/deploy-bal-minter";
import { deployGaugeController } from "./utils/lp-mining/deploy-gauge-controller";
import { deployLiquidityGaugeFactory } from "./utils/lp-mining/deploy-liquidity-gauge-factory";
import { deployTokenAdmin } from "./utils/lp-mining/deploy-token-admin";
import { deployVeBalHelper } from "./utils/lp-mining/deploy-ve-bal-helper";
import { deployVeBoost } from "./utils/lp-mining/deploy-ve-boost";
import { deployVotingEscrow } from "./utils/lp-mining/deploy-voting-escrow";

// MAINNET
const WETH = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c"; // WBNB

const VAULT = "0xEE1c8DbfBf958484c6a4571F5FB7b99B74A54AA7";
const AEQ = "0x0dDef12012eD645f12AEb1B845Cb5ad61C7423F5";

const AUTH_ADAPTER = "0x12fd0D8d8dA6A5c423CdcF7f6481353A5E13CfBc";
const TOKEN_ADMIN = "0xDe3258Fce4Afe0aB38CA3A61B21ACAD802250880";
const STAKING_ADMIN = "0x891eFc56f5CD6580b2fEA416adC960F2A6156494";

const AEQ_BNB_BPT = "0x7a09ddF458FdA6e324A97D1a8E4304856fb3e702";
const VOTING_ESCROW = "0x06Aba6E8F69A0Be680f96D923EFB682E63Db6a9f";
const VE_BOOST_PROXY = "0x63BeeBDc3Bad6893E96A6138641BF694c42b2CB4";
const GAUGE_CONTROLLER = "0x585ECE7932226CCf5A259c367781F07EBBB1950F";
const BAL_MINTER = "0x513f235C0bCCdeeecb81e2688453CAfaDf65c5e3";

async function main() {
  // await deployMulticall();
  // await deployVault(WETH);
  // await deployWeightedFactory(VAULT);
  // await deployWeightedNoAssetManagersFactory(VAULT);
  // await deployStablePoolFactory(VAULT);
  // await deployBootstrapPoolFactory(VAULT);
  // await deployTokenAdmin(VAULT, AEQ);
  // await deployAuthAdapter(VAULT);
  // await deployVotingEscrow(AEQ_BNB_BPT, "veAEQ", "veAEQ", AUTH_ADAPTER, STAKING_ADMIN);
  // await deployVeBoost(VAULT, VOTING_ESCROW);
  // await deployGaugeController(VOTING_ESCROW, AUTH_ADAPTER, STAKING_ADMIN);
  // await deployBalancerMinter(TOKEN_ADMIN, GAUGE_CONTROLLER);
  //
  //
  await deployLiquidityGaugeFactory(BAL_MINTER, VE_BOOST_PROXY, AUTH_ADAPTER, STAKING_ADMIN);
  // await deployVeBalHelper(GAUGE_CONTROLLER);
  // await deployRelayer(VAULT);
}

async function deployVE() {
  try {
    // Need the main pair pool already created
    // const auth = await deployAuthAdapter(VAULT);
    // await deployVotingEscrow(AEQ_BNB_BPT, "veAEQ", "veAEQ", auth.address, STAKING_ADMIN);
    // await deployVeBalHelper(GAUGE_CONTROLLER); // TODO: Will probably need this for front end
    // await deployGaugeFactory(BAL_MINTER, "", AUTH_ADAPTER);
    // await deployVeBoost(VAULT_ADDY, VOTING_ESCROW);
    // await deployLiquidityGaugeFactory(BAL_MINTER, VE_BOOST_PROXY, AUTH_ADAPTER, STAKING_ADMIN);
    // await deployGaugeController(VOTING_ESCROW, AUTH_ADAPTER);
    //
    // BAL: "We assume that `votingEscrow` has been deployed in a week previous to this one."
    // So we need ve setup and running for some time yet to have a supply (or create it manually for testing purposes)
    // const block = await ethers.provider.getBlock(await ethers.provider.getBlockNumber());
    // await deployFeeDistributor(
    //   VOTING_ESCROW,
    //   block.timestamp
    // );
    //
  } catch (error) {
    throw error;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
