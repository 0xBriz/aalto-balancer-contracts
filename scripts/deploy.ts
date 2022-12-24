import { parseEther } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { MAINNET_VAULT } from "../data/addresses";
import { deployERC4626Factory } from "./utils/factories/deploy-erc4626-factory";
import { deployGovernanceToken } from "./general/deploy-governance-token";
import { deployMulticall, deployMulticallV1 } from "./general/deploy-multicall";
import { deployRelayer } from "./general/deploy-relayer";
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
const SINGLE_GAUGE_FACTORY = "0xf7fE0c29A251a8A8E5Cd36A54daBD0357a98b591";
const BAL_TOKEN_HOLDER = "0x97a1b849857bF8656fb150C45d125B0a8BAa88D0";

async function main() {
  await ethers.provider.ready;
  const chainId = ethers.provider.network.chainId;
  console.log("Current block number: " + (await ethers.provider.getBlockNumber()));
  await deployMulticallV1();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
