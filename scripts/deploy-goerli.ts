import { parseEther } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { deployERC4626Factory } from "./utils/factories/deploy-erc4626-factory";
import { deployGovernanceToken } from "./general/deploy-governance-token";
import { deployMulticall } from "./general/deploy-multicall";
import { deployVault } from "./deploy-vault";
import { setupGovernance } from "./setup-governance";
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
import { deployRewardOnlyGaugeFactory } from "./utils/lp-mining/deploy-reward-gauge-factory";
import { deploySingleRecipientGaugeFactory } from "./utils/lp-mining/deploy-single-recipient-factory";
import { deployTokenAdmin } from "./utils/lp-mining/deploy-token-admin";
import { deployBalTokenHolder } from "./utils/lp-mining/deploy-token-holder";
import { deployVeBalHelper } from "./utils/lp-mining/deploy-ve-bal-helper";
import { deployVeBoost } from "./utils/lp-mining/deploy-ve-boost";
import { deployVotingEscrow } from "./utils/lp-mining/deploy-voting-escrow";
import { ONE_DAY_SECONDS, ONE_WEEK_SECONDS } from "./utils/time";

const VAULT = "";
const TIME_AUTH = "";
const WETH = ""; // Mock WBNB

// Factories
const WEIGHT_FACTORY_NOAM = ""; // No asset managers
const WEIGHT_FACTORY_AM = "";
const LBP_FACTORY = "";
const STABLE_FACTORY = "";
const WEIGHT_TWO_TOKEN_FACTORY = ""; // different repo
const SINGLE_RECIPIENT_FACTORY = "";

// VE
const AEQ_TOKEN = "";
const AUTH_ADAPTER = "";
const VOTING_ESCROW = "";
const VE_BOOST_PROXY = "";
const CURRENT_BOOST_CONTRACT = "";
const GAUGE_CONTROLLER = "";
const BAL_TOKEN_ADMIN = "";
const BAL_MINTER = "";
const VE_BAL_HELPER = "";
const FEE_DISTRIBUTOR = "";
const SINGLE_GAUGE_FACTORY = "";

const AEQ_BNB_BPT = "";
const STAKING_ADMIN = "";

async function main() {
  await deployTestERC20("Wrapped BNB", "wBNB", parseEther("1000000"));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
