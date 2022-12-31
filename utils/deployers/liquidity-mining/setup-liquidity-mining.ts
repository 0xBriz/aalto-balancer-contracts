import { logger } from "../logger";
import { saveDeplomentData } from "../save-deploy-data";
import { setupGovernance } from "./governance/setup-governance";

export async function deployLiquidityMining() {
  try {
    logger.info("Starting deployment of Liquidity Mining system");
    /**
     * Going through ordered steps neeed to deploy and setup/configure the Liquidity Mining system
     */
    // Auth(EntryPoint) Adapter. Vault will have already have triggered its creation
    // need the token
    // token admin
    // minter
    // do auth steps

    const { govTokenData, tokenAdminData } = await setupGovernance();
    await Promise.all([
      saveDeplomentData(govTokenData.deployment),
      saveDeplomentData(tokenAdminData.deployment),
    ]);

    logger.success("Liquidity Mining setup complete");
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
}
