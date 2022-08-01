import { ethers } from "hardhat";
import { deployAuthAdapter } from "../utils/lp-mining/deploy-auth-adapter";
import { deployBalancerMinter } from "../utils/lp-mining/deploy-bal-minter";
import { deployFeeDistributor } from "../utils/lp-mining/deploy-fee-distributor";
import { deployGaugeController } from "../utils/lp-mining/deploy-gauge-controller";
import { deployGaugeFactory } from "../utils/lp-mining/deploy-gauge-factory";
import { deployTokenAdmin } from "../utils/lp-mining/deploy-token-admin";
import { deployVeBalHelper } from "../utils/lp-mining/deploy-ve-bal-helper";
import { deployVeDelegationProxy } from "../utils/lp-mining/deploy-ve-delegation-proxy";
import { deployVotingEscrow } from "../utils/lp-mining/deploy-voting-escrow";

const VAULT_ADDY = "0x0Cc23b51B3A89728c85a63c819E8283e353FC86c";

// VE
const AUTH_ADAPTER = "0x8Db257791920C4eD64a1f0139A067b42BDAa781A";
const VOTING_ESCROW = "";
const AQX_TOKEN = "";
const GAUGE_CONTROLLER = "";
const BAL_TOKEN_ADMIN = "";
const BAL_MINTER = "";
const VE_BAL_HELPER = "";

async function main() {
  // const AQX = await ethers.getContractFactory("AQX");
  // const token = await AQX.deploy();
  // await token.deployed();
  // console.log("AQX address: ", token.address);
  //
  const auth = await deployAuthAdapter(VAULT_ADDY);
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
  // await deployTokenAdmin(VAULT_ADDY, AQX_TOKEN);
  // await deployBalancerMinter(BAL_TOKEN_ADMIN, GAUGE_CONTROLLER);
  //await deployVeBalHelper(GAUGE_CONTROLLER);
  //  await deployVeDelegationProxy(VAULT_ADDY, VOTING_ESCROW, AUTH_ADAPTER);
  //await deployGaugeFactory(BAL_MINTER, "", AUTH_ADAPTER);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
