import { DeployedContract, FactoryContracts } from "../../contract-utils";
import { PoolFactoryInfo } from "../../types";
import { deployContractUtil } from "../deploy-util";
import { logger } from "../logger";
import { saveDeploymentData } from "../save-deploy-data";

const FACTORY_TYPES: DeployedContract[] = [
  "ERC4626LinearPoolFactory",
  "LiquidityBootstrappingPoolFactory",
  "StablePoolFactory",
  "WeightedPoolFactory",
];

export async function deployPoolFactories(
  vault: string,
  excludeTypes: FactoryContracts[]
): Promise<PoolFactoryInfo[]> {
  try {
    logger.info("deployPoolFactories: Deploying factories");

    const factories: PoolFactoryInfo[] = [];
    const factoryDeployments = [];

    for (const factory of FACTORY_TYPES.filter(
      (f) => !excludeTypes.includes(f as FactoryContracts)
    )) {
      const info = await deployContractUtil(factory, {
        vault,
      });

      factoryDeployments.push(info);
      factories.push({
        type: factory,
        address: info.contract.address,
        contract: info.contract,
      });
    }

    logger.success("deployPoolFactories: Factories deployment complete");

    for (const factory of factoryDeployments) {
      await saveDeploymentData(factory.deployment);
    }

    return factories;
  } catch (error) {
    throw error;
  }
}
