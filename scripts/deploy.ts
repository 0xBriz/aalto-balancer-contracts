import { ethers } from "hardhat";
import { MAINNET_VAULT } from "./addresses";
import { deployBootstrapPoolFactory } from "./utils/factories/lbp-factory";
import { deployStablePoolFactory } from "./utils/factories/stable-factory";
import { deployWeightedFactory } from "./utils/factories/weighted-factory";

async function main() {
  // await deployStablePoolFactory(MAINNET_VAULT);
  await deployBootstrapPoolFactory(MAINNET_VAULT);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
