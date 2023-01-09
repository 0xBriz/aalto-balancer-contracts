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

describe("Gauge Authorization", () => {
  after(async () => {
    await cleanUpTestDeploymentData();
  });

  it("should grant admin permission to add_reward to a gauge", async () => {
    // this requires the full pool setup
  });
});
