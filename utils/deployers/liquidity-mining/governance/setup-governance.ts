import { deployContractUtil } from "../../deploy-util";
import { parseEther } from "ethers/lib/utils";
import { getDeployedContractAddress, getTimelockAuth } from "../../../contract-utils";
import { getSigner } from "../../signers";
import { ADMIN } from "../../../data/addresses";
import { getChainId } from "../../network";
import { logger } from "../../logger";
import { awaitTransactionComplete } from "../../../tx-utils";

export async function setupGovernance() {
  try {
    logger.info("setupGovernance: initializing governance items");
    const govTokenData = await deployContractUtil("GovernanceToken", {
      name: "Vertek",
      symbol: "VRTK",
    });

    const tokenAdminData = await deployContractUtil("BalancerTokenAdmin", {
      vault: await getDeployedContractAddress("Vault"),
      balancerToken: govTokenData.contract.address,
      initialMintAllowance: parseEther("1250000"),
    });

    const authorizer = await getTimelockAuth();

    /**
     * Need to grant the deployer dev account permissions on the vault authorizer in order
     * to call the activate function on the BalTokenAdmin contract.(After initial mints)
     */
    const signer = await getSigner();
    const selector = tokenAdminData.contract.interface.getSighash("activate");
    const actionId = await tokenAdminData.contract.getActionId(selector);

    logger.info("setupGovernance: granting token admin activate permission");
    awaitTransactionComplete(
      await authorizer.grantPermissions([actionId], signer.address, [
        tokenAdminData.contract.address,
      ]),
      5
    );
    const authorized = await authorizer.canPerform(
      actionId,
      signer.address,
      tokenAdminData.contract.address
    );

    // Tx could fail but maybe we missed or jacked something up along the way
    if (!authorized) {
      throw new Error('"Adding token admin permissions failed"');
    }

    logger.success("setupGovernance: permission granted");
    logger.info("setupGovernance: granting token admin default admin role");
    // BalAdmin will take over all roles for the token
    awaitTransactionComplete(
      await govTokenData.contract.grantRole(
        await govTokenData.contract.DEFAULT_ADMIN_ROLE(),
        tokenAdminData.contract.address
      ),
      5
    );

    logger.success("setupGovernance: role granted");

    logger.info("setupGovernance: activating token admin");
    awaitTransactionComplete(await tokenAdminData.contract.activate(ADMIN[await getChainId()]));

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
