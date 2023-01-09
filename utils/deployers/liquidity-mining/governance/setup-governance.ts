import { deployContractUtil } from "../../deploy-util";
import { parseEther } from "ethers/lib/utils";
import { ADMIN } from "../../../data/addresses";
import { getChainId } from "../../network";
import { logger } from "../../logger";
import { awaitTransactionComplete } from "../../../tx-utils";
import { AuthService } from "../../../services/auth.service";
import { saveDeplomentData } from "../../save-deploy-data";
import { getMainPoolConfig, updatePoolConfig } from "../../../services/pools/pool-utils";
import { getSigner } from "../../signers";
import { Contract } from "ethers";
import {
  getBalTokenAdmin,
  getDeployedContractAddress,
  getGovernanceToken,
} from "../../../contract-utils";

export async function setupGovernance(doSave: boolean) {
  try {
    logger.info("setupGovernance: initializing governance items");

    const { govTokenData } = await createGovernanceToken();

    const { tokenAdminData } = await createTokenAdmin();

    // BalAdmin will take over all roles for the token
    // Must happen before calling `active` on the token admin or it will always revert
    await giveTokenAdminControl();

    await activateTokenAdmin();

    if (doSave === true) {
      await saveDeplomentData(govTokenData.deployment);
      await saveDeplomentData(tokenAdminData.deployment);
    }

    logger.success("setupGovernance: governance setup complete");

    return {
      govTokenData,
      tokenAdminData,
    };
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}

export async function createGovernanceToken() {
  logger.info("setupGovernance: creating governance token");

  const govTokenData = await deployContractUtil("GovernanceToken", {
    name: "Vertek",
    symbol: "VRTK",
  });

  await saveDeplomentData(govTokenData.deployment);

  logger.success("setupGovernance: governance token created");

  return { govTokenData };
}

export async function updateMainPoolConfigForGovToken() {
  const govTokenAddress = await getDeployedContractAddress("GovernanceToken");
  // Set the new token address for use in pool creation and such later
  const vePool = await getMainPoolConfig();
  let hadSymbol = false;
  vePool.tokenInfo = vePool.tokenInfo.map((ti) => {
    if (ti.symbol === "VRTK") {
      hadSymbol = true;
      return {
        ...ti,
        address: govTokenAddress,
      };
    }

    return ti;
  });

  if (!hadSymbol) {
    throw new Error("Missing VRTK symbol for ve pool");
  }

  await updatePoolConfig(vePool);
}

export async function createTokenAdmin() {
  const tokenAdminData = await deployContractUtil("BalancerTokenAdmin", {
    vault: await getDeployedContractAddress("Vault"),
    balancerToken: await getDeployedContractAddress("GovernanceToken"),
    initialMintAllowance: parseEther("1250000"),
  });

  await saveDeplomentData(tokenAdminData.deployment);

  return {
    tokenAdminData,
  };
}

// Give token admin default admin role with `giveTokenAdminControl` before trying to activate
export async function activateTokenAdmin() {
  const tokenAdmin = await getBalTokenAdmin();
  const address = (await getSigner()).address;
  const authService = new AuthService();
  await authService.giveVaultAuthorization(
    tokenAdmin,
    "activate",
    (
      await getSigner()
    ).address,
    false
  );
  // Has to happen before activate
  await giveTokenAdminControl();
  logger.info("setupGovernance: activating token admin");
  await awaitTransactionComplete(await tokenAdmin.activate(address), 10);
  logger.success("setupGovernance: token admin activated");
}

// Must happen before calling `active` on the token admin or it will always revert
export async function giveTokenAdminControl() {
  logger.info("setupGovernance: giving token admin default admin role");
  const govToken = await getGovernanceToken();
  await awaitTransactionComplete(
    await govToken.grantRole(
      await govToken.DEFAULT_ADMIN_ROLE(),
      await getDeployedContractAddress("BalancerTokenAdmin")
    )
  );
  logger.success("setupGovernance: role granted");
}
