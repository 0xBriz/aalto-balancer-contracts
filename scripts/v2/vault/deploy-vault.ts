import { ethers } from "hardhat";
import { deployAuthAdapter } from "../../utils/lp-mining/deploy-auth-adapter";
import { saveDeplomentData } from "../../utils/save-deploy-data";
import { DAY, ONE_MONTH_SECONDS } from "../../utils/time";

export async function deployVault(WETH: string) {
  try {
    const admin = (await ethers.getSigners())[0];
    const chainId = ethers.provider.network.chainId;

    // This sequence breaks the circular dependency between authorizer, vault, adaptor and entrypoint.
    // First we deploy the vault, adaptor and entrypoint with a basic authorizer.

    const { vault, basicAuthorizer } = await doVault(chainId, WETH); // Will deploy a dummy authorizer to start
    const authAdapter = await deployAuthAdapter(vault.address);
    const entryAdapter = await deployAuthEntry(authAdapter.address, chainId);

    // Then, with the entrypoint correctly deployed, we create the actual authorizer to be used and set it in the vault.
    const sigHash = vault.interface.getSighash("setAuthorizer");
    const setAuthorizerActionId = await basicAuthorizer.getActionId(sigHash);
    await basicAuthorizer.grantRolesToMany([setAuthorizerActionId], [admin.address]);
    const vaultAuthorizer = await deployTimelock(chainId, admin.address, entryAdapter.address);
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

async function doVault(chainId: number, weth: string) {
  const MockBasicAuthorizer = await ethers.getContractFactory("MockBasicAuthorizer");
  const basicAuthorizer = await MockBasicAuthorizer.deploy();

  // Set to max values
  const pauseWindowDuration = ONE_MONTH_SECONDS * 3;
  const bufferPeriodDuration = DAY * 30;

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
    chainId,
    authorizer: basicAuthorizer.address, //  use original value
    WETH: weth,
    pauseWindowDuration,
    bufferPeriodDuration,
  };
  console.log("vaultArgs:");
  console.log(vaultArgs);

  await saveDeplomentData("Vault", vaultArgs, chainId);
  return {
    vault,
    basicAuthorizer,
  };
}

async function deployTimelock(chainId: number, admin: string, entryAdapter: string) {
  // AUTH
  const rootTransferDelay = 0; // Timelock until root(admin/boss) status can be transferred
  const TimelockAuthorizer = await ethers.getContractFactory("TimelockAuthorizer");
  const authorizer = await TimelockAuthorizer.deploy(admin, entryAdapter, rootTransferDelay);
  await authorizer.deployed();
  console.log("TimelockAuthorizer deployed to: ", authorizer.address);

  const authArgs = {
    chainId,
    admin: admin,
    rootTransferDelay,
    entryAdapter,
  };

  await saveDeplomentData("TimelockAuthorizer", authArgs, chainId);

  return authorizer;
}

export async function deployAuthEntry(authAdapter: string, chainId: number) {
  try {
    const AuthorizerAdaptorEntrypoint = await ethers.getContractFactory(
      "AuthorizerAdaptorEntrypoint"
    );
    const ct = await AuthorizerAdaptorEntrypoint.deploy(authAdapter);
    await ct.deployed();
    console.log("AuthorizerAdaptorEntrypoint deployed to: ", ct.address);

    await saveDeplomentData(
      "AuthorizerAdaptorEntrypoint",
      {
        authAdapter,
      },
      chainId
    );

    return ct;
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
}
