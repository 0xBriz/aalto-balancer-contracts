import { parseEther } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { deployAdminToken } from "../deploy-governance-token";
import { setupGovernance } from "../setup-governance";
import { deployAuthAdapter } from "../utils/lp-mining/deploy-auth-adapter";
import { deployBalancerMinter } from "../utils/lp-mining/deploy-bal-minter";
import { deployFeeDistributor } from "../utils/lp-mining/deploy-fee-distributor";
import { deployGaugeController } from "../utils/lp-mining/deploy-gauge-controller";
import { deployGaugeFactory } from "../utils/lp-mining/deploy-gauge-factory";
import { deployLiquidityGaugeFactory } from "../utils/lp-mining/deploy-liquidity-gauge-factory";
import { deployRewardOnlyGaugeFactory } from "../utils/lp-mining/deploy-reward-gauge-factory";
import { deployTokenAdmin } from "../utils/lp-mining/deploy-token-admin";
import { deployVeBalHelper } from "../utils/lp-mining/deploy-ve-bal-helper";
import { deployVeBoost } from "../utils/lp-mining/deploy-ve-boost";
import { deployVotingEscrow } from "../utils/lp-mining/deploy-voting-escrow";

const VAULT_ADDY = "0x0Cc23b51B3A89728c85a63c819E8283e353FC86c";

// VE
const AEQ_TOKEN_V2 = "0x226E1F30b19D61EFeb1B211a7fB32d41683B0734";
const AUTH_ADAPTER = "0xD765D64aee0B44131B226edeB4f21f4B5CbD7011";
const VOTING_ESCROW = "0xE40c9DbBCC6ab95C3f1664d72C428dace3F9D731";
const VE_BOOST_PROXY = "0x2350dE713E00979e2A724eb2bDFdef6a6494e963";
const GAUGE_CONTROLLER = "0xE79b03446cb0dc2273e170B197E141687296182b";
const BAL_TOKEN_ADMIN = "0x038A87512a7B96C2b310E81093a4e22CE008d960";
const BAL_MINTER = "0x5338F11255505677b2108D7ccD12c9ce692B0eec";
const VE_BAL_HELPER = "";

const AEQ_BNB_BPT = "0xb9cc1bd3ad16f02ced308bd1a73ed23cefd7e074";
const STAKING_ADMIN = "0x570108E54d11348BD3734FF73dc55eC52c28d3EF";

async function main() {
  // const AEQ = await deployAdminToken();
  // await AEQ.mint(STAKING_ADMIN, parseEther("1000000"));
  //
  // await deployVotingEscrow(AEQ_BNB_BPT, "veAEQ", "veAEQ", AUTH_ADAPTER, STAKING_ADMIN);
  //
  // const veAddress = await deployVotingEscrow(token.address, "AQX (TEST)", "AQX (TEST)", auth);
  // const gaugeController = await deployGaugeController(veAddress, auth);
  //
  // BAL: "We assume that `votingEscrow` has been deployed in a week previous to this one."
  // So we need ve setup and running for some time yet to have a supply (or create it manually for testing purposes)
  // const block = await ethers.provider.getBlock(await ethers.provider.getBlockNumber());
  // await deployFeeDistributor(
  //   VOTING_ESCROW,
  //   block.timestamp
  // );
  //
  // await deployTokenAdmin(VAULT_ADDY, AEQ_TOKEN_V2);
  // await deployBalancerMinter(BAL_TOKEN_ADMIN, GAUGE_CONTROLLER);
  // await deployVeBalHelper(GAUGE_CONTROLLER);
  // await deployGaugeFactory(BAL_MINTER, "", AUTH_ADAPTER);
  // await deployVeBoost(VAULT_ADDY, VOTING_ESCROW);
  // await deployGaugeController(VOTING_ESCROW, AUTH_ADAPTER);
  //
  // await deployTokenAdmin(VAULT_ADDY, AEQ_TOKEN_V2);
  // await deployBalancerMinter(BAL_TOKEN_ADMIN, GAUGE_CONTROLLER);
  //
  // await deployLiquidityGaugeFactory(BAL_MINTER, VE_BOOST_PROXY, AUTH_ADAPTER, STAKING_ADMIN);
  // await deployRewardOnlyGaugeFactory()
  //
  // TODO: Need to then run auth process and active the token admin (once initial mints are complete)
  //await setupGovernance(BAL_TOKEN_ADMIN, AUTH_ADAPTER, AEQ_TOKEN_V2);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
