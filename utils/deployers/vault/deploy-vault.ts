import { ethers } from "hardhat";
import { DAY, ONE_MONTH_SECONDS } from "../../../scripts/utils/time";
import { TOKENS } from "../../data/token-map";
import { logger } from "../logger";
import { saveDeploymentData } from "../save-deploy-data";
import { deployContractUtil } from "../deploy-util";
import { getDeployedContractAddress, getVault } from "../../contract-utils";
import { Contract } from "ethers";
import { getSigner } from "../signers";
import { getChainWETH } from "../../token/token-utils";
import { awaitTransactionComplete } from "../../tx-utils";

export async function setupVault() {
  try {
    await ethers.provider.ready;
    const admin = await getSigner();

    // This sequence breaks the circular dependency between authorizer, vault, adaptor and entrypoint.
    // First we deploy the vault, adaptor and entrypoint with a basic authorizer.

    // Will deploy a dummy authorizer to start
    const { vault, basicAuthorizer } = await deployVault(await getChainWETH());
    const authAdapterData = await deployAuthAdapter(vault.address);
    const { authEntryPoint } = await deployAuthEntryPointAdapter(
      authAdapterData.authAdapter.address
    );
    const { timelockAuth } = await deployTimelockAuth(admin.address, authEntryPoint.address);

    // Then, with the entrypoint correctly deployed, we create the actual authorizer to be used and set it in the vault.
    await setProperAuthorizerForVault(timelockAuth.address);

    return {
      vault,
      timelockAuth,
      authAdapterData,
      authEntryPoint,
      basicAuthorizer,
    };
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
}

// Broken out for testing. Assumses previous required steps are complete
export async function setProperAuthorizerForVault(timelockAuth: string) {
  const admin = await getSigner();

  const vault = await getVault();
  const basicAuthorizer = new Contract(
    await getDeployedContractAddress("MockBasicAuthorizer"),
    ["function grantRolesToMany(bytes32[] memory roles, address[] memory accounts) external"],
    admin
  );

  const setAuthorizerActionId = await vault.getActionId(
    vault.interface.getSighash("setAuthorizer")
  );
  await awaitTransactionComplete(
    await basicAuthorizer.grantRolesToMany([setAuthorizerActionId], [admin.address])
  );

  await vault.connect(admin).setAuthorizer(timelockAuth);
}

export async function deployVault(weth: string) {
  logger.info("Deploying MockBasicAuthorizer..");

  const authDeployment = await deployContractUtil("MockBasicAuthorizer", {});

  // Set to max values
  const pauseWindowDuration = ONE_MONTH_SECONDS * 6;
  const bufferPeriodDuration = DAY * 90;

  const vaultDeployment = await deployContractUtil("Vault", {
    authorizer: authDeployment.contract.address, //  use original value for verification
    WETH: weth,
    pauseWindowDuration,
    bufferPeriodDuration,
  });

  await Promise.all([
    saveDeploymentData(vaultDeployment.deployment),
    saveDeploymentData(authDeployment.deployment),
  ]);

  return {
    vault: vaultDeployment.contract,
    basicAuthorizer: authDeployment.contract,
  };
}

export async function deployTimelockAuth(admin: string, entryAdapter: string) {
  const rootTransferDelay = 0; // Timelock until root(admin/boss) status can be transfered
  const authDeployment = await deployContractUtil("TimelockAuthorizer", {
    admin,
    entryAdapter,
    rootTransferDelay,
  });

  await saveDeploymentData(authDeployment.deployment);

  return {
    timelockAuth: authDeployment.contract,
  };
}

export async function deployAuthEntryPointAdapter(authAdapter: string) {
  try {
    const authDeployment = await deployContractUtil("AuthorizerAdaptorEntrypoint", {
      authAdapter,
    });

    await saveDeploymentData(authDeployment.deployment);

    return {
      authEntryPoint: authDeployment.contract,
    };
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
}

export async function deployAuthAdapter(vault: string) {
  try {
    const authDeployment = await deployContractUtil("AuthorizerAdaptor", {
      vault,
    });

    await saveDeploymentData(authDeployment.deployment);

    return {
      authAdapter: authDeployment.contract,
    };
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
}
