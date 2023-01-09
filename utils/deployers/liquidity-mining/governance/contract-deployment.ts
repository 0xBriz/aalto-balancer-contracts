import { deployContractUtil } from "../../deploy-util";
import { parseEther } from "ethers/lib/utils";
import { logger } from "../../logger";
import { saveDeploymentData } from "../../save-deploy-data";
import { getDeployedContractAddress } from "../../../contract-utils";
import { activateTokenAdmin, giveTokenAdminControl } from "./authorization";
import { BigNumber } from "ethers";

export async function setupGovernance(addresses: {
  timelockAuth: string;
  adminAccount: string;
  vault: string;
}) {
  try {
    logger.info("setupGovernance: initializing governance items");

    const govToken = await createGovernanceToken();

    const tokenAdmin = await createTokenAdmin(
      addresses.vault,
      govToken.address,
      parseEther("1250000")
    );

    // BalAdmin will take over all roles for the token
    // Must happen before calling `active` on the token admin or it will always revert
    await giveTokenAdminControl(govToken.address, tokenAdmin.address);

    await activateTokenAdmin(tokenAdmin.address, addresses.timelockAuth, addresses.adminAccount);

    logger.success("setupGovernance: governance setup complete");

    return {
      govToken,
      tokenAdmin,
    };
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

export async function createTokenAdmin(
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
