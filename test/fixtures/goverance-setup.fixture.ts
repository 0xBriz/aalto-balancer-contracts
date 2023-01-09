import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { getChainAdmin } from "../../utils/data/addresses";
import { setupGovernance } from "../../utils/deployers/liquidity-mining/governance/contract-deployment";
import { vaultSetupFixture } from "./vault-setup.fixture";

export async function governanceSetupFixture() {
  const vaultData = await loadFixture(vaultSetupFixture);
  const govData = await setupGovernance({
    timelockAuth: vaultData.timelockAuth.address,
    vault: vaultData.vault.address,
    adminAccount: await getChainAdmin(),
  });

  return {
    ...vaultData,
    ...govData,
  };
}
