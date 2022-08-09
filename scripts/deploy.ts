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

const VAULT = "0xA05cE8E8a34E10B676711e2CAc8BD656E96F310F";
const WETH = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c"; // WBNB
const AEQ = "";

async function main() {
  //  await deployVault(WETH);
  // ======================= FACTORIES ========================//
  // await deployWeightedFactory(VAULT);
  // await deployWeightedNoAssetManagersFactory(VAULT);
  // await deployStablePoolFactory(VAULT);
  // await deployBootstrapPoolFactory(VAULT);
  // ======================= STAND ALONES ========================//
  // await deployGovernanceToken();
  // await deployMulticall();
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
