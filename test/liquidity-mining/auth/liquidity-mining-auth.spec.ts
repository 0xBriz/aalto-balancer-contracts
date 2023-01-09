import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { getChainAdmin } from "../../../utils/data/addresses";
import {
  createGovernanceToken,
  createTokenAdminWithParams,
} from "../../../utils/deployers/liquidity-mining/governance/contract-deployment";
import { vaultSetupFixture } from "../../fixtures/vault-setup.fixture";
import { cleanUpTestDeploymentData } from "../../test-utils/general-utils";
import { parseUnits } from "ethers/lib/utils";
import {
  activateTokenAdmin,
  giveTokenAdminControlWithParams,
} from "../../../utils/deployers/liquidity-mining/governance/authorization";

describe("Liquidity Mining Authorization", () => {
  after(async () => {
    await cleanUpTestDeploymentData();
  });

  it("should make the token admin the sole minter of gov token at activation", async () => {
    const { vault, timelockAuth } = await loadFixture(vaultSetupFixture);
    const govToken = await createGovernanceToken();
    const tokenAdmin = await createTokenAdminWithParams(
      vault.address,
      govToken.address,
      parseUnits("1250000")
    );

    // sets caller with minter role at deployment
    const admin = await getChainAdmin();
    const MINTER_ROLE = await govToken.MINTER_ROLE();
    expect(await govToken.hasRole(MINTER_ROLE, admin)).to.be.true;

    // Role needs to be granted before calling activate on token admin
    await giveTokenAdminControlWithParams(govToken.address, tokenAdmin.address);

    // grant admin permission to activate the token admin
    await activateTokenAdmin(tokenAdmin.address, timelockAuth.address, admin);

    // admin should now be removed and token admin the sole boss
    expect(await govToken.hasRole(MINTER_ROLE, tokenAdmin.address)).to.be.true;
    expect(await govToken.hasRole(MINTER_ROLE, admin)).to.be.false;
  });

  // it("should grant mint permissions to BalancerMinter", async () => {});
});
