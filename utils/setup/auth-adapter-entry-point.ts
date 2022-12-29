import { BaseContract } from "./base-contract";
import adapterAbi from "../../artifacts/contracts/liquidity-mining/admin/AuthorizerAdapterEntrypoint.sol/AuthorizerAdaptorEntrypoint.json";
import { doTransaction } from "../tx-utils";
import { VaultAuthorizationService } from "./vault-auth";
import { Contract } from "ethers";

export class AuthAdapterEntryPoint extends BaseContract {
  constructor(private vaulthAuthorizer: VaultAuthorizationService, address: string, signer) {
    super(address, adapterAbi.abi, signer);
  }

  async getActionId(sigHash: string) {
    return await this.contract.getActionId(sigHash);
  }

  /**
   * Utility to group together typical steps in performing adapter actions
   * @param contract
   * @param functionName
   * @param functionFullSignature
   * @param targetContractAddress
   * @param grantedAddress
   * @param paramValuesToEncode
   * @returns
   */
  async performAdapterAction(
    contract: Contract,
    functionName: string,
    functionFullSignature: string,
    targetContractAddress: string,
    grantedAddress: string,
    paramValuesToEncode: any[]
  ) {
    const funcHash = contract.interface.getSighash(functionFullSignature);
    const actionId = await this.getActionId(funcHash);

    // Skip a tx if already approved
    const canDo = await this.vaulthAuthorizer.canPerform(
      actionId,
      grantedAddress,
      targetContractAddress
    );
    if (!canDo) {
      await this.vaulthAuthorizer.grantFunctionPermisionsForContract([actionId], grantedAddress, [
        targetContractAddress,
      ]);
    }

    const callData = contract.interface.encodeFunctionData(functionName, paramValuesToEncode);

    return await doTransaction(await this.contract.performAction(contract.address, callData));
  }
}
