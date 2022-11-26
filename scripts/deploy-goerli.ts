import { parseEther } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { deployERC4626Factory } from "./utils/factories/deploy-erc4626-factory";
import { deployGovernanceToken } from "./general/deploy-governance-token";
import { deployMulticall } from "./general/deploy-multicall";
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
import { deployVault } from "./v2/vault/deploy-vault";

const VAULT = "";
const TIME_AUTH = "";
const WETH = "0xe4E96Cf369D4d604Bedc4d7962F94D53E4B5e3C6"; // Mock WBNB

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
  await ethers.provider.ready;
  const chainId = ethers.provider.network.chainId;
  // test tokens
  // await deployTestERC20("Tether USDT", "USDT", parseEther("1000000"), chainId);
  // await deployTestERC20("USD Coin", "USDC", parseEther("1000000"), chainId);
  // await deployTestERC20("Dai Coin", "DAI", parseEther("1000000"), chainId);
  // await deployTestERC20("Binance Pegged USD", "BUSD", parseEther("1000000"), chainId);
  // await deployTestERC20("Amethyst", "AMES", parseEther("1000000"), chainId);
  // await deployTestERC20("Ashare", "ASHARE", parseEther("1000000"), chainId);

  // vault
  await deployVault(WETH);
  // factories
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
