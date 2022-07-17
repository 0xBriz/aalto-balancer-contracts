import { ethers } from "hardhat";
import { deployAuthAdapter } from "../utils/lp-mining/deploy-auth-adapter";
import { deployGaugeController } from "../utils/lp-mining/deploy-gauge-controller";
import { deployVotingEscrow } from "../utils/lp-mining/deploy-voting-escrow";

async function main() {
  // Will deploy a BalancerRelayer for itself during construction
  const AQX = await ethers.getContractFactory("AQX");
  const token = await AQX.deploy();
  await token.deployed();
  console.log("AQX address: ", token.address);

  const vault = "0x26683651C18018b3d6e0754366D145a5CE1b36bc";
  const auth = await deployAuthAdapter(vault);
  const veAddress = await deployVotingEscrow(token.address, "AQX (TEST)", "AQX (TEST)", auth);
  const gaugeController = await deployGaugeController(veAddress, auth);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
