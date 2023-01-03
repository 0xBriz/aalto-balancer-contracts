import { expect } from "chai";
import { resetAllPoolConfigs } from "../../scripts/deploy-v2";
import { ZERO_ADDRESS } from "../../utils/big-numbers/ethers-big-number";
import { setupGovernance } from "../../utils/deployers/liquidity-mining/governance/setup-governance";
import { deployPoolFactories } from "../../utils/deployers/pools/deploy-factories";
import { deployVault } from "../../utils/deployers/vault/deploy-vault";
import { PoolCreationService } from "../../utils/services/pools/pool-creation.service";
import { PoolFactoryInfo } from "../../utils/types";

// Just a run through to check errors for now

const savingData = false;

describe("Deployment Process", () => {
  let vaultAddress: string;
  let authAddress: string;
  let factories: PoolFactoryInfo[];

  before(async () => {
    const { vaultData, authorizerData } = await deployVault(savingData);
    vaultAddress = vaultData.vault.address;
    authAddress = authorizerData.authorizer.address;
  });

  it("should setup governance contracts", async () => {
    const {} = await setupGovernance(savingData, vaultAddress, authAddress);
  });

  it("should deploy pool factories", async () => {
    factories = await deployPoolFactories(savingData, vaultAddress);
  });

  it("should create pools from pool configs", async () => {
    const poolCreator = new PoolCreationService(
      "0x891eFc56f5CD6580b2fEA416adC960F2A6156494",
      factories
    );
    await poolCreator.createPools(false);
    // await resetAllPoolConfigs();
  });
});
