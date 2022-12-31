import { BigNumber } from "ethers";
import { formatEther, parseUnits } from "ethers/lib/utils";
import { getDexAssetManager, getVault } from "../../contract-utils";
import { getDeployedContractAddress } from "../../data/utils";
import { logger } from "../../deployers/logger";
import {
  TokenWithManagerInfo,
  CreateWeightedPoolArgs,
  PoolCreationConfig,
  PoolType,
} from "../../types";
import { initWeightedJoin } from "../../vault";
import { poolFactoryService } from "./factory.service";
import { getWeightedPoolCreationArgs } from "./pool-utils";

class PoolCreationService {
  constructor() {}

  async createManagedWeightedPool(
    chainId: number,
    name: string,
    symbol: string,
    swapFeePercentage: string,
    owner: string,
    tokenInfo: TokenWithManagerInfo[]
  ) {
    logger.info("createManagedWeightedPool: starting pool creation");

    const assetManager = await getDeployedContractAddress("AssetManager");
    // Use util to get the need pool creation args for the factory
    const args: CreateWeightedPoolArgs = getWeightedPoolCreationArgs(
      name,
      symbol,
      swapFeePercentage,
      owner,
      tokenInfo,
      assetManager
    );

    // Create the pool through the factory
    const poolInfo = await poolFactoryService.createManagedPool(args);

    logger.success("createManagedWeightedPool: pool creation complete");

    // Fire off the init join so pool has initial liquidity
    await initWeightedJoin(
      poolInfo.poolId,
      args.tokens,
      args.initialBalances,
      args.owner,
      await getVault(await getDeployedContractAddress("Vault"))
    );

    logger.success("createManagedWeightedPool: adding pool to DexTokenManager");

    // Set pool id for asset managers once pool is created
    const manager = await getDexAssetManager(assetManager);
    await manager.addPool(poolInfo.poolId);

    logger.success("createManagedWeightedPool: asset managers pool ids set complete");

    const data: PoolCreationConfig = {
      created: true,
      chainId,
      name,
      symbol,
      assetManager,
      type: PoolType.Weighted,
      txHash: poolInfo.txHash,
      poolId: poolInfo.poolId,
      poolAddress: poolInfo.poolAddress,
      date: poolInfo.date,
      initialBalances: args.initialBalances.map((ib) => formatEther(ib)),
      tokenInfo,
      deploymentArgs: {
        name,
        symbol,
        owner: args.owner,
        tokens: args.tokens,
        swapFeePercentage: formatEther(args.swapFeePercentage),
        weights: args.weights.map((w) => formatEther(w)),
        assetManagers: args.assetManagers,
      },
      gauge: {
        // These are set later
        address: "",
        startingWeight: "",
        added: false,
      },
    };

    logger.success("createManagedWeightedPool: process complete");
    logger.info("createManagedWeightedPool: pool data is:");
    // Logging in case of a file save/create issue
    console.log(data);

    // await savePoolCreationInfo(symbol.toLowerCase(), chainId, data);

    return data;
  }
}

export const poolCreationService = new PoolCreationService();
