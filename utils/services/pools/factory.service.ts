import { CreateWeightedPoolArgs, PoolCreationBaseData, PoolType } from "../../types";
import * as Weighted from "../../../artifacts/contracts/pool-weighted/WeightedPoolFactory.sol/WeightedPoolFactory.json";
import * as LBP from "../../../artifacts/contracts/pool-weighted/smart/LiquidityBootstrappingPool.sol/LiquidityBootstrappingPool.json";
import { Contract, ContractReceipt } from "ethers";
import { getSigner } from "../../deployers/signers";
import { doTransaction } from "../../tx-utils";
import { getDeployedContractAddress } from "../../data/utils";
import { getChainId } from "../../deployers/network";
import { getWeightedPoolInstance } from "../../contract-utils";
import { logger } from "../../deployers/logger";

export type FactoryType =
  | "WeightedPoolFactory"
  | "ComposablePoolFactory"
  | "LiquidityBootstrappingPoolFactory";

class PoolFactoryService {
  constructor() {}

  async getFactory(type: PoolType, address: string) {
    const signer = await getSigner();
    switch (type) {
      case PoolType.Weighted:
        return new Contract(address, Weighted.abi, signer);
      case PoolType.LiquidityBootstrappingPool:
        return new Contract(address, LBP.abi, signer);
      case PoolType.ComposableStable:
        throw new Error(`ComposableStable not added yet`);

      default:
        throw new Error(`Unknown PoolType: ${type}`);
    }
  }

  async createManagedPool(args: CreateWeightedPoolArgs): Promise<PoolCreationBaseData> {
    try {
      const chainId = await getChainId();

      const [managerAddress, factoryAddress] = await Promise.all([
        getDeployedContractAddress(chainId, "AssetManager"),
        getDeployedContractAddress(chainId, "WeightPoolFactory"),
      ]);

      // Assigning asset manager to our own core pools
      const assetManagers = [];
      args.tokens.forEach((t) => assetManagers.push(managerAddress));

      const weightedFactory = await this.getFactory(PoolType.Weighted, factoryAddress);

      const receipt = await doTransaction(
        await weightedFactory.create(
          args.name,
          args.symbol,
          args.tokens,
          args.weights,
          assetManagers,
          args.swapFeePercentage,
          args.owner
        )
      );

      return this.getPoolCreationData(receipt);
    } catch (error) {
      throw error;
    }
  }

  async getPoolCreationData(receipt: ContractReceipt): Promise<PoolCreationBaseData> {
    logger.info("Getting new pool creation data");
    // We need to get the new pool address out of the PoolCreated event
    const events = receipt.events.filter((e) => e.event === "PoolCreated");
    const poolAddress = events[0].args.pool;
    const pool = getWeightedPoolInstance(poolAddress, await getSigner());
    const data = {
      poolId: await pool.getPoolId(),
      poolAddress,
      txHash: receipt.transactionHash,
      date: new Date().toLocaleString(),
    };

    console.log(data);

    return data;
  }
}

export const poolFactoryService = new PoolFactoryService();
