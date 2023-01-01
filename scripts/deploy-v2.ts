import { ethers } from "hardhat";
import { createPools } from "../utils/deployers/pools/create-pools";
import { deployPoolFactories } from "../utils/deployers/pools/deploy-factories";
import { deployVault } from "../utils/deployers/vault/deploy-vault";
import { deployLiquidityMining } from "../utils/deployers/liquidity-mining/setup-liquidity-mining";
import { deployContractUtil } from "../utils/deployers/deploy-util";
import { getVault } from "../utils/contract-utils";
import { setupGovernance } from "../utils/deployers/liquidity-mining/governance/setup-governance";
import { getPoolConfigs, savePoolsData } from "../utils/services/pools/pool-utils";

export async function doCoreSystemDeployment(doSave: boolean) {
  await ethers.provider.ready;
  const chainId = ethers.provider.network.chainId;
  // deploy vault system
  // deploy factories
  // create pools
  // setup liquidity mining system components
  // do any auth items along the way

  const { vaultData } = await deployVault(doSave);
}

export async function handlePoolSetup(doSave: boolean) {
  await deployPoolFactories((await getVault()).address, doSave);
  await createPools(doSave);
}

async function resetAllPoolConfigs() {
  const pools = (await getPoolConfigs()).map((p) => {
    return {
      ...p,
      created: false,
    };
  });

  await savePoolsData(pools);
}

async function main() {
  try {
    const saving = true;

    await resetAllPoolConfigs();
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
