import { expect } from "chai";
import { setupGovernance } from "../../utils/deployers/liquidity-mining/governance/setup-governance";
import { deployVault } from "../../utils/deployers/vault/deploy-vault";

describe("Deployment Process", () => {
  beforeEach(async () => {
    const { vaultData, authorizerData } = await deployVault(false);
    await setupGovernance(false, vaultData.vault.address, authorizerData.authorizer.address);
  });

  it("should work", () => {
    expect(true).to.be.true;
  });
});
