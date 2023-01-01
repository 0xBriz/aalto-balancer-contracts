import { Contract } from "ethers";
import { getTimelockAuth } from "../contract-utils";
import { logger } from "../deployers/logger";
import { getSigner } from "../deployers/signers";
import { awaitTransactionComplete } from "../tx-utils";

class AuthService {
  constructor() {}

  async giveVaultAuthorization(
    contractGrantingOn: Contract,
    functionName: string,
    permissionFor?: string
  ) {
    const authorizer = await getTimelockAuth();
    const signer = await getSigner();

    const grantingFor = permissionFor ? permissionFor : signer.address;
    const contractAddressBeingGranted = contractGrantingOn.address;
    logger.info(
      `giveVaultAuthorization: Granting permission for function ${functionName} on contract ${contractAddressBeingGranted} for account ${grantingFor}`
    );

    const selector = contractGrantingOn.interface.getSighash(functionName);
    // Will throw if busted contract reference is given
    const actionId = await contractGrantingOn.getActionId(selector);

    awaitTransactionComplete(
      await authorizer.grantPermissions([actionId], grantingFor, [contractAddressBeingGranted])
    );

    const authorized = await authorizer.canPerform(
      actionId,
      signer.address,
      contractAddressBeingGranted
    );

    // Tx could fail but maybe we missed or jacked something up along the way
    if (!authorized) {
      throw new Error(
        `Error setting vault auth permissions for contractGrantingOn=${contractAddressBeingGranted}, function=${functionName}`
      );
    }

    logger.success("giveVaultAuthorization: permission granted");
  }
}

export const authService = new AuthService();
