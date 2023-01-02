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

    const tokenAdminData = await deployContractUtil("BalancerTokenAdmin", {
      vault,
      balancerToken: govTokenData.contract.address,
      initialMintAllowance: parseEther("1250000"),
    });

    logger.info("setupGovernance: giving token admin default admin role");

    // BalAdmin will take over all roles for the token
    awaitTransactionComplete(
      await govTokenData.contract.grantRole(
        await govTokenData.contract.DEFAULT_ADMIN_ROLE(),
        tokenAdminData.contract.address
      )
    );

    logger.success("setupGovernance: role granted");

    /**
     * Need to grant the deployer dev account permissions on the vault authorizer in order
     * to call the activate function on the BalTokenAdmin contract
     */

    await activateTokenAdmin(tokenAdminData.contract, timelockAuth);

    if (doSave) {
      saveDeplomentData(govTokenData.deployment);
      saveDeplomentData(tokenAdminData.deployment);
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

async function activateTokenAdmin(tokenAdmin: Contract, timelockAuth: string) {
  /**
   * Need to grant the deployer dev account permissions on the vault authorizer in order
   * to call the activate function on the BalTokenAdmin contract
   */

  const authService = new AuthService(timelockAuth);
  await authService.giveVaultAuthorization(
    tokenAdmin,
    "activate",
    (
      await getSigner()
    ).address,
    false
  );
  logger.info("setupGovernance: activating token admin");
  awaitTransactionComplete(await tokenAdmin.activate(ADMIN[await getChainId()]), 10);
  logger.success("setupGovernance: token admin activated");
}
