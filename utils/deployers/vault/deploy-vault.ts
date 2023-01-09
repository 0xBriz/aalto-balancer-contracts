import { ethers } from "hardhat";
import { deployAuthAdapter } from "../liquidity-mining/deploy-auth-adapter";
import { DAY, ONE_MONTH_SECONDS } from "../../../scripts/utils/time";
import { TOKENS } from "../../data/token-map";
import { logger } from "../logger";
import { saveDeploymentData } from "../save-deploy-data";

export async function setupVault(doSave: boolean) {
  try {
    await ethers.provider.ready;
    const admin = (await ethers.getSigners())[0];
    const chainId = ethers.provider.network.chainId;

    // This sequence breaks the circular dependency between authorizer, vault, adaptor and entrypoint.
    // First we deploy the vault, adaptor and entrypoint with a basic authorizer.

    const vaultData = await deployVault(TOKENS.NATIVE_TOKEN[chainId]); // Will deploy a dummy authorizer to start
    const authAdapterData = await deployAuthAdapter(vaultData.vault.address);
    const entryAdapterData = await deployAuthEntry(authAdapterData.authAdapter.address);

    // Then, with the entrypoint correctly deployed, we create the actual authorizer to be used and set it in the vault.
    const sigHash = vaultData.vault.interface.getSighash("setAuthorizer");
    const setAuthorizerActionId = await vaultData.vault.getActionId(sigHash);
    await vaultData.basicAuthorizer.contract.grantRolesToMany(
      [setAuthorizerActionId],
      [admin.address]
    );
    const authorizerData = await deployTimelock(
      admin.address,
      entryAdapterData.authEntryPoint.address
    );
    await vaultData.vault.connect(admin).setAuthorizer(authorizerData.authorizer.address);

    if (doSave === true) {
      await saveDeploymentData(vaultData.deployment);
      await saveDeploymentData(authorizerData.deployment);
      await saveDeploymentData(authAdapterData.deployment);
      await saveDeploymentData(entryAdapterData.deployment);
    }

    return {
      vaultData,
      authorizerData,
      authAdapterData,
      entryAdapterData,
    };
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
}

export async function deployVault(weth: string) {
  logger.info("Deploying MockBasicAuthorizer..");

  const MockBasicAuthorizer = await ethers.getContractFactory("MockBasicAuthorizer");
  let basicAuthorizer = await MockBasicAuthorizer.deploy();
  basicAuthorizer = await basicAuthorizer.deployed();

  // Set to max values
  const pauseWindowDuration = ONE_MONTH_SECONDS * 6;
  const bufferPeriodDuration = DAY * 90;
  logger.success(`MockBasicAuthorizer deployed to: ${basicAuthorizer.address}`);

  logger.info("Deploying Vault..");

  const Vault = await ethers.getContractFactory("Vault");
  // Use mock authorizer at first
  const vault = await Vault.deploy(
    basicAuthorizer.address,
    weth,
    pauseWindowDuration,
    bufferPeriodDuration
  );
  await vault.deployed();
  logger.success(`Vault deployed to: ${vault.address}`);

  // await saveDeplomentData("Vault", vault, vaultArgs);

  return {
    vault,
    basicAuthorizer: {
      name: "MockBasicAuthorizer",
      contract: basicAuthorizer,
      args: {},
    },
    deployment: {
      name: "Vault",
      contract: vault,
      args: {
        authorizer: basicAuthorizer.address, //  use original value for verification
        WETH: weth,
        pauseWindowDuration,
        bufferPeriodDuration,
      },
    },
  };
}

export async function deployTimelock(admin: string, entryAdapter: string) {
  logger.info("Deploying TimelockAuthorizer..");
  const rootTransferDelay = 0; // Timelock until root(admin/boss) status can be transferred
  const TimelockAuthorizer = await ethers.getContractFactory("TimelockAuthorizer");
  const authorizer = await TimelockAuthorizer.deploy(admin, entryAdapter, rootTransferDelay);
  await authorizer.deployed();
  logger.success(`TimelockAuthorizer deployed to: ${authorizer.address}`);

  return {
    authorizer,
    deployment: {
      name: "TimelockAuthorizer",
      contract: authorizer,
      args: { admin, entryAdapter, rootTransferDelay },
    },
  };
}

export async function deployAuthEntry(authAdapter: string) {
  try {
    logger.info("Deploying AuthorizerAdaptorEntrypoint..");

    const AuthorizerAdaptorEntrypoint = await ethers.getContractFactory(
      "AuthorizerAdaptorEntrypoint"
    );
    const authEntryPoint = await AuthorizerAdaptorEntrypoint.deploy(authAdapter);
    await authEntryPoint.deployed();
    logger.success(`AuthorizerAdaptorEntrypoint deployed to: ${authEntryPoint.address}`);

    return {
      authEntryPoint,
      deployment: {
        name: "AuthorizerAdaptorEntrypoint",
        contract: authEntryPoint,
        args: {
          authAdapter,
        },
      },
    };
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
}
