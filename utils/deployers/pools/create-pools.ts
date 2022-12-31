import * as fs from "fs-extra";
import { ethers } from "hardhat";
import { join } from "path";
import { OPERATOR } from "../../data/addresses";
import { CHAIN_KEYS } from "../../data/chains";
import { getDeployedContractAddress } from "../../data/utils";
import { PoolCreationConfig, PoolType } from "../../types";

const POOL_TYPE_TO_FACTORY = {
  ["Weighted"]: "WeightedPoolFactory",
  ["Stable"]: "StablePoolFactory",
  ["ComposableStable"]: "",
  ["LBP"]: "LiquidityBootstrappingPoolFactory",
};

const POOL_ADMIN = {
  5: OPERATOR,
  56: OPERATOR,
};

export async function createPools() {
  try {
    await ethers.provider.ready;
    const chainId = ethers.provider.network.chainId;

    const poolDataPath = join(
      process.cwd(),
      "utils",
      "data",
      `${CHAIN_KEYS[ethers.provider.network.chainId]}-pools.json`
    );
    const poolInfo: PoolCreationConfig[] = await fs.readJSON(poolDataPath);
    const assetManager = await getDeployedContractAddress(chainId, "AssetManager");

    for (const pool of poolInfo) {
      if (pool.created) {
        continue;
      }

      validateConfig(pool);

      // Map its type to its factory
      const createdPool = await handlePoolByType(pool);

      // Set defaults
      pool.deploymentArgs.owner = POOL_ADMIN[chainId];
      pool.assetManager = assetManager;

      // Write back to update the pool
      pool.created = true;
      await fs.writeJSON(poolDataPath, poolInfo);

      // await saveDeplomentData()
    }
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
}

function validateConfig(config: PoolCreationConfig) {
  const required = ["name", "symbol"];
}

async function handlePoolByType(pool: PoolCreationConfig) {
  // switch on type and do the thing as needed
  switch (pool.type) {
    //
    case PoolType.Weighted:
      //
      break;
  }
}
