import { Interface } from "@ethersproject/abi/lib/interface";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { AequinoxToken, TimelockAuthorizer } from "../typechain";
import { BalancerTokenAdmin } from "../typechain/BalancerTokenAdmin";
import Timelock from "../artifacts/contracts/authorizer/TimelockAuthorizer.sol/TimelockAuthorizer.json";
import BalTokenAdmin from "../artifacts/contracts/liquidity-mining/BalancerTokenAdmin.sol/BalancerTokenAdmin.json";
import GovToken from "../artifacts/contracts/liquidity-mining/governance/AequinoxToken.sol/AequinoxToken.json";

export async function setupGovernance(balAdminAddres: string, auth: string, aeqAdress: string) {
  try {
    /**
     * Need to grant the deployer dev account permissions on the vault authorizer in order
     * to call the activate function on the BalTokenAdmin contract.
     */
    const signer = (await ethers.getSigners())[0];

    const balAdmin: BalancerTokenAdmin = new Contract(
      balAdminAddres,
      BalTokenAdmin.abi,
      signer
    ) as unknown as BalancerTokenAdmin;

    // Set vault permissions for dev account to call `active` on the bal admin contract
    const authorizer: TimelockAuthorizer = new Contract(
      auth,
      Timelock.abi,
      signer
    ) as unknown as TimelockAuthorizer;

    const iface = new Interface(["function activate() external"]);
    const selector = iface.getSighash("activate()");

    const actionId = await balAdmin.getActionId(selector);
    await authorizer.grantPermissions([actionId], signer.address, [balAdminAddres]);
    const canDo = await authorizer.canPerform(actionId, signer.address, balAdminAddres);

    if (!canDo) {
      throw "Adding token admin permissions failed";
    }

    const AEQ: AequinoxToken = new Contract(
      aeqAdress,
      GovToken.abi,
      signer
    ) as unknown as AequinoxToken;

    // BalAdmin will take over all roles for the token after initial mints
    await AEQ.grantRole(await AEQ.DEFAULT_ADMIN_ROLE(), balAdminAddres);

    await balAdmin.activate();
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}
