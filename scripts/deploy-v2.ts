import { ethers } from "hardhat";
import { createPools } from "../utils/deployers/pools/create-pools";
import { deployPoolFactories } from "../utils/deployers/pools/deploy-factories";
import { saveDeplomentData } from "../utils/deployers/save-deploy-data";
import { deployVault } from "../utils/deployers/vault/deploy-vault";
import * as fs from "fs-extra";

async function main() {
  try {
    await ethers.provider.ready;
    const chainId = ethers.provider.network.chainId;
    // deploy vault system
    // deploy factories
    // create pools
    // setup liquidity mining system components
    // do any auth items along the way

    const { vaultData, authorizerData, authAdapterData, entryAdapterData } = await deployVault();
    saveDeplomentData(vaultData.deployment);
    saveDeplomentData(authorizerData.deployment);
    saveDeplomentData(authAdapterData.deployment);
    saveDeplomentData(entryAdapterData.deployment);

    const factoryData = await deployPoolFactories(vaultData.vault.address);
    for (const factory of factoryData) {
      saveDeplomentData(factory.deployment);
    }

    const poolsData = await createPools();
    await fs.writeJSON(poolsData.poolDataPath, poolsData.poolInfo);
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
}

main();
