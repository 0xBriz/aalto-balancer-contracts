import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { ZERO_ADDRESS } from "../../utils/big-numbers/ethers-big-number";
import { deployPoolFactories } from "../../utils/deployers/pools/deploy-factories";
import { PoolCreationService } from "../../utils/services/pools/pool-creation.service";
import { doPoolInitJoins, getAllPoolConfigs } from "../../utils/services/pools/pool-utils";
import { resetTestPoolConfigs } from "../test-utils/general-utils";
import { governanceSetupFixture } from "./goverance-setup.fixture";

export async function poolsSetupFixture() {
  await resetTestPoolConfigs();

  const data = await loadFixture(governanceSetupFixture);
  // Currently only the main pool and one other weighted are used for testing purposes
  const poolFactories = await deployPoolFactories(data.vault.address, [
    "ERC4626LinearPoolFactory",
    "LiquidityBootstrappingPoolFactory",
    "StablePoolFactory",
  ]);

  const poolCreator = new PoolCreationService(ZERO_ADDRESS, poolFactories);
  await poolCreator.createPools();

  await doPoolInitJoins();

  return {
    ...data,
    poolFactories,
    pools: await getAllPoolConfigs(),
  };
}
