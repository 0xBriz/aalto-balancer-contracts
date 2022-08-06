import { ethers } from "hardhat";
import { deployAuthAdapter } from "../utils/lp-mining/deploy-auth-adapter";
import { deployBalancerMinter } from "../utils/lp-mining/deploy-bal-minter";
import { deployFeeDistributor } from "../utils/lp-mining/deploy-fee-distributor";
import { deployGaugeController } from "../utils/lp-mining/deploy-gauge-controller";
import { deployGaugeFactory } from "../utils/lp-mining/deploy-gauge-factory";
import { deployTokenAdmin } from "../utils/lp-mining/deploy-token-admin";
import { deployVeBalHelper } from "../utils/lp-mining/deploy-ve-bal-helper";
import { deployVeBoost } from "../utils/lp-mining/deploy-ve-boost";
import { deployVotingEscrow } from "../utils/lp-mining/deploy-voting-escrow";

const VAULT_ADDY = "0x26683651C18018b3d6e0754366D145a5CE1b36bc";

// VE
const AUTH_ADAPTER = "0x6A732F4545a462778BD9DF935C8f2f7d5B2F4eB1";
const VOTING_ESCROW = "0xc5b7205454Ef2e4DDe093442bC1b1457E46B0352";
const AQX_TOKEN = "0x701F8f09FD8Ab9c585afFC269726a53Ad57aE61B";
const GAUGE_CONTROLLER = "0xD2c912fb68382DbDacc979c06DF2DD00ce40aE69";
const BAL_TOKEN_ADMIN = "0x52c4D2EfB536a2b5EF5Bb24D20fC9732d5d27ebc";
const BAL_MINTER = "0x3648F04cd862191231DA03FE725eE088c208f248";
const VE_BAL_HELPER = "0x57130A8a07646C135f6813Dd7F3292658a828E1E";

async function main() {
  // const AQX = await ethers.getContractFactory("AQX");
  // const token = await AQX.deploy();
  // await token.deployed();
  // console.log("AQX address: ", token.address);
  //
  // const auth = await deployAuthAdapter(VAULT_ADDY);
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
