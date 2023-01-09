import { expect } from "chai";
import { getDeployedContractAddress } from "../../utils/contract-utils";
import {
  createGovernanceToken,
  setupGovernance,
} from "../../utils/deployers/liquidity-mining/governance/setup-governance";
import { deployVault } from "../../utils/deployers/vault/deploy-vault";

const saving = true;

describe("Auth", () => {
  beforeEach(async () => {
    console.time("[Spec time]");
    await deployVault(saving);
    // const { govTokenData } = await createGovernanceToken();
    // console.log(await govTokenData.contract.DEFAULT_ADMIN_ROLE());
    await setupGovernance(saving);

    console.timeEnd("[Spec time]");
  });

  it("should ", async () => {
    expect(true).to.be.true;
  });
});
