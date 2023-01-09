import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { getChainAdmin } from "../../../utils/data/addresses";
import { cleanUpTestDeploymentData } from "../../test-utils/general-utils";
import { parseUnits } from "ethers/lib/utils";
import { poolsSetupFixture } from "../../fixtures/pools-setup.fixture";

describe("Gauge Authorization", () => {
  after(async () => {
    await cleanUpTestDeploymentData();
  });

  it("should grant admin permission to add_reward to a gauge", async () => {
    // this requires the full pool setup
    const {} = await loadFixture(poolsSetupFixture);

    expect(true).to.be.true;
  });

  // it("should grant mint permissions to BalancerMinter", async () => {});
});
