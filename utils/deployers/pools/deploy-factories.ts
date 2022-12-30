import { deployFactory } from "./factories/deploy-factory";

const FACTORY_TYPES = [
  "ERC4626LinearPoolFactory",
  "LiquidityBootstrappingPoolFactory",
  "StablePoolFactory",
  "WeightedPoolFactory",
];

export async function deployPoolFactories(vault: string) {
  try {
    console.log("Deploying factories.");
    for (const factory of FACTORY_TYPES) {
      console.log(`Deploying ${factory}`);
      await deployFactory(vault, factory);
    }
  } catch (error) {
    throw error;
  }
}
