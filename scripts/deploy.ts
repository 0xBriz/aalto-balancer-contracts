import { ethers } from "hardhat";
import { MAINNET_VAULT } from "./addresses";
import { deployMulticall } from "./deploy-multicall";
import { deployVault } from "./deploy-vault";
import { deployBootstrapPoolFactory } from "./utils/factories/lbp-factory";
import { deployStablePoolFactory } from "./utils/factories/stable-factory";
import { deployWeightedFactory } from "./utils/factories/weighted-factory";
import { deployWeightedNoAssetManagersFactory } from "./utils/factories/weighted-nomanagers";

//const VAULT = '0xc37c34eA9CA579aDF279A16C547e801ed722F3b5'
const VAULT_GOERLI = "0x0Cc23b51B3A89728c85a63c819E8283e353FC86c";

async function main() {
  // const vaultAddress = await deployVault();

  // ======================= FACTORIES ========================//

  await deployWeightedFactory(VAULT_GOERLI);
  await deployWeightedNoAssetManagersFactory(VAULT_GOERLI);
  await deployStablePoolFactory(VAULT_GOERLI);
  await deployBootstrapPoolFactory(VAULT_GOERLI);

  // ======================= STAND ALONES ========================//

  // await deployMulticall();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
