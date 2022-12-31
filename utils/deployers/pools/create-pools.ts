import { getAddress, parseUnits } from "ethers/lib/utils";
import * as fs from "fs-extra";
import { ethers } from "hardhat";
import { join } from "path";
import { OPERATOR } from "../../data/addresses";
import { CHAIN_KEYS } from "../../data/chains";
import { getDeployedContractAddress } from "../../data/utils";
import { poolCreationService } from "../../services/pools/pool-creation.service";
import { PoolCreationConfig, PoolType, TokenWithManagerInfo } from "../../types";
import { _require } from "../utils";

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
    for (const pool of poolInfo) {
      if (pool.created) {
        continue;
      }

      pool.chainId = chainId;

      validateConfig(pool);

      // const tokenInfo: TokenWithManagerInfo[] = pool.tokenInfo.map((info) => {
      //   return {
      //     address: getAddress(info.address),
      //     manager: getAddress(info.manager),
      //     weight: parseUnits(info.weight),
      //     initialBalance: parseUnits(info.initialBalance),
      //   };
      // });

      // Map its type to its factory
      const createdPool = await handlePoolByType(pool);

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

function validateConfig(pool: PoolCreationConfig) {
  ["name", "symbol", "swapFeePercentage"].forEach((prop) => this.checkConfigProp(prop, pool));

  const tokenCount = pool.deploymentArgs.tokens.length;

  // Could just do some object keys/deep check to make this simpler
  _require(pool.initialBalances.length === tokenCount, "!tokenInfo");
  _require(!!pool.tokenInfo && Object.keys(pool.tokenInfo).length > 0, "!initialBalances.length");
  if (pool.type === PoolType.Weighted) {
    _require(pool.deploymentArgs.weights.length === tokenCount, "!weights");
    _require(pool.deploymentArgs.assetManagers.length === tokenCount, "!assetManagers");
  }
}

function checkConfigProp(prop: string, pool: PoolCreationConfig) {
  _require(pool[prop], `!pool ${prop}`);
}

async function handlePoolByType(pool: PoolCreationConfig) {
  switch (pool.type) {
    case PoolType.Weighted:
      return await handleWeightedPool(pool);

    default:
      throw new Error(`Uknown PoolType: ${pool.type}`);
  }
}

async function handleWeightedPool(pool: PoolCreationConfig) {
  return await poolCreationService.createManagedWeightedPool(
    pool.chainId,
    pool.name,
    pool.symbol,
    parseUnits(pool.deploymentArgs.swapFeePercentage),
    POOL_ADMIN[pool.chainId],
    pool.tokenInfo
  );
}
