import { ethers } from "hardhat";
import { deployPoolFactories } from "../utils/deployers/deploy-factories";
import { setupVault } from "../utils/deployers/vault/deploy-vault";
import { deployLiquidityMining } from "../utils/deployers/liquidity-mining/setup-liquidity-mining";
import {
  getBalTokenAdmin,
  getDeployedContractAddress,
  getERC20,
  getGovernanceToken,
  getVault,
} from "../utils/contract-utils";
import {
  createGovernanceToken,
  createTokenAdmin,
  setupGovernance,
} from "../utils/deployers/liquidity-mining/governance/contract-deployment";
import {
  getAllPoolConfigs,
  getPoolFactories,
  savePoolsData,
  updatePoolConfig,
} from "../utils/services/pools/pool-utils";
import { PoolCreationService } from "../utils/services/pools/pool-creation.service";
import { ZERO_ADDRESS } from "./utils/constants";
import {
  addFeeDistributor,
  doVeDeposit,
  setupVotingEscrow,
} from "../utils/deployers/liquidity-mining/setup-voting-escrow";
import { initWeightedJoin } from "../utils/pool/pool-utils";
import { getChainAdmin } from "../utils/data/addresses";
import { formatEther } from "ethers/lib/utils";
import { saveDeploymentData } from "../utils/deployers/save-deploy-data";
import {
  addGaugeController,
  // addPoolGaugesToController,
  addGaugeTypes,
  addMainPoolGaugeSetup,
  addVeBalHelpers,
  createPoolGaugesAndAddToController,
  deployLiquidityGaugeFactorySetup,
  deployMinter,
  giveMinterPermissions,
  setupBoostProxy,
} from "../utils/deployers/liquidity-mining/gauges/setup-gauges";
import { setGaugeRewardDistributor } from "../utils/deployers/liquidity-mining/gauges/gauge-utils";

// For testing/dev env
export async function resetAllPoolConfigs() {
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

    // const { vaultData, authorizerData } = await setupVault();
    // const { govTokenData } = await createGovernanceToken();
    // await updateMainPoolConfigForGovToken()
    // await saveDeplomentData(govTokenData.deployment);
    // const { tokenAdminData } = await createTokenAdmin(
    //   await getDeployedContractAddress("Vault"),
    //   await getDeployedContractAddress("GovernanceToken")
    // );
    // await saveDeplomentData(tokenAdminData.deployment);

    // Has to happen before activate
    // await giveTokenAdminControl(
    //   await getGovernanceToken(),
    //   await getDeployedContractAddress("BalancerTokenAdmin")
    // );

    // const admin = await getBalTokenAdmin();
    // await activateTokenAdmin(admin, await getDeployedContractAddress("TimelockAuthorizer"));

    //await deployPoolFactories(saving, await getDeployedContractAddress("Vault"));
    // const poolCreator = new PoolCreationService(ZERO_ADDRESS, await getPoolFactories());
    // poolCreator.createPools(saving);

    // const pools = await getAllPoolConfigs();
    // for (const pool of pools) {
    //   if (pool.initJoinComplete) {
    //     continue;
    //   }
    //   await initWeightedJoin(
    //     pool.poolId,
    //     pool.deploymentArgs.tokens,
    //     pool.initialBalances,
    //     await getChainAdmin()
    //   );

    //   pool.initJoinComplete = true;
    //   await updatePoolConfig(pool);
    // }

    // await setupVotingEscrow();
    // await doVeDeposit();
    // await addFeeDistributor();
    // await addGaugeController();
    // await addVeBalHelpers();
    // await addGaugeTypes();
    // await deployMinter();
    // await giveMinterPermissions();
    // await setupBoostProxy();
    // await deployLiquidityGaugeFactorySetup();
    // await addMainPoolGaugeSetup();
    // await createPoolGaugesAndAddToController();
    //

    await setGaugeRewardDistributor(
      "0xcfD9570A037AAD79B2d1B64652eC9a20495dE42b",
      "0x7c85523739053769278a1E5b1F39389b0e5CF539",
      await getChainAdmin()
    );
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
}

main();
