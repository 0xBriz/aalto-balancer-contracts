import { doTransaction } from "../tx-utils";
import timeAuth from "../../artifacts/contracts/authorizer/TimelockAuthorizer.sol/TimelockAuthorizer.json";
import { BaseContract } from "./base-contract";

export class VaultAuthorizationService extends BaseContract {
  constructor(timelockAddress: string, signer) {
    super(timelockAddress, timeAuth.abi, signer);
  }

  /**
   * Grant dev(or any) account access to call permissioned vault functions.
   */
  async grantPermissions(actionIds: string[], accountToGrant: string, contractToAccess: string[]) {
    try {
      return doTransaction(
        await this.contract.grantPermissions(actionIds, accountToGrant, contractToAccess)
      );
    } catch (error) {
      throw error;
    }
  }

  async canPerform(actionId: string, who: string, targetContract: string): Promise<boolean> {
    try {
      return await this.contract.hasPermission(actionId, who, targetContract);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get an action id based on the vaults own disambiguator
   */
  async getVaultAuthActionId(selector: string) {
    const actionId = await this.contract.getActionId(selector);
    return actionId;
  }
}
