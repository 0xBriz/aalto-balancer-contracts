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

export async function setupGovernance(doSave: boolean, vault: string, timelockAuth: string) {
  try {
    logger.info("setupGovernance: initializing governance items");

    const { govTokenData } = await createGovernanceToken();

    const { tokenAdminData } = await createTokenAdmin(vault, govTokenData.contract.address);

    await activateTokenAdmin(tokenAdminData.contract, timelockAuth);

    // BalAdmin will take over all roles for the token
    await giveTokenAdminControl(govTokenData.contract, tokenAdminData.contract.address);

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

  // Set the new token address for use in pool creation and such later
  const vePool = await getMainPoolConfig();
  let hadSymbol = false;
  vePool.tokenInfo = vePool.tokenInfo.map((ti) => {
    if (ti.symbol === "VRTK") {
      hadSymbol = true;
      return {
        ...ti,
        address: govTokenData.contract.address,
      };
    }

    return ti;
  });

  if (!hadSymbol) {
    throw new Error("Missing VRTK symbol for ve pool");
  }

  await updatePoolConfig(vePool);

  logger.success("setupGovernance: governance token created");

  return { govTokenData };
}

export async function createTokenAdmin(vault: string, govToken: string) {
  const tokenAdminData = await deployContractUtil("BalancerTokenAdmin", {
    vault,
    balancerToken: govToken,
    initialMintAllowance: parseEther("1250000"),
  });

  return {
    tokenAdminData,
  };
}

export async function activateTokenAdmin(tokenAdmin: Contract, timelockAuth: string) {
  const address = (await getSigner()).address;
  // const authService = new AuthService(timelockAuth);
  // await authService.giveVaultAuthorization(
  //   tokenAdmin,
  //   "activate",
  //   (
  //     await getSigner()
  //   ).address,
  //   false
  // );
  // Has to happen before activate
  //  await giveTokenAdminControl()
  logger.info("setupGovernance: activating token admin");
  await awaitTransactionComplete(await tokenAdmin.activate(address), 10);
  logger.success("setupGovernance: token admin activated");
}

export async function giveTokenAdminControl(govToken: Contract, tokenAdminAddress: string) {
  logger.info("setupGovernance: giving token admin default admin role");
  await awaitTransactionComplete(
    await govToken.grantRole(await govToken.DEFAULT_ADMIN_ROLE(), tokenAdminAddress)
  );
  logger.success("setupGovernance: role granted");
}
