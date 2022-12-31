import { ethers } from "hardhat";
import { createPools } from "../utils/deployers/pools/create-pools";
import { deployPoolFactories } from "../utils/deployers/pools/deploy-factories";
import { saveDeplomentData } from "../utils/deployers/save-deploy-data";
import { deployVault } from "../utils/deployers/vault/deploy-vault";
import * as fs from "fs-extra";
import { getVault } from "../utils/contract-utils";
import { deployLiquidityMining } from "../utils/deployers/liquidity-mining/setup-liquidity-mining";

export async function doCoreSystemDeployment() {
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

  // const factoryData = await deployPoolFactories(vaultData.vault.address);
  // for (const factory of factoryData) {
  //   await saveDeplomentData(factory.deployment);
  // }

  // const poolsData = await createPools();
  // await fs.writeJSON(poolsData.poolDataPath, poolsData.poolInfo);
}

export async function doGovernanceAndGaugeDeploy() {
  await deployLiquidityMining();
}

async function main() {
  try {
    // await doCoreSystemDeployment();
    await doGovernanceAndGaugeDeploy();

    // const vault = await getVault();
    // console.log(
    //   await vault.getPoolTokens(
    //     "0x64b9c842085edd4b7b412e02947fe1253b52efdb000200000000000000000000"
    //   )
    // );
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
}

main();
