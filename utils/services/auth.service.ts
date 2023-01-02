import { Contract } from "ethers";
import { getTimelockAuth } from "../contract-utils";
import { logger } from "../deployers/logger";
import { awaitTransactionComplete } from "../tx-utils";

export class AuthService {
  constructor(public readonly timelockAuthAddress: string) {}

  async giveVaultAuthorization(
    contractGrantingOn: Contract,
    functionName: string,
    permissionFor: string,
    doCheckAfter = true
  ) {
    const authorizer = await getTimelockAuth(this.timelockAuthAddress);
    const contractAddressBeingGranted = contractGrantingOn.address;

    logger.info(
      `giveVaultAuthorization: Granting permission for function ${functionName} on contract ${contractAddressBeingGranted} for account ${permissionFor}`
    );

    const selector = contractGrantingOn.interface.getSighash(functionName);
    // Will throw if busted contract reference is given
    const actionId = await contractGrantingOn.getActionId(selector);

    awaitTransactionComplete(
      await authorizer.grantPermissions([actionId], permissionFor, [contractAddressBeingGranted]),
      10
    );

    if (doCheckAfter) {
      const authorized = await authorizer.hasPermission(
        actionId,
        permissionFor,
        contractAddressBeingGranted
      );

      // Tx could fail but maybe we missed or jacked something up along the way
      if (!authorized) {
        throw new Error(
          `Error setting vault auth permissions for contractGrantingOn=${contractAddressBeingGranted}, function=${functionName}`
        );
      }
    }

    logger.success("giveVaultAuthorization: permission granted");
  }
}
