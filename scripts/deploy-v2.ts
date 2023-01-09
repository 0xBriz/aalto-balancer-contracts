import { ethers } from "hardhat";
import { deployPoolFactories } from "../utils/deployers/pools/deploy-factories";
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
import { doPoolsCreation } from "../utils/deployers/pools/pool-creation";
import { Logger } from "../utils/deployers/logger";
import { PoolFactoryInfo } from "../utils/types";

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

    Logger.setDefaults(false, false);

    const vaultData = await setupVault();
    const govData = await setupGovernance({
      timelockAuth: vaultData.timelockAuth.address,
      vault: vaultData.vault.address,
      adminAccount: await getChainAdmin(),
    });

    // const vault = "0x00c0402bde9e2c2962ca7586a5dabb38fad515a8";

    const factories = await deployPoolFactories(vaultData.vault.address, [
      "ERC4626LinearPoolFactory",
      "LiquidityBootstrappingPoolFactory",
      "StablePoolFactory",
    ]);

    const poolCreator = new PoolCreationService(ZERO_ADDRESS, factories);
    await poolCreator.createPools();

    // const poolsData = await doPoolsCreation(vault, [
    //   "ERC4626LinearPoolFactory",
    //   "LiquidityBootstrappingPoolFactory",
    // ]);

    // await doPoolInitJoins();

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

    // await deployPoolFactories(saving, await getDeployedContractAddress("Vault"));
    // const poolCreator = new PoolCreationService(ZERO_ADDRESS, await getPoolFactories());
    // await poolCreator.createPools(saving);

    // await doPoolInitJoins();

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
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
}

main();
