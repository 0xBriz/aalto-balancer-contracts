import { ContractTransaction } from "ethers";
import { logger } from "./deployers/logger";

export async function doTransaction(txResponse: ContractTransaction) {
  try {
    return awaitTransactionComplete(await txResponse);
  } catch (error) {
    throw error;
  }
}

export async function awaitTransactionComplete(txResponse: ContractTransaction, confirmations = 2) {
  try {
    logger.info(`- Starting transaction: ${txResponse.hash}`);
    logger.info(`- Awaiting transaction receipt... - ` + new Date().toLocaleString());
    const txReceipt = await txResponse.wait(confirmations);
    logger.info("- TransactionReceipt received - " + new Date().toLocaleString());
    if (txReceipt.status === 1) {
      // success
      logger.success(`Transaction successful`);
    }
    return txReceipt;
  } catch (error) {
    throw error; // Throw and try to let this be handled back in the call stack as needed
  }
}
