import { ethers } from "hardhat";
import { MAINNET_VAULT } from "./addresses";
import { deployMulticall } from "./deploy-multicall";
import { deployRelayer } from "./deploy-relayer";
import { deployVault } from "./deploy-vault";
import { deployBootstrapPoolFactory } from "./utils/factories/lbp-factory";
import { deployStablePoolFactory } from "./utils/factories/stable-factory";
import { deployWeightedFactory } from "./utils/factories/weighted-factory";
import { deployWeightedNoAssetManagersFactory } from "./utils/factories/weighted-nomanagers";

const VAULT = "0xA05cE8E8a34E10B676711e2CAc8BD656E96F310F";

const WETH = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c"; // WBNB

async function main() {
  //  await deployVault(WETH);
  // ======================= FACTORIES ========================//
  // await deployWeightedFactory(VAULT);
  // await deployWeightedNoAssetManagersFactory(VAULT);
  // await deployStablePoolFactory(VAULT);
  // await deployBootstrapPoolFactory(VAULT);
  // ======================= STAND ALONES ========================//
  // await deployMulticall();
  // await deployRelayer(VAULT);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
