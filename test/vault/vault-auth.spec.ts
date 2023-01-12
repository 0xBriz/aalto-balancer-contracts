import { expect } from "chai";
import { getChainAdmin } from "../../utils/data/addresses";
import {
  deployAdaptersSetup,
  deployTimelockAuth,
  deployVault,
  setProperAuthorizerForVault,
} from "../../utils/deployers/vault/deploy-vault";
import { getChainWETH } from "../../utils/token/token-utils";
import { cleanUpTestDeploymentData } from "../test-utils/general-utils";

describe("Vault Authorization", () => {
  after(async () => {
    await cleanUpTestDeploymentData();
  });

  it("should set the proper authorizer on the vault", async () => {
    /**
     * These steps are consolidated into a helper `setupVault`,
     * but done individually here for verification
     */
    const { vault, basicAuthorizer } = await deployVault(await getChainWETH());

    let vaultAuthorizer = await vault.getAuthorizer();
    expect(vaultAuthorizer).to.equal(basicAuthorizer.address);

    const { authEntryPoint, authAdapter } = await deployAdaptersSetup(vault.address);
    // should initially reference the basic/mock version
    expect(await authEntryPoint.getAuthorizer()).to.equal(vaultAuthorizer);

    const { timelockAuth } = await deployTimelockAuth(
      await getChainAdmin(),
      authEntryPoint.address
    );

    // Then, with the entrypoint correctly deployed, we create the actual authorizer to be used and set it in the vault.
    await setProperAuthorizerForVault(timelockAuth.address);

    vaultAuthorizer = await vault.getAuthorizer();
    expect(vaultAuthorizer).to.equal(timelockAuth.address);
  });

  it("should authorize things", async () => {});
});
