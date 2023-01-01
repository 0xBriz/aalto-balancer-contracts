import { deployContractUtil } from "../../deploy-util";
import { parseEther } from "ethers/lib/utils";
import { getDeployedContractAddress } from "../../../contract-utils";
import { ADMIN } from "../../../data/addresses";
import { getChainId } from "../../network";
import { logger } from "../../logger";
import { awaitTransactionComplete } from "../../../tx-utils";
import { authService } from "../../../services/auth.service";
import { saveDeplomentData } from "../../save-deploy-data";
import { getMainPoolConfig, updatePoolConfig } from "../../../services/pools/pool-utils";

export async function setupGovernance(doSave: boolean) {
  try {
    logger.info("setupGovernance: initializing governance items");

    // TODO: Main pool cant be created until this..
    const govTokenData = await deployContractUtil("GovernanceToken", {
      name: "Vertek",
      symbol: "VRTK",
    });

    // Set the new token address for use in pool creation and such later
    const vePool = await getMainPoolConfig();
    vePool.tokenInfo = vePool.tokenInfo.map((ti) => {
      if (ti.symbol === "VRTK") {
        return {
          ...ti,
          address: govTokenData.contract.address,
        };
      }

      return ti;
    });
    await updatePoolConfig(vePool);

    const tokenAdminData = await deployContractUtil("BalancerTokenAdmin", {
      vault: await getDeployedContractAddress("Vault"),
      balancerToken: govTokenData.contract.address,
      initialMintAllowance: parseEther("1250000"),
    });

    /**
     * Need to grant the deployer dev account permissions on the vault authorizer in order
     * to call the activate function on the BalTokenAdmin contract.(After initial mints)
     */
    await authService.giveVaultAuthorization(tokenAdminData.contract, "activate");

    logger.info("setupGovernance: giving token admin default admin role");

    // BalAdmin will take over all roles for the token
    awaitTransactionComplete(
      await govTokenData.contract.grantRole(
        await govTokenData.contract.DEFAULT_ADMIN_ROLE(),
        tokenAdminData.contract.address
      )
    );

    logger.success("setupGovernance: role granted");

    logger.info("setupGovernance: activating token admin");

    awaitTransactionComplete(await tokenAdminData.contract.activate(ADMIN[await getChainId()]));

    if (doSave) {
      await Promise.all([
        saveDeplomentData(govTokenData.deployment),
        saveDeplomentData(tokenAdminData.deployment),
      ]);
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
