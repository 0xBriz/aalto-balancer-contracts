import * as fs from "fs-extra";
import { defaultAbiCoder, getAddress, parseUnits } from "ethers/lib/utils";
import {
  CreateWeightedPoolArgs,
  JoinPoolRequest,
  PoolCreationConfig,
  PoolFactoryInfo,
  PoolTokenInfo,
  PoolType,
  StablePoolCreationArgs,
} from "../../types";
import { join } from "path";
import { CHAIN_KEYS } from "../../data/chains";
import { getChainId } from "../../deployers/network";
import { getDeployedContractAddress, getVault } from "../../contract-utils";
import { Contract } from "ethers";
import { getSigner } from "../../deployers/signers";
import * as LGF from "../../../artifacts/contracts/liquidity-mining/gauges/LiquidityGaugeFactory.sol/LiquidityGaugeFactory.json";
import { logger } from "../../deployers/logger";
import { getChainAdmin } from "../../data/addresses";
import { approveTokensIfNeeded } from "../../token/token-utils";
import { awaitTransactionComplete } from "../../tx-utils";

/**
 * Sorts the tokens for a pool according to address as required by the vault.
 * Having the initial balance to be used for liquidity, and the weights attached(if applicable),
 * allows for all required info to be "index aligned".
 * Would have a busted pool if these items do not line up with their associated token.
 * @param tokens
 * @returns
 */
export function sortTokensWithInfo(tokens: PoolTokenInfo[]): PoolTokenInfo[] {
  return tokens.sort((t1, t2) => (getAddress(t1.address) < getAddress(t2.address) ? -1 : 1));
}

/**
 * Sets the values needed for pool creation arguments.
 * Items need to be index aligned based on each tokens resulting index.
 * Uses `sortTokensWithInfo` to help with this.
 */
export function getWeightedPoolCreationArgs(
  name: string,
  symbol: string,
  swapFeePercentage: string,
  owner: string,
  tokenInfo: PoolTokenInfo[]
): CreateWeightedPoolArgs {
  const sortedInfo = sortTokensWithInfo(tokenInfo);

  return {
    name,
    symbol,
    tokens: sortedInfo.map((info) => info.address),
    weights: sortedInfo.map((info) => info.weight),
    swapFeePercentage,
    owner,
    initialBalances: sortedInfo.map((info) => info.initialBalance),
  };
}

export function getStablePoolCreationArgs(pool: PoolCreationConfig): StablePoolCreationArgs {
  const sortedInfo = sortTokensWithInfo(pool.tokenInfo);

  return {
    name: pool.deploymentArgs.name,
    symbol: pool.deploymentArgs.symbol,
    tokens: sortedInfo.map((info) => info.address),
    swapFeePercentage: pool.deploymentArgs.swapFeePercentage,
    owner: pool.deploymentArgs.owner,
    amplificationParameter: pool.amp,
    initialBalances: sortedInfo.map((info) => info.initialBalance),
  };
}

export async function getPoolConfigPath() {
  return join(process.cwd(), "utils", "data", `${CHAIN_KEYS[await getChainId()]}-pools.json`);
}

export async function getCreatedPoolConfigs(): Promise<PoolCreationConfig[]> {
  const pools: PoolCreationConfig[] = await fs.readJSON(await getPoolConfigPath());
  return pools.filter((p) => p.created);
}

export async function getAllPoolConfigs(): Promise<PoolCreationConfig[]> {
  return await fs.readJSON(await getPoolConfigPath());
}

export async function savePoolsData(pools: PoolCreationConfig[]) {
  await fs.writeJSON(await getPoolConfigPath(), pools);
}

export async function getMainPoolConfig() {
  const poolConfigs = await getAllPoolConfigs();
  return poolConfigs.find((p) => p.isVePool);
}

export async function getLiquidityGaugeFactory() {
  return await new Contract(
    await getDeployedContractAddress("LiquidityGaugeFactory"),
    LGF.abi,
    await getSigner()
  );
}

