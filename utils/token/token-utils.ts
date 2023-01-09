import { BigNumber } from "ethers";
import { MAX_UINT256 } from "../big-numbers/ethers-big-number";
import { getERC20 } from "../contract-utils";
import { TOKENS } from "../data/token-map";
import { logger } from "../deployers/logger";
import { getChainId } from "../deployers/network";
import { awaitTransactionComplete } from "../tx-utils";

export async function approveTokensIfNeeded(tokens: string[], owner: string, spender: string) {
  try {
    logger.info(`Checking token allowances..`);
    for (const address of tokens) {
      const token = await getERC20(address);
      const allowance: BigNumber = await token.allowance(owner, spender);
      if (allowance.isZero()) {
        logger.info(`Approving token: ${address} - for spender ${spender}`);
        await awaitTransactionComplete(await token.approve(spender, MAX_UINT256));
        logger.success("Token approval complete");
      }
    }
  } catch (error) {
    throw error;
  }
}

export async function getChainWETH(): Promise<string> {
  return TOKENS.NATIVE_TOKEN[await getChainId()];
}
