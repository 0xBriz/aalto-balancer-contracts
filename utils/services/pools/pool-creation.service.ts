import { ethers } from "hardhat";
import { getAddress, parseUnits } from "ethers/lib/utils";
import { getChainAdmin, OPERATOR } from "../../data/addresses";
import { logger } from "../../deployers/logger";
import { _require } from "../../deployers/utils";
import * as Weighted from "../../../artifacts/contracts/pool-weighted/WeightedPoolFactory.sol/WeightedPoolFactory.json";
import * as LBP from "../../../artifacts/contracts/pool-weighted/smart/LiquidityBootstrappingPool.sol/LiquidityBootstrappingPool.json";
import {
  PoolTokenInfo,
  CreateWeightedPoolArgs,
  PoolCreationConfig,
  PoolType,
  PoolCreationBaseData,
  PoolFactoryInfo,
  FactoryType,
} from "../../types";
import { initWeightedJoin } from "../../vault";
import { getAllPoolConfigs, getWeightedPoolCreationArgs, savePoolsData } from "./pool-utils";
import { Contract, ContractReceipt } from "ethers";
import { getWeightedPoolInstance } from "../../contract-utils";
import { awaitTransactionComplete, doTransaction } from "../../tx-utils";
import { getSigner } from "../../deployers/signers";
import { getChainId } from "../../deployers/network";

const POOL_ADMIN = {
  5: OPERATOR,
  56: OPERATOR,
};

export class PoolCreationService {
  constructor(public readonly assetManager: string, public readonly factories: PoolFactoryInfo[]) {}

  async getFactory(poolType: PoolType) {
    const signer = await getSigner();
    switch (poolType) {
      case PoolType.Weighted:
        return new Contract(
          this.factories.find((f) => f.type === "WeightedPoolFactory").address,
          Weighted.abi,
          signer
        );
      case PoolType.LiquidityBootstrappingPool:
        return new Contract(
          this.factories.find((f) => f.type === "LiquidityBootstrappingPoolFactory").address,
          LBP.abi,
          signer
        );
      case PoolType.ComposableStable:
        throw new Error(`ComposableStable not added yet`);

      default:
        throw new Error(`Unknown PoolType: ${poolType}`);
    }
  }

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

    const receipt = await this.doWeightedPoolCreation(args);
    const poolInfo = await this.getPoolCreationData(receipt);

    logger.success(`createManagedWeightedPool: pool "${name}" creation complete`);

    // Fire off the init join so pool has initial liquidity
    // await initWeightedJoin(poolInfo.poolId, args.tokens, args.initialBalances, args.owner);

    // logger.info("createManagedWeightedPool: Adding pool to DexTokenManager");
    // // const assetManager = await getDeployedContractAddress("AssetManager");
    // // // Set pool id for asset managers once pool is created
    // // const manager = await getDexAssetManager(assetManager);
    // // await manager.addPool(poolInfo.poolId);
    // // logger.success("createManagedWeightedPool: DexTokenManager pool id set");

    const data: PoolCreationConfig = {
      created: true,
      chainId: await getChainId(),
      name,
      symbol,
      assetManager: this.assetManager,
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
        assetManagers: args.tokens.map((t) => this.assetManager),
      },
      gauge: {
        // These are set later
        address: "",
        startingWeight: "",
        added: false,
        txHash: "",
      },
    };

    logger.info("createManagedWeightedPool: pool data is:");
    // Logging in case of a file save/create issue
    console.log(data);

    return data;
  }

  private async doWeightedPoolCreation(args: CreateWeightedPoolArgs) {
    try {
      logger.info("doWeightedPoolCreation");
      // Assigning asset manager to our own core pools
      const assetManagers = [];
      args.tokens.forEach((t) => assetManagers.push(this.assetManager));

      const weightedFactory = await this.getFactory(PoolType.Weighted);

      console.log(args);

      return await awaitTransactionComplete(
        await weightedFactory.create(
          args.name,
          args.symbol,
          args.tokens,
          args.weights.map((w) => parseUnits(w)),
          assetManagers,
          parseUnits(args.swapFeePercentage),
          args.owner
        ),
        5
      );
    } catch (error) {
      throw error;
    }
  }

  async createPools(doSave: boolean): Promise<{
    poolInfo: PoolCreationConfig[];
  }> {
    try {
      await ethers.provider.ready;
      const chainId = ethers.provider.network.chainId;
      logger.info("createPools: Starting pool creation");

      let poolInfo: PoolCreationConfig[] = await getAllPoolConfigs();

      for (const pool of poolInfo) {
        if (pool.created) {
          continue;
        }

        this.validatePoolConfig(pool);

        // set the chain id on the pool to save looking it up later
        pool.chainId = chainId;
        // set proper address if needed
        pool.tokenInfo = pool.tokenInfo.map((info) => {
          return {
            ...info,
            address: getAddress(info.address),
          };
        });
        pool.deploymentArgs.owner = await getChainAdmin();

        try {
          // Map its type to its factory
          const createdPool = await this.handlePoolByType(pool);
          // Write back to update the pool
          poolInfo = poolInfo.filter((p) => p.name !== createdPool.name);
          // In case there is a startingWeight set for the initial pools
          createdPool.gauge = pool.gauge;
          createdPool.isVePool = pool.isVePool || false;
          poolInfo.push(createdPool);
        } catch (error) {
          logger.error(`Pool creation failed for pool "${pool.name}"`);
          console.error(error);
        }
      }

      logger.success("createPools: Pool creation complete");

      if (doSave === true) {
        await savePoolsData(poolInfo);
      }

      return {
        poolInfo,
      };
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Gets base information about a pool after it is created, including the new pool id.
   * @param receipt
   * @returns
   */
  async getPoolCreationData(receipt: ContractReceipt): Promise<PoolCreationBaseData> {
    logger.info("Getting new pool creation data");
    // We need to get the new pool address out of the PoolCreated event
    const events = receipt.events.filter((e) => e.event === "PoolCreated");
    const poolAddress = events[0].args.pool;
    console.log(poolAddress);
    const pool = await getWeightedPoolInstance(poolAddress);
    const data = {
      poolId: await pool.getPoolId(),
      poolAddress,
      txHash: receipt.transactionHash,
      date: new Date().toLocaleString(),
    };

    console.log(data);

    return data;
  }

  validatePoolConfig(pool: PoolCreationConfig) {
    logger.info(`validatePoolConfig: Validating pool config`);

    _require(!!pool.type, "!pool type");
    _require(pool.type in PoolType, "!invalid pool type");

    pool.tokenInfo.forEach((info) => {
      if (pool.type === PoolType.Weighted) {
        _require(!!info.weight, "!token info weight");
      }

      // Gov token gets auto added later
      if (!pool.isVePool) {
        _require(!!info.address, "!token info address");
      }

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

  async handlePoolByType(pool: PoolCreationConfig) {
    switch (pool.type) {
      case PoolType.Weighted:
        return await this.createManagedWeightedPool(
          pool.deploymentArgs.name,
          pool.deploymentArgs.symbol,
          pool.deploymentArgs.swapFeePercentage,
          pool.deploymentArgs.owner,
          pool.tokenInfo
        );

      default:
        throw new Error(`Uknown PoolType: ${pool.type}`);
    }
  }
}
