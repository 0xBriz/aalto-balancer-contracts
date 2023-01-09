import { createGovernanceToken } from "../../utils/deployers/liquidity-mining/governance/contract-deployment";

export async function liquidityMiningSetupFixture() {
  const { govTokenData } = await createGovernanceToken();
}
