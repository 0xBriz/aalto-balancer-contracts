import { parseEther } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { MAINNET_VAULT } from "./addresses";
import { deployGovernanceToken } from "./deploy-governance-token";
import { deployMulticall } from "./deploy-multicall";
import { deployRelayer } from "./deploy-relayer";
import { deployVault } from "./deploy-vault";
import { deployTestERC20 } from "./utils/deploy-test-erc20";
import { deployBootstrapPoolFactory } from "./utils/factories/lbp-factory";
import { deployStablePoolFactory } from "./utils/factories/stable-factory";
import { deployWeightedFactory } from "./utils/factories/weighted-factory";
import { deployWeightedNoAssetManagersFactory } from "./utils/factories/weighted-nomanagers";
import { deployAuthAdapter } from "./utils/lp-mining/deploy-auth-adapter";
import { deployBalancerMinter } from "./utils/lp-mining/deploy-bal-minter";
import { deployFeeDistributor } from "./utils/lp-mining/deploy-fee-distributor";
import { deployGaugeController } from "./utils/lp-mining/deploy-gauge-controller";
import { deployLiquidityGaugeFactory } from "./utils/lp-mining/deploy-liquidity-gauge-factory";
import { deploySingleRecipientGaugeFactory } from "./utils/lp-mining/deploy-single-recipient-factory";
import { deploySingleRecipientGauge } from "./utils/lp-mining/deploy-single-recipient-gauge";
import { deployTokenAdmin } from "./utils/lp-mining/deploy-token-admin";
import { deployBalTokenHolder } from "./utils/lp-mining/deploy-token-holder";
import { deployVeBalHelper } from "./utils/lp-mining/deploy-ve-bal-helper";
import { deployVeBoost } from "./utils/lp-mining/deploy-ve-boost";
import { deployVotingEscrow } from "./utils/lp-mining/deploy-voting-escrow";
import { ONE_WEEK_SECONDS } from "./utils/time";

const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";

const VAULT = "0x0a17FabeA4633ce714F1Fa4a2dcA62C3bAc4758d";
const TIME_AUTH = "0x5e6CB7E728E1C320855587E1D9C6F7972ebdD6D5";

const WEIGHTED_FACTORY = "0x79E8AB29Ff79805025c9462a2f2F12e9A496f81d";
const WEIGHTED_NOAM = "0x0Dd99d9f56A14E9D53b2DdC62D9f0bAbe806647A";
const STABLE_FACTORY = "0xeAd789bd8Ce8b9E94F5D0FCa99F8787c7e758817";
const LBP_FACTORY = "0x95775fD3Afb1F4072794CA4ddA27F2444BCf8Ac3";

const AEQ = "0xd9fEc8238711935D6c8d79Bef2B9546ef23FC046";

const AUTH_ADAPTER = "0x512F7469BcC83089497506b5df64c6E246B39925";
const TOKEN_ADMIN = "0xd3FFD73C53F139cEBB80b6A524bE280955b3f4db";
const STAKING_ADMIN = "0x891eFc56f5CD6580b2fEA416adC960F2A6156494";

const AEQ_BNB_BPT = "";
const VOTING_ESCROW = "";
const VE_BOOST_PROXY = "";
const GAUGE_CONTROLLER = "";
const BAL_MINTER = "";
const SINGLE_GAUGE_FACTORY = "";
const BAL_TOKEN_HOLDER = "";

async function main() {
  // await deployGovernanceToken();

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
  // await deployLiquidityGaugeFactory(BAL_MINTER, VE_BOOST_PROXY, AUTH_ADAPTER, STAKING_ADMIN);
  // await deployVeBalHelper(GAUGE_CONTROLLER);
  // await deployRelayer(VAULT);
  // await deploySingleRecipientGaugeFactory(BAL_MINTER);
  // const block = await ethers.provider.getBlock(await ethers.provider.getBlockNumber());
  // await deployFeeDistributor(VOTING_ESCROW, block.timestamp);
  // await deployBalTokenHolder(AEQ, VAULT, "AEQ Token holder");
  // await deploySingleRecipientGauge(SINGLE_GAUGE_FACTORY, BAL_TOKEN_HOLDER);
  // await deployMulticall();

  await deployTestERC20("USDC", "USDC", parseEther("1000000"));
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
