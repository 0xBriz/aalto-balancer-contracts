import { ethers } from "hardhat";
import { createPools } from "../utils/deployers/pools/create-pools";
import { deployPoolFactories } from "../utils/deployers/pools/deploy-factories";
import { deployVault } from "../utils/deployers/vault/deploy-vault";
import { deployLiquidityMining } from "../utils/deployers/liquidity-mining/setup-liquidity-mining";
import { getVault } from "../utils/contract-utils";
import { setupGovernance } from "../utils/deployers/liquidity-mining/governance/setup-governance";
import { getAllPoolConfigs, savePoolsData } from "../utils/services/pools/pool-utils";

export async function doCoreSystemDeployment(doSave: boolean) {
  await deployVault(doSave);
}

export async function handlePoolSetup(doSave: boolean) {
  await deployPoolFactories((await getVault()).address, doSave);
  await createPools(doSave);
}

async function resetAllPoolConfigs() {
  const pools = (await getAllPoolConfigs()).map((p) => {
    return {
      ...p,
      created: false,
    };
  });

  await savePoolsData(pools);
}

async function main() {
  try {
    await ethers.provider.ready;

    const saving = true;

    // await resetAllPoolConfigs();
    // await doCoreSystemDeployment(saving);
    await setupGovernance(saving);
    // Has to come after token is deployed for main pool creation
    // await  handlePoolSetup(saving)
    // await deployLiquidityMining(saving);
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
}

main();
