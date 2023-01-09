import { expect } from "chai";
import { ZERO_ADDRESS, ZERO_BYTES32 } from "../../utils/big-numbers/ethers-big-number";
import { getDeployedContractAddress, getGovernanceToken } from "../../utils/contract-utils";
import { getChainAdmin } from "../../utils/data/addresses";
import { setupGovernance } from "../../utils/deployers/liquidity-mining/governance/contract-deployment";
import {
  deployAdaptersSetup,
  deployTimelockAuth,
  deployVault,
  setProperAuthorizerForVault,
  setupVault,
} from "../../utils/deployers/vault/deploy-vault";
import { getChainWETH } from "../../utils/token/token-utils";
import { cleanUpTestDeploymentData } from "../test-utils/general-utils";

const saving = true;

describe("Vault Authorization", () => {
  before(async () => {
    // console.time("[Spec time]");
    // // await setupVault();
    // // await setupGovernance(saving);
    // console.timeEnd("[Spec time]");
  });

  after(async () => {
    await cleanUpTestDeploymentData();
  });

  it("should set the proper authorizer on the vault", async () => {
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

  // it("should make the token admin the sole minter", async () => {
  //   // const govToken = await getGovernanceToken();
  //   // console.log(await govToken.getRoleAdmin(ZERO_BYTES32));
  //   // console.log(await getDeployedContractAddress("BalancerTokenAdmin"));
  //   expect(true).to.be.true;
  // });
});
