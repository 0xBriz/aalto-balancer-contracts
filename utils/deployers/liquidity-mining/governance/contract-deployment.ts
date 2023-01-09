import { deployContractUtil } from "../../deploy-util";
import { parseEther } from "ethers/lib/utils";
import { logger } from "../../logger";
import { saveDeploymentData } from "../../save-deploy-data";
import { getDeployedContractAddress } from "../../../contract-utils";
import { activateTokenAdmin, giveTokenAdminControl } from "./authorization";
import { BigNumber } from "ethers";

export async function setupGovernance() {
  try {
    logger.info("setupGovernance: initializing governance items");

    // const { govTokenData } = await createGovernanceToken();

    // const { tokenAdminData } = await createTokenAdmin();

    // // BalAdmin will take over all roles for the token
    // // Must happen before calling `active` on the token admin or it will always revert
    // await giveTokenAdminControl();

    // await activateTokenAdmin();

    // await saveDeploymentData(govTokenData.deployment);
    // await saveDeploymentData(tokenAdminData.deployment);

    logger.success("setupGovernance: governance setup complete");

    // return {
    //   govTokenData,
    //   tokenAdminData,
    // };
  } catch (error) {
    throw error;
  }
}

export async function createGovernanceToken() {
  logger.info("setupGovernance: creating governance token");

  const govTokenData = await deployContractUtil("GovernanceToken", {
    name: "Vertek",
    symbol: "VRTK",
  });

  await saveDeploymentData(govTokenData.deployment);

  logger.success("setupGovernance: governance token created");

  return govTokenData.contract;
}

export async function createTokenAdmin() {
  const tokenAdminData = await deployContractUtil("BalancerTokenAdmin", {
    vault: await getDeployedContractAddress("Vault"),
    balancerToken: await getDeployedContractAddress("GovernanceToken"),
    initialMintAllowance: parseEther("1250000"),
  });

  await saveDeploymentData(tokenAdminData.deployment);

  return {
    tokenAdminData,
  };
}

export async function createTokenAdminWithParams(
  vault: string,
  balancerToken: string,
  initialMintAllowance: BigNumber
) {
  const tokenAdminData = await deployContractUtil("BalancerTokenAdmin", {
    vault,
    balancerToken,
    initialMintAllowance,
  });

  await saveDeploymentData(tokenAdminData.deployment);

  return tokenAdminData.contract;
}
