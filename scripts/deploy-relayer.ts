import { ethers } from "hardhat";
import { MAINNET_VAULT } from "./addresses";

async function main() {
  // Will deploy a BalancerRelayer for itself during construction
  const BaseRelayerLibrary = await ethers.getContractFactory("BaseRelayerLibrary");
  const lib = await BaseRelayerLibrary.deploy(MAINNET_VAULT);
  await lib.deployed();
  console.log("BaseRelayerLibrary: ", lib.address);

  console.log("BalancerRelayer at: ", await lib.getEntrypoint());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
