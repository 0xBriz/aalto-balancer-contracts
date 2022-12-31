import { getDeployedContractAddress } from "../../contract-utils";
import { logger } from "../../deployers/logger";
import { PoolTokenInfo, CreateWeightedPoolArgs, PoolCreationConfig, PoolType } from "../../types";
import { initWeightedJoin } from "../../vault";
import { poolFactoryService } from "./factory.service";
import { getWeightedPoolCreationArgs } from "./pool-utils";

class PoolCreationService {
  constructor() {}

  /**
   * Packages a few operations needed to create a pool into one function.
   * Parses the input params into the structure needed for pool creation.
   * @param chainId
   * @param name
   * @param symbol
   * @param swapFeePercentage
   * @param owner
   * @param tokenInfo
   * @returns
   */
  async createManagedWeightedPool(
    chainId: number,
    name: string,
    symbol: string,
    swapFeePercentage: string,
    owner: string,
    tokenInfo: PoolTokenInfo[]
  ) {
    logger.info("createManagedWeightedPool: starting pool creation");

    // Use util to get the need pool creation args for the factory
    const args: CreateWeightedPoolArgs = getWeightedPoolCreationArgs(
      name,
      symbol,
      swapFeePercentage,
      owner,
      tokenInfo
    );

    // Create the pool through the factory
    const poolInfo = await poolFactoryService.createManagedPool(args);

    logger.success(`createManagedWeightedPool: pool "${name}" creation complete`);

    // Fire off the init join so pool has initial liquidity
    await initWeightedJoin(poolInfo.poolId, args.tokens, args.initialBalances, args.owner);

    logger.info("createManagedWeightedPool: Adding pool to DexTokenManager");

    const assetManager = await getDeployedContractAddress("AssetManager");
    // // Set pool id for asset managers once pool is created
    // const manager = await getDexAssetManager(assetManager);
    // await manager.addPool(poolInfo.poolId);
    // logger.success("createManagedWeightedPool: DexTokenManager pool id set");

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
      initialBalances: args.initialBalances,
      tokenInfo,
      deploymentArgs: {
        name,
        symbol,
        owner: args.owner,
        tokens: args.tokens,
        swapFeePercentage: args.swapFeePercentage,
        weights: args.weights,
        assetManagers: args.tokens.map((t) => assetManager),
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
