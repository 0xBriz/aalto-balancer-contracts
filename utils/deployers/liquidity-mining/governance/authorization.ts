import {
  getBalTokenAdmin,
  getGovernanceToken,
  getDeployedContractAddress,
  getGovernanceTokenByAddress,
  getBalTokenAdminByAddress,
  getTimelockAuth,
  getTimelockAuthByAddress,
} from "../../../contract-utils";
import { getChainAdmin } from "../../../data/addresses";
import { AuthService } from "../../../services/auth.service";
import { awaitTransactionComplete } from "../../../tx-utils";
import { logger } from "../../logger";
import { getSigner } from "../../signers";

// Must happen before calling `activate` on the token admin or it will always revert
export async function giveTokenAdminControl(govTokenAddress: string, tokenAdmin: string) {
  logger.info("setupGovernance: giving token admin default admin role");
  const govToken = await getGovernanceTokenByAddress(govTokenAddress);
  await awaitTransactionComplete(
    await govToken.grantRole(await govToken.DEFAULT_ADMIN_ROLE(), tokenAdmin)
  );
  logger.success("setupGovernance: role granted");
}

// Give token admin default admin role with `giveTokenAdminControl` before trying to activate
export async function activateTokenAdmin(
  tokenAdminAddress: string,
  authorizer: string,
  adminMintReceiver: string
) {
  logger.info("setupGovernance: activating token admin");

  const tokenAdmin = await getBalTokenAdminByAddress(tokenAdminAddress);
  const timelockAuth = await getTimelockAuthByAddress(authorizer);
  // grant admin permission to activate the token admin
  const actionId = await tokenAdmin.getActionId(tokenAdmin.interface.getSighash("activate"));
  await awaitTransactionComplete(
    await timelockAuth.grantPermissions([actionId], adminMintReceiver, [tokenAdmin.address])
  );
  await awaitTransactionComplete(await tokenAdmin.activate(adminMintReceiver));

  logger.success("setupGovernance: token admin activated");
}
