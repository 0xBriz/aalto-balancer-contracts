import { Contract } from "ethers";
import { getAutEntryAdapter, getDeployedContractAddress, getTimelockAuth } from "../contract-utils";
import { getChainAdmin } from "../data/addresses";
import { logger } from "../deployers/logger";
import { getSigner } from "../deployers/signers";
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

  async performAdapterAction(
    contractPerformingOn: Contract,
    functionName: string,
    paramValuesToEncode: any[]
  ) {
    const adapter = new Contract(
      await getDeployedContractAddress("AuthorizerAdaptorEntrypoint"),
      [
        "function getActionId(bytes4) external view returns(bytes32)",
        "function performAction(address, bytes) external  returns (bytes)",
      ],
      await getSigner()
    );
    const funcHash = contractPerformingOn.interface.getSighash(functionName);
    logger.info("Getting action id..");
    const actionId: string = await adapter.getActionId(funcHash);
    logger.success("action id: " + actionId);

    const authorizer = await getTimelockAuth(this.timelockAuthAddress);
    // Skip a tx if already approved
    const canDo = await authorizer.hasPermission(
      actionId,
      await getChainAdmin(),
      contractPerformingOn.address
    );
    if (!canDo) {
      await awaitTransactionComplete(
        await authorizer.grantPermissions([actionId], await getChainAdmin(), [
          contractPerformingOn.address,
        ]),
        10
      );
    } else {
      logger.info("Alreaday approved for action id");
    }

    logger.info(`Performing ${functionName} action through adapter..`);

    const callData = contractPerformingOn.interface.encodeFunctionData(
      functionName,
      paramValuesToEncode
    );

    await awaitTransactionComplete(
      await adapter.performAction(contractPerformingOn.address, callData),
      10
    );

    logger.success("Successfully performed adapter action");
  }
}
