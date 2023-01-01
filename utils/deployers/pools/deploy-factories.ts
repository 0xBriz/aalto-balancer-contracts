import { logger } from "../logger";
import { saveDeplomentData } from "../save-deploy-data";
import { deployFactory } from "./factories/deploy-factory";

const FACTORY_TYPES = [
  "ERC4626LinearPoolFactory",
  "LiquidityBootstrappingPoolFactory",
  "StablePoolFactory",
  "WeightedPoolFactory",
];

export async function deployPoolFactories(vault: string, doSave: boolean) {
  try {
    logger.info("deployPoolFactories: Deploying factories");

    const factoryDeployments = [];
    for (const factory of FACTORY_TYPES) {
      logger.info(`Deploying ${factory}..`);
      const info = await deployFactory(vault, factory);
      factoryDeployments.push(info);
    }
    logger.success("deployPoolFactories: Factories deployment complete");

    if (doSave) {
      for (const factory of factoryDeployments) {
        await saveDeplomentData(factory.deployment);
      }
    }

    return factoryDeployments;
  } catch (error) {
    throw error;
  }
}
