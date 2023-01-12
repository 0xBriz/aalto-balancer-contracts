import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { expect } from "chai";
import { ANY_ADDRESS, ZERO_BYTES32 } from "../../scripts/utils/constants";
import { actionId } from "../../utils/actionid";
import { getChainAdmin } from "../../utils/data/addresses";
import { getSigner } from "../../utils/deployers/signers";
import {
  deployAdaptersSetup,
  deployTimelockAuth,
  deployVault,
  setProperAuthorizerForVault,
} from "../../utils/deployers/vault/deploy-vault";
import { getChainWETH } from "../../utils/token/token-utils";
import { governanceSetupFixture } from "../fixtures/goverance-setup.fixture";
import { vaultSetupFixture } from "../fixtures/vault-setup.fixture";
import { cleanUpTestDeploymentData } from "../test-utils/general-utils";

describe("Vault Authorization", () => {
  let owner: SignerWithAddress;

  before(async () => {
    owner = await getSigner();
  });

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

  it("should authorize things", async () => {
    const { timelockAuth, tokenAdmin, govToken } = await loadFixture(governanceSetupFixture);
    // await govToken.grantRole(ZERO_BYTES32, tokenAdmin.address);
    // const id = actionId(tokenAdmin, "activate");
    // await timelockAuth.grantPermissions([id], owner.address, [ANY_ADDRESS]);
    // await tokenAdmin.activate();
  });
});
