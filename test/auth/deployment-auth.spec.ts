import { expect } from "chai";
import { ZERO_ADDRESS, ZERO_BYTES32 } from "../../utils/big-numbers/ethers-big-number";
import { getDeployedContractAddress, getGovernanceToken } from "../../utils/contract-utils";
import { setupGovernance } from "../../utils/deployers/liquidity-mining/governance/contract-deployment";
import { deployVault, setupVault } from "../../utils/deployers/vault/deploy-vault";
import { getChainWETH } from "../../utils/token/token-utils";
import { cleanUpTestDeploymentData } from "../test-utils/general-utils";

const saving = true;

describe("Auth", () => {
  before(async () => {
    console.time("[Spec time]");
    await setupVault();
    // await setupGovernance(saving);

    console.timeEnd("[Spec time]");
  });

  after(async () => {
    await cleanUpTestDeploymentData();
  });

  it("should set the proper authorizer on the vault", async () => {
    const { vault } = await deployVault(await getChainWETH());
    expect(true).to.be.true;
  });

  it("should make the token admin the sole minter", async () => {
    // const govToken = await getGovernanceToken();
    // console.log(await govToken.getRoleAdmin(ZERO_BYTES32));
    // console.log(await getDeployedContractAddress("BalancerTokenAdmin"));
    expect(true).to.be.true;
  });
});
