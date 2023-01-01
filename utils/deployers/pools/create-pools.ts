import { getAddress } from "ethers/lib/utils";
import * as fs from "fs-extra";
import { ethers } from "hardhat";
import { join } from "path";
import { OPERATOR } from "../../data/addresses";
import { CHAIN_KEYS } from "../../data/chains";
import { poolCreationService } from "../../services/pools/pool-creation.service";
import { getPoolConfigPath, getPoolConfigs, savePoolsData } from "../../services/pools/pool-utils";
import { PoolCreationConfig, PoolType } from "../../types";
import { logger } from "../logger";
import { _require } from "../utils";

// const POOL_TYPE_TO_FACTORY = {
//   ["Weighted"]: "WeightedPoolFactory",
//   ["Stable"]: "StablePoolFactory",
//   ["ComposableStable"]: "",
//   ["LBP"]: "LiquidityBootstrappingPoolFactory",
// };

const POOL_ADMIN = {
  5: OPERATOR,
  56: OPERATOR,
};

export async function createPools(doSave: boolean): Promise<{
  poolInfo: PoolCreationConfig[];
}> {
  try {
    await ethers.provider.ready;
    const chainId = ethers.provider.network.chainId;
    logger.info("createPools: Starting pool creation");

    let poolInfo: PoolCreationConfig[] = await getPoolConfigs();

    for (const pool of poolInfo) {
      if (pool.created) {
        continue;
      }

      // TODO: Account for main pool not having the token address set in the config yet and set it
      validatePoolConfig(pool);

      // set the chain id on the pool to save looking it up later
      pool.chainId = chainId;
      // set proper address if needed
      pool.tokenInfo = pool.tokenInfo.map((info) => {
        return {
          ...info,
          address: getAddress(info.address),
        };
      });

      try {
        // Map its type to its factory
        const createdPool = await handlePoolByType(pool);
        // Write back to update the pool
        poolInfo = poolInfo.filter((p) => p.name !== createdPool.name);
        // In case there is a startingWeight set for the initial pools
        createdPool.gauge = pool.gauge;
        createdPool.isVePool = pool.isVePool || false;
        poolInfo.push(createdPool);
      } catch (error) {
        logger.error(`Pool creation failed for pool "${pool.name}"`);
      }
    }

    logger.success("createPools: Pool creation complete");

    if (doSave) {
      await savePoolsData(poolInfo);
    }

    return {
      poolInfo,
    };
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
}

function validatePoolConfig(pool: PoolCreationConfig) {
  logger.info(`validatePoolConfig: Validating pool config`);

  _require(!!pool.type, "!pool type");
  _require(pool.type in PoolType, "!invalid pool type");

  pool.tokenInfo.forEach((info) => {
    if (pool.type === PoolType.Weighted) {
      _require(!!info.weight, "!token info weight");
    }

    _require(!!info.address, "!token info address");
    _require(!!info.initialBalance?.length, "!token info init balance");
  });

  _require(!!pool.deploymentArgs.swapFeePercentage, `!swapFeePercentage`);
  _require(!!pool.deploymentArgs.name, `!name`);
  _require(!!pool.deploymentArgs.symbol, `!symbol`);
  // owner will be auto attached to deploy args later

  _require(!!pool.gauge, "!gauge info");
  _require(!!pool.gauge.startingWeight, "!gauge startingWeight");

  logger.success(`validatePoolConfig: Validation all good`);
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
    pool.deploymentArgs.name,
    pool.deploymentArgs.symbol,
    pool.deploymentArgs.swapFeePercentage,
    POOL_ADMIN[pool.chainId],
    pool.tokenInfo
  );
}
