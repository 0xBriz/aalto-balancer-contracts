import { ethers } from "hardhat";
import { MAINNET_VAULT } from "./addresses";
import { deployToken } from "./deploy-token";
import { deployBootstrapPoolFactory } from "./utils/factories/lbp-factory";
import { deployStablePoolFactory } from "./utils/factories/stable-factory";
import { deployWeightedFactory } from "./utils/factories/weighted-factory";

async function main() {
  await deployStablePoolFactory("0x26683651C18018b3d6e0754366D145a5CE1b36bc");
  await deployBootstrapPoolFactory("0x26683651C18018b3d6e0754366D145a5CE1b36bc");

  // await deployToken();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