export async function getPoolFactories(): Promise<PoolFactoryInfo[]> {
  const [weightedAddress, stableAddress] = await Promise.all([
    getDeployedContractAddress("WeightedPoolFactory"),
    getDeployedContractAddress("StablePoolFactory"),
    // getDeployedContractAddress('WeightedPoolFactory')
  ]);

  return [
    {
      type: "WeightedPoolFactory",
      address: weightedAddress,
    },
    {
      type: "StablePoolFactory",
      address: stableAddress,
    },
  ];
}

export async function updatePoolConfig(pool: PoolCreationConfig) {
  logger.info(`updatePoolConfig: updating ${pool.name}`);
  let poolConfigs = await getAllPoolConfigs();
  poolConfigs = poolConfigs.filter((p) => p.name !== pool.name);
  poolConfigs.push(pool);
  await savePoolsData(poolConfigs);

  logger.success(`updatePoolConfig: pool update complete`);
}

/**
 * Utility to perform the INIT_JOIN operation on a weight pool.
 * Will approve the vault for each token as needed.
 * @param poolId
 * @param tokens
 * @param initialBalances
 * @param recipient
 * @returns
 */
export async function initWeightedJoin(
  poolId: string,
  tokens: string[],
  initialBalances: string[],
  recipient: string
) {
  try {
    logger.info("Starting INIT_JOIN for pool id: " + poolId);

    const JOIN_KIND_INIT = 0; // Can only be called once for most pools

    // convert to BigNumber before encoding
    const balancesBN = initialBalances.map((a) => parseUnits(a));

    // Must be encoded
    const initUserData = defaultAbiCoder.encode(
      ["uint256", "uint256[]"],
      [JOIN_KIND_INIT, balancesBN]
    );

    const joinPoolRequest: JoinPoolRequest = {
      assets: tokens,
      maxAmountsIn: balancesBN,
      userData: initUserData,
      fromInternalBalance: false,
    };

    const vault = await getVault();

    // Vault needs approval to pull the tokens in
    await approveTokensIfNeeded(tokens, recipient, vault.address);

    const rx = await awaitTransactionComplete(
      await vault.joinPool(poolId, recipient, recipient, joinPoolRequest)
    );

    logger.success("INIT_JOIN complete");

    return rx;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function doPoolJoin(
  poolId: string,
  sender: string,
  recipient: string,
  request: JoinPoolRequest
) {
  const vault = await getVault();
  awaitTransactionComplete(vault.joinPool(poolId, sender, recipient, request));
}

/**
 * After creation pull the pools data and do init joins based on initial balance config values
 */
export async function doPoolInitJoins() {
  const pools = await getAllPoolConfigs();
  for (const pool of pools) {
    if (pool.initJoinComplete) {
      continue;
    }

    // TODO: Need to check init join params needed for other types
    if (pool.type === PoolType.Weighted || pool.type === PoolType.Stable) {
      await initWeightedJoin(
        pool.poolId,
        pool.deploymentArgs.tokens,
        pool.initialBalances,
        await getChainAdmin()
      );

      pool.initJoinComplete = true;
      await updatePoolConfig(pool);
    } else {
      logger.error(`Unsupported init join for pool type: ${pool.type}`);
    }
  }
}

/**
 *  Set the new token address for use in pool creation and such later
 * @param govTokenAddress
 */
export async function updateMainPoolConfigForGovToken(govTokenAddress: string) {
  const vePool = await getMainPoolConfig();
  let hadSymbol = false;
  vePool.tokenInfo = vePool.tokenInfo.map((ti) => {
    if (ti.symbol === "VRTK") {
      hadSymbol = true;
      return {
        ...ti,
        address: govTokenAddress,
      };
    }

    return ti;
  });

  if (!hadSymbol) {
    throw new Error("Missing VRTK symbol for ve pool");
  }

  await updatePoolConfig(vePool);
}
