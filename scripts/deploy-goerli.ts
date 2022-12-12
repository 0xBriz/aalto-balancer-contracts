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
import {
  deployLiquidityGaugeFactory,
  deployLiquidityGaugeFactoryNoAdmin,
} from "./utils/lp-mining/deploy-liquidity-gauge-factory";
import { deployRewardOnlyGaugeFactory } from "./utils/lp-mining/deploy-reward-gauge-factory";
import { deploySingleRecipientGaugeFactory } from "./utils/lp-mining/deploy-single-recipient-factory";
import { deployTokenAdmin } from "./utils/lp-mining/deploy-token-admin";
import { deployBalTokenHolder } from "./utils/lp-mining/deploy-token-holder";
import { deployVeBalHelper } from "./utils/lp-mining/deploy-ve-bal-helper";
import { deployVeBoost } from "./utils/lp-mining/deploy-ve-boost";
import { deployVotingEscrow } from "./utils/lp-mining/deploy-voting-escrow";
import { ONE_DAY_SECONDS, ONE_WEEK_SECONDS } from "./utils/time";
import { deployAuthEntry, deployTimelock, deployVault } from "./v2/vault/deploy-vault";

const VAULT = "0x84259CbD70aA17EB282Cb40666d2687Cd8E100AA";
const TIME_AUTH = "0xe775Ce316d91c8A40487338Bc14c745Ba52D8C7a";
const WETH = "0xe4E96Cf369D4d604Bedc4d7962F94D53E4B5e3C6"; // Mock WBNB
const ADMIN = "0x891eFc56f5CD6580b2fEA416adC960F2A6156494";

// Factories
const WEIGHT_FACTORY_NOAM = ""; // No asset managers
const WEIGHT_FACTORY_AM = "";
const LBP_FACTORY = "";
const STABLE_FACTORY = "";
const WEIGHT_TWO_TOKEN_FACTORY = ""; // different repo
const SINGLE_RECIPIENT_FACTORY = "";

// VE
const GOV_TOKEN = "0xb269A278E427478712e2AF0eBa728021157A2114";
const AUTH_ENTRY_ADAPTER = "0x4A5eC9D5C7dA0A24b9daACFf636aFc87c6a4fcE2";
const VOTING_ESCROW = "0x1f54bAceCb21586C0337694fAe77D2E518da21b7";
const VE_BOOST_IMPL = "0xAbC0Ff06D5A41E55Db7F473eb8A6167f4761B456";
const VE_BOOST_PROXY = "0x63BeeBDc3Bad6893E96A6138641BF694c42b2CB4";
const GAUGE_CONTROLLER = "0x2ee2f54e95ce6f24dAdbDfa8221a6F763E8eEB96";
const BAL_TOKEN_ADMIN = "0x9Ad2B6bc51B1bFe3E21918447f3B189324AD62bc";
const BAL_MINTER = "0x2c38100e5A697d2284Fc2b2e4E948d0215E2fCa2";
const VE_BAL_HELPER = "";
const FEE_DISTRIBUTOR = "";
const SINGLE_GAUGE_FACTORY = "";

const MAIN_BPT = "0xA5D4313D76020D51446634366666C6c1F051EfD8";

async function main() {
  await ethers.provider.ready;
  const chainId = ethers.provider.network.chainId;
  console.log("Current block number: " + (await ethers.provider.getBlockNumber()));
  // test tokens
  // await deployTestERC20("Tether USDT", "USDT", parseEther("1000000"), chainId);
  // await deployTestERC20("USD Coin", "USDC", parseEther("1000000"), chainId);
  // await deployTestERC20("Dai Coin", "DAI", parseEther("1000000"), chainId);
  // await deployTestERC20("Binance Pegged USD", "BUSD", parseEther("1000000"), chainId);
  // await deployTestERC20("Amethyst", "AMES", parseEther("1000000"), chainId);
  // await deployTestERC20("Ashare", "ASHARE", parseEther("1000000"), chainId);
  // await deployTestERC20("Wrapped Ether", "ETH", parseEther("1000000"), chainId);
  // await deployTestERC20("Wrapped Bitcoin", "WBTC", parseEther("1000000"), chainId);

  // vault
  // await deployVault(WETH);
  const adapter = "0x6dB0f5F98FB6cEA6c1A90232194D153c94E9C58b";
  const authEntry = "0x4A5eC9D5C7dA0A24b9daACFf636aFc87c6a4fcE2";
  const timelockAuth = "0xe775Ce316d91c8A40487338Bc14c745Ba52D8C7a";
  //await deployAuthAdapter(VAULT);
  // await deployAuthEntry(adapter);
  // await deployTimelock(ADMIN, authEntry);

  // factories
  // await deployWeightedFactory(VAULT);

  // token setup/liquidity mining
  // await deployGovernanceToken("Vertek", "VRTK");
  // await deployTokenAdmin(VAULT, GOV_TOKEN, parseEther("2000000"));

  // await deployVotingEscrow(MAIN_BPT, "Voting Escrow", "veVRTK", AUTH_ENTRY_ADAPTER);
  // await deployGaugeController(VOTING_ESCROW, AUTH_ENTRY_ADAPTER, ADMIN);
  // await deployVeBoost(VAULT, VOTING_ESCROW);
  // await deployBalancerMinter(BAL_TOKEN_ADMIN, GAUGE_CONTROLLER);
  // await deployLiquidityGaugeFactoryNoAdmin(BAL_MINTER, VE_BOOST_PROXY, AUTH_ENTRY_ADAPTER);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
