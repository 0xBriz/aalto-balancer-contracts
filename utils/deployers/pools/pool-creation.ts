import { ZERO_ADDRESS } from "../../big-numbers/ethers-big-number";
import { FactoryContracts } from "../../contract-utils";
import { PoolCreationService } from "../../services/pools/pool-creation.service";
import { doPoolInitJoins, getAllPoolConfigs } from "../../services/pools/pool-utils";
import { deployPoolFactories } from "./deploy-factories";

/**
 * Consolidates the steps in intial full deployment of the core pools
 * @param vault
 */
export async function doPoolsCreation(vault: string, excludeFactoryTypes: FactoryContracts[]) {
  const factories = await deployPoolFactories(vault, excludeFactoryTypes);

  const poolCreator = new PoolCreationService(ZERO_ADDRESS, factories);
  await poolCreator.createPools();

  await doPoolInitJoins();

  return {
    factories,
    pools: await getAllPoolConfigs(),
  };
}
