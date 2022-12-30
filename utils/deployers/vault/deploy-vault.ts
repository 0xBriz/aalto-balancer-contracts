import { ethers } from "hardhat";
import { deployAuthAdapter } from "../liquidity-mining/deploy-auth-adapter";
import { saveDeplomentData } from "../../save-deploy-data";
import { DAY, ONE_MONTH_SECONDS } from "../../../scripts/utils/time";
import { TOKENS } from "../../data/token-map";
import { Contract } from "ethers";

export async function deployVault() {
  try {
    await ethers.provider.ready;
    const admin = (await ethers.getSigners())[0];
    const chainId = ethers.provider.network.chainId;

    // This sequence breaks the circular dependency between authorizer, vault, adaptor and entrypoint.
    // First we deploy the vault, adaptor and entrypoint with a basic authorizer.

    const { vault, basicAuthorizer } = await doVault(TOKENS.NATIVE_TOKEN[chainId]); // Will deploy a dummy authorizer to start
    const authAdapter = await deployAuthAdapter(vault.address);
    const entryAdapter = await deployAuthEntry(authAdapter.address);

    // Then, with the entrypoint correctly deployed, we create the actual authorizer to be used and set it in the vault.
    const sigHash = vault.interface.getSighash("setAuthorizer");
    const setAuthorizerActionId = await vault.getActionId(sigHash);
    await basicAuthorizer.grantRolesToMany([setAuthorizerActionId], [admin.address]);
    const vaultAuthorizer = await deployTimelock(admin.address, entryAdapter.address);
    await vault.connect(admin).setAuthorizer(vaultAuthorizer.address);

    return {
      vault,
      vaultAuthorizer,
      authAdapter,
      entryAdapter,
    };
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
}

async function doVault(weth: string) {
  const MockBasicAuthorizer = await ethers.getContractFactory("MockBasicAuthorizer");
  let basicAuthorizer = await MockBasicAuthorizer.deploy();
  basicAuthorizer = await basicAuthorizer.deployed();

  await saveDeplomentData("MockBasicAuthorizer", basicAuthorizer);

  // Set to max values
  const pauseWindowDuration = ONE_MONTH_SECONDS * 6;
  const bufferPeriodDuration = DAY * 90;

  const Vault = await ethers.getContractFactory("Vault");
  // Use mock authorizer at first
  const vault = await Vault.deploy(
    basicAuthorizer.address,
    weth,
    pauseWindowDuration,
    bufferPeriodDuration
  );
  await vault.deployed();
  console.log("Vault deployed to: ", vault.address);

  const vaultArgs = {
    authorizer: basicAuthorizer.address, //  use original value for verification
    WETH: weth,
    pauseWindowDuration,
    bufferPeriodDuration,
  };

  await saveDeplomentData("Vault", vault, vaultArgs);

  return {
    vault,
    basicAuthorizer,
  };
}

export async function deployTimelock(admin: string, entryAdapter: string) {
  // AUTH
  const rootTransferDelay = 0; // Timelock until root(admin/boss) status can be transferred
  const TimelockAuthorizer = await ethers.getContractFactory("TimelockAuthorizer");
  const authorizer = await TimelockAuthorizer.deploy(admin, entryAdapter, rootTransferDelay);
  await authorizer.deployed();
  console.log("TimelockAuthorizer deployed to: ", authorizer.address);

  await saveDeplomentData("TimelockAuthorizer", authorizer, {
    admin,
    entryAdapter,
    rootTransferDelay,
  });

  return authorizer;
}

export async function deployAuthEntry(authAdapter: string) {
  try {
    const AuthorizerAdaptorEntrypoint = await ethers.getContractFactory(
      "AuthorizerAdaptorEntrypoint"
    );
    const authorizer = await AuthorizerAdaptorEntrypoint.deploy(authAdapter);
    await authorizer.deployed();
    console.log("AuthorizerAdaptorEntrypoint deployed to: ", authorizer.address);

    await saveDeplomentData("AuthorizerAdaptorEntrypoint", authorizer, {
      authAdapter,
    });

    return authorizer;
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
}
