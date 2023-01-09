import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { getChainAdmin } from "../../../utils/data/addresses";
import {
  createGovernanceToken,
  createTokenAdmin,
} from "../../../utils/deployers/liquidity-mining/governance/contract-deployment";
import { vaultSetupFixture } from "../../fixtures/vault-setup.fixture";
import { cleanUpTestDeploymentData } from "../../test-utils/general-utils";
import { parseUnits } from "ethers/lib/utils";
import {
  activateTokenAdmin,
  giveTokenAdminControl,
} from "../../../utils/deployers/liquidity-mining/governance/authorization";

describe("Governance Authorization", () => {
  after(async () => {
    await cleanUpTestDeploymentData();
  });

  it("should make the token admin the sole minter of gov token at activation", async () => {
    /**
     * All of this is consolidated into one util function `setupGovernance`,
     * but is tested out here step by step for verification of results.
     * Other tests can use the `governanceSetupFixture` fixture to wrap vault setup
     * along with steps into into one fixture for testing.
     */
    const { vault, timelockAuth } = await loadFixture(vaultSetupFixture);
    const govToken = await createGovernanceToken();
    const tokenAdmin = await createTokenAdmin(
      vault.address,
      govToken.address,
      parseUnits("1250000")
    );

    // sets caller with minter role at deployment
    const admin = await getChainAdmin();
    const MINTER_ROLE = await govToken.MINTER_ROLE();
    expect(await govToken.hasRole(MINTER_ROLE, admin)).to.be.true;

    // Role needs to be granted before calling activate on token admin
    await giveTokenAdminControl(govToken.address, tokenAdmin.address);

    // grant admin permission to activate the token admin
    await activateTokenAdmin(tokenAdmin.address, timelockAuth.address, admin);

    // admin should now be removed and token admin the sole boss
    expect(await govToken.hasRole(MINTER_ROLE, tokenAdmin.address)).to.be.true;
    expect(await govToken.hasRole(MINTER_ROLE, admin)).to.be.false;
  });
});
