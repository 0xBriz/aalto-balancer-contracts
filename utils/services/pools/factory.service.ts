import { CreateWeightedPoolArgs, PoolCreationBaseData, PoolType } from "../../types";
import * as Weighted from "../../../artifacts/contracts/pool-weighted/WeightedPoolFactory.sol/WeightedPoolFactory.json";
import * as LBP from "../../../artifacts/contracts/pool-weighted/smart/LiquidityBootstrappingPool.sol/LiquidityBootstrappingPool.json";
import { Contract, ContractReceipt } from "ethers";
import { getSigner } from "../../deployers/signers";
import { doTransaction } from "../../tx-utils";
import { getDeployedContractAddress } from "../../data/utils";
import { getWeightedPoolInstance } from "../../contract-utils";
import { logger } from "../../deployers/logger";
import { parseUnits } from "ethers/lib/utils";

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

  /**
   * Creates a "managed"(with asset manager) pool that assigns the asset manager to each pool token.
   * Attaches the asset manager(s) on here at the end as a utility/helper.
   * @param args
   * @returns
   */
  async createManagedPool(args: CreateWeightedPoolArgs): Promise<PoolCreationBaseData> {
    try {
      // These calls throw if the address hasn't been set for the chain
      const [managerAddress, factoryAddress] = await Promise.all([
        getDeployedContractAddress("AssetManager"),
        getDeployedContractAddress("WeightedPoolFactory"),
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
          args.weights.map((w) => parseUnits(w)),
          assetManagers,
          parseUnits(args.swapFeePercentage),
          args.owner
        )
      );

      return this.getPoolCreationData(receipt);
    } catch (error) {
      throw error;
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
}

export const poolFactoryService = new PoolFactoryService();
