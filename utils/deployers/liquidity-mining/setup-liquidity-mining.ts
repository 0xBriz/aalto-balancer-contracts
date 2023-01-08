import { logger } from "../logger";
import { setupVotingEscrow } from "./setup-voting-escrow";

export async function deployLiquidityMining(doSave: boolean) {
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

    try {
      await setupVotingEscrow(doSave);
      // await setupGaugeSystem(doSave);
    } catch (error) {
      console.error(error);
    }

    logger.success("Liquidity Mining setup complete");
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
}
