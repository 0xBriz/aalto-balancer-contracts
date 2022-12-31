import { expect } from "chai";
import { parseEther } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { deployContractUtil } from "../../utils/deployers/deploy-util";
import { deployVault } from "../../utils/deployers/vault/deploy-vault";

describe("Deployment", () => {
  beforeEach(async () => {
    const signer = (await ethers.getSigners())[0];

    const { vaultData, authorizerData, authAdapterData, entryAdapterData } = await deployVault();
    console.log(await vaultData.vault.getAuthorizer());
    // const govTokenData = await deployContractUtil("GovernanceToken", {
    //   name: "Vertek",
    //   symbol: "VRTK",
    // });

    // const tokenAdminData = await deployContractUtil("BalancerTokenAdmin", {
    //   vault: vaultData.vault.address,
    //   balancerToken: govTokenData.contract.address,
    //   initialMintAllowance: parseEther("1250000"),
    // });

    // const selector = tokenAdminData.contract.interface.getSighash("activate");
    // const actionId = await tokenAdminData.contract.getActionId(selector);
    // await authorizerData.authorizer.grantPermissions([actionId], signer.address, [
    //   tokenAdminData.contract.address,
    // ]);

    // console.log(signer.address);

    // const authorized = await authorizerData.authorizer.canPerform(
    //   actionId,
    //   signer.address,
    //   tokenAdminData.contract.address
    // );

    // console.log(authorized);
  });

  it("should ", () => {
    expect(true).to.be.true;
  });
});
