import { DeployedContract } from "../contract-utils";
import { PoolFactoryInfo } from "../types";
import { deployContractUtil } from "./deploy-util";
import { logger } from "./logger";
import { saveDeplomentData } from "./save-deploy-data";

const FACTORY_TYPES: DeployedContract[] = [
  // "ERC4626LinearPoolFactory",
  // "LiquidityBootstrappingPoolFactory",
  "StablePoolFactory",
  "WeightedPoolFactory",
];

export async function deployPoolFactories(
  doSave: boolean,
  vault: string
): Promise<PoolFactoryInfo[]> {
  try {
    logger.info("deployPoolFactories: Deploying factories");

    const factories: PoolFactoryInfo[] = [];
    const factoryDeployments = [];

    for (const factory of FACTORY_TYPES) {
      const info = await deployContractUtil(factory, {
        vault,
      });

      factoryDeployments.push(info);
      factories.push({
        type: factory,
        address: info.contract.address,
      });
    }

    logger.success("deployPoolFactories: Factories deployment complete");

    if (doSave) {
      for (const factory of factoryDeployments) {
        await saveDeplomentData(factory.deployment);
      }
    }

    return factories;
  } catch (error) {
    throw error;
  }
}
