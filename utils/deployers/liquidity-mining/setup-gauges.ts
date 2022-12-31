import { deployContractUtil } from "../deploy-util";
import { logger } from "../logger";

export async function setupGaugeSystem() {
  logger.info("setupGaugeSystem: initializing gauge items");

  // Requires the main pool was created
  const votingEscrow = await deployContractUtil("GovernanceToken", {
    name: "Vertek",
    symbol: "VRTK",
  });
}
