import { ethers } from "hardhat";
import { createPools } from "../utils/deployers/pools/create-pools";
import { deployPoolFactories } from "../utils/deployers/pools/deploy-factories";
import { saveDeplomentData } from "../utils/deployers/save-deploy-data";
import { deployVault } from "../utils/deployers/vault/deploy-vault";
import * as fs from "fs-extra";
import { getVault } from "../utils/contract-utils";

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
    await Promise.all([
      saveDeplomentData(vaultData.deployment),
      saveDeplomentData(authorizerData.deployment),
      saveDeplomentData(authAdapterData.deployment),
      saveDeplomentData(entryAdapterData.deployment),
    ]);

    const factoryData = await deployPoolFactories(vaultData.vault.address);
    for (const factory of factoryData) {
      await saveDeplomentData(factory.deployment);
    }

    const poolsData = await createPools();
    await fs.writeJSON(poolsData.poolDataPath, poolsData.poolInfo);

    // const vault = await getVault();
    // console.log(
    //   await vault.getPoolTokens(
    //     "0xff0e251074a79d00a5b3cde0624354be43fcc326000200000000000000000000"
    //   )
    // );
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
}

main();
