import { BigNumber } from "ethers";
import { formatEther } from "ethers/lib/utils";
import { getDexAssetManager, getVault } from "../../contract-utils";
import { getDeployedContractAddress } from "../../data/utils";
import { logger } from "../../deployers/logger";
import { getSigner } from "../../deployers/signers";
import { doTransaction } from "../../tx-utils";
import {
  TokenWithManagerInfo,
  CreateWeightedPoolArgs,
  PoolCreationConfig,
  PoolType,
} from "../../types";
import { initWeightedJoin } from "../../vault";
import { poolFactoryService } from "./factory.service";
import { getWeightedPoolCreationArgs } from "./pool-utils";

export class PoolCreationService {
  constructor() {}

  async createManagedWeightedPool(
    chainId: number,
    name: string,
    symbol: string,
    swapFeePercentage: BigNumber,
    owner: string,
    tokenInfo: TokenWithManagerInfo[]
  ) {
    logger.info("createManagedWeightedPool: starting pool creation");

    const assetManager = await getDeployedContractAddress(chainId, "AssetManager");
    // Use util to get the need pool creation args for the factory
    const args: CreateWeightedPoolArgs = getWeightedPoolCreationArgs(
      name,
      symbol,
      swapFeePercentage,
      owner,
      tokenInfo,
      assetManager
    );

    const [signer, vaultAddress] = await Promise.all([
      getSigner(),
      getDeployedContractAddress(chainId, "Vault"),
    ]);

    // Create the pool through the factory
    const poolInfo = await poolFactoryService.createManagedPool(args);

    logger.success("createManagedWeightedPool: pool creation complete");

    // Fire off the init join so pool has initial liquidity
    await initWeightedJoin(
      poolInfo.poolId,
      args.tokens,
      args.initialBalances,
      args.owner,
      getVault(vaultAddress, signer),
      signer
    );

    logger.success("createManagedWeightedPool: adding pool to DexTokenManager");

    // Set pool id for asset managers once pool is created
    const manager = getDexAssetManager(assetManager, signer);
    await manager.addPool(poolInfo.poolId);

    logger.success("createManagedWeightedPool: asset managers pool ids set complete");

    const data: PoolCreationConfig = {
      created: true,
      chainId,
      name,
      assetManager,
      type: PoolType.Weighted,
      txHash: poolInfo.txHash,
      poolId: poolInfo.poolId,
      poolAddress: poolInfo.poolAddress,
      date: poolInfo.date,
      initialBalances: args.initialBalances.map((ib) => formatEther(ib)),
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
