import {
  getBalTokenAdmin,
  getGovernanceToken,
  getDeployedContractAddress,
} from "../../../contract-utils";
import { AuthService } from "../../../services/auth.service";
import { awaitTransactionComplete } from "../../../tx-utils";
import { logger } from "../../logger";
import { getSigner } from "../../signers";

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

  logger.info("setupGovernance: activating token admin");
  await awaitTransactionComplete(await tokenAdmin.activate(address));
  logger.success("setupGovernance: token admin activated");
}

// Must happen before calling `activate` on the token admin or it will always revert
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
