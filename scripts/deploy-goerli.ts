import { parseEther } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { deployAdminToken } from "./deploy-governance-token";
import { deployVault } from "./deploy-vault";
import { setupGovernance } from "./setup-governance";
import { deployBootstrapPoolFactory } from "./utils/factories/lbp-factory";
import { deployStablePoolFactory } from "./utils/factories/stable-factory";
import { deployWeightedFactory } from "./utils/factories/weighted-factory";
import { deployWeightedNoAssetManagersFactory } from "./utils/factories/weighted-nomanagers";
import { deployAuthAdapter } from "./utils/lp-mining/deploy-auth-adapter";
import { deployBalancerMinter } from "./utils/lp-mining/deploy-bal-minter";
import { deployFeeDistributor } from "./utils/lp-mining/deploy-fee-distributor";
import { deployGaugeController } from "./utils/lp-mining/deploy-gauge-controller";
import { deployLiquidityGaugeFactory } from "./utils/lp-mining/deploy-liquidity-gauge-factory";
import { deployRewardOnlyGaugeFactory } from "./utils/lp-mining/deploy-reward-gauge-factory";
import { deployTokenAdmin } from "./utils/lp-mining/deploy-token-admin";
import { deployVeBalHelper } from "./utils/lp-mining/deploy-ve-bal-helper";
import { deployVeBoost } from "./utils/lp-mining/deploy-ve-boost";
import { deployVotingEscrow } from "./utils/lp-mining/deploy-voting-escrow";

const VAULT = "0x1795Dd984eA50ca5Dc251A1fC38191ae76E8Acd6";
const TIME_AUTH = "0x14A28D77799d1552f3be3fE9B324f20A873322C1";
const WETH = "0xeFA07706B07934157c0dA4c6e91ac251bd36095a"; // Mock WBNB

// Factories
const WEIGHT_FACTORY_NOAM = "0x6274D2e48A2a825E99Dd1A817BE812Bb7Eec4992"; // No asset managers
const WEIGHT_FACTORY_AM = "0x19187D93eE0b65F2B1Bb24fcFa56Fc14C63e9c1b";
const LBP_FACTORY = "0xA8Ad983e0E909B486E7895ca555A877cd21E0b25";
const STABLE_FACTORY = "0x9570018E227f6c0A8bDAbF4025F9D595f0C6Ad15";
const WEIGHT_TWO_TOKEN_FACTORY = "0x37137Df03c5b9D05665Bfdf45c23d961ee70706C"; // different repo

// VE
const AEQ_TOKEN = "0x875cf904E113470F039c5C5f1B85DD17837AD254";
const AUTH_ADAPTER = "0xb18ADcf27927F61C612A3A13e6BacAAdE4E18491";
const VOTING_ESCROW = "0xC6b5055c6C46D202d186aCcb2C08AAfD08Cf2C99";
const VE_BOOST_PROXY = "";
const GAUGE_CONTROLLER = "";
const BAL_TOKEN_ADMIN = "";
const BAL_MINTER = "";
const VE_BAL_HELPER = "";

const AEQ_BNB_BPT = "0x3a103f8614a9616af0706a729949fec8a81df05b";
const STAKING_ADMIN = "0x570108E54d11348BD3734FF73dc55eC52c28d3EF";

async function main() {
  // await deployCoreContracts()
  //
  // await deployFactories();
  //
  await deployVE();
  //
  // await deployTokenAdmin(VAULT, AEQ_TOKEN);
  // await deployBalancerMinter(BAL_TOKEN_ADMIN, GAUGE_CONTROLLER);
  // await deployRewardOnlyGaugeFactory()
  // TODO: Need to then run auth process and active the token admin (once initial mints are complete)
  // await setupGovernance(BAL_TOKEN_ADMIN, AUTH_ADAPTER, AEQ_TOKEN);
}

async function deployCoreContracts() {
  try {
    // const AEQ = await deployAdminToken();
    // await AEQ.mint(STAKING_ADMIN, parseEther("1000000"));
    // await deployVault(WETH);
  } catch (error) {
    throw error;
  }
}

async function deployFactories() {
  try {
    // await deployWeightedFactory(VAULT);
    // await deployWeightedNoAssetManagersFactory(VAULT);
    // await deployStablePoolFactory(VAULT);
    // await deployBootstrapPoolFactory(VAULT);
  } catch (error) {
    throw error;
  }
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
