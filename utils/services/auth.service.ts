import { Contract } from "ethers";
import { boolean } from "hardhat/internal/core/params/argumentTypes";
import {
  getAutEntryAdapter,
  getDeployedContractAddress,
  getTimelockAuth,
  getVaultAuthorizer,
} from "../contract-utils";
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
    const actionId: string = await contractPerformingOn.getActionId(funcHash);
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

/**
 * Authorization for the caller should have taken place beforehand
 * @param contractPerformingOn
 * @param functionName
 * @param paramValuesToEncode
 */
export async function performAdapterAction(
  contractPerformingOn: Contract,
  functionName: string,
  paramValuesToEncode: any[]
) {
  try {
    logger.info(`Performing ${functionName} action through adapter..`);

    const adapter = await getAutEntryAdapter();

    const callData = contractPerformingOn.interface.encodeFunctionData(
      functionName,
      paramValuesToEncode
    );

    await awaitTransactionComplete(
      await adapter.performAction(contractPerformingOn.address, callData),
      10
    );

    logger.success("Successfully performed adapter action");
  } catch (error) {
    console.error(error);
    logger.error("performAdapterAction failed");
  }
}

/**
 *
 * @param contractPerformingOn Contract that is hooked into the auth adapter setup
 * @param actionId Action id that was return from the contracts adpater reference
 * @param forWho Who is being allowed to perform the action
 */
export async function grantPerformActionIfNeeded(
  contractPerformingOn: string,
  actionId: string,
  forWho: string
) {
  const authorizer = await getTimelockAuth(await getDeployedContractAddress("TimelockAuthorizer"));
  // Skip a tx if already approved
  const canDo = await authorizer.hasPermission(
    actionId,
    await getChainAdmin(),
    contractPerformingOn
  );

  //  if (!canDo) {
  logger.info("Granting permision for action id: " + actionId);
  await awaitTransactionComplete(
    await authorizer.grantPermissions([actionId], forWho, [contractPerformingOn]),
    10
  );
  //   } else {
  //     logger.info("Already approved for action id");
  //   }
}

export async function grantAuthEntryPermission(contractPerformingOn: string, actionId: string) {
  const authorizer = await getTimelockAuth(await getDeployedContractAddress("TimelockAuthorizer"));
  return await awaitTransactionComplete(
    await authorizer.grantPermissions(
      [actionId],
      await getDeployedContractAddress("AuthorizerAdaptorEntrypoint"),
      [contractPerformingOn]
    ),
    10
  );
}

/**
 * Get the action id from a contract that inherits from SingleAuthentication
 * @param contractPerformingOn
 * @param functionName
 */
export async function getSingletonAuthActionId(
  contractPerformingOn: Contract,
  selectorBytes: string
): Promise<string> {
  logger.info("Getting action id..");
  const actionId = await contractPerformingOn.getActionId(selectorBytes);
  logger.success("action id: " + actionId);

  return actionId;
}

export function getFunctionSelectorBytes(contract: Contract, functionName: string) {
  return contract.interface.getSighash(functionName);
}

export async function getTimelockActionId(contractPerformingOn: Contract, functionName: string) {
  const authorizer = new Contract(
    await getDeployedContractAddress("TimelockAuthorizer"),
    ["function getActionId(bytes4 selector) public pure returns (bytes32)"],
    await getSigner()
  );
  return authorizer.getActionId(getFunctionSelectorBytes(contractPerformingOn, functionName));
}

export async function getTimelockActionIdWithParams(
  contractPerformingOn: Contract,
  functionName: string,
  paramValuesToEncode: any[]
) {
  const authorizer = new Contract(
    await getDeployedContractAddress("TimelockAuthorizer"),
    ["function getActionId(bytes4 selector) public pure returns (bytes32)"],
    await getSigner()
  );

  const callData = contractPerformingOn.interface.encodeFunctionData(
    functionName,
    paramValuesToEncode
  );

  return authorizer.getActionId(getFunctionSelectorBytes(contractPerformingOn, functionName));
}

export async function getActionIdWithParams(
  actionId: string,
  contractPerformingOn: Contract,
  functionName: string,
  paramValuesToEncode: any[]
) {
  // const authorizer = new Contract(
  //   await getDeployedContractAddress("TimelockAuthorizer"),
  //   ["function getActionId(bytes32 actionId, bytes32 how) public pure returns (bytes32) "],
  //   await getSigner()
  // );
  // const callData = contractPerformingOn.interface.encodeFunctionData(
  //   functionName,
  //   paramValuesToEncode
  // );
  // return authorizer.getActionId(actionId, hexZeroPad(callData.toHexString(), 32) );
}
