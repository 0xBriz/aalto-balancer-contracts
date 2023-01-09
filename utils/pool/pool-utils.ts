import { defaultAbiCoder, parseUnits } from "ethers/lib/utils";
import { getVault } from "../contract-utils";
import { logger } from "../deployers/logger";
import { approveTokensIfNeeded } from "../token/token-utils";
import { awaitTransactionComplete } from "../tx-utils";
import { JoinPoolRequest } from "../types";

/**
 * Utility to perform the INIT_JOIN operation on a weight pool.
 * Will approve the vault for each token as needed.
 * @param poolId
 * @param tokens
 * @param initialBalances
 * @param recipient
 * @returns
 */
export async function initWeightedJoin(
  poolId: string,
  tokens: string[],
  initialBalances: string[],
  recipient: string
) {
  try {
    logger.info("Starting INIT_JOIN for pool id: " + poolId);

    const JOIN_KIND_INIT = 0; // Can only be called once for most pools

    // convert to BigNumber before encoding
    const balancesBN = initialBalances.map((a) => parseUnits(a));

    // Must be encoded
    const initUserData = defaultAbiCoder.encode(
      ["uint256", "uint256[]"],
      [JOIN_KIND_INIT, balancesBN]
    );

    const joinPoolRequest: JoinPoolRequest = {
      assets: tokens,
      maxAmountsIn: balancesBN,
      userData: initUserData,
      fromInternalBalance: false,
    };

    const vault = await getVault();

    // Vault needs approval to pull the tokens in
    await approveTokensIfNeeded(tokens, recipient, vault.address);

    const rx = await awaitTransactionComplete(
      await vault.joinPool(poolId, recipient, recipient, joinPoolRequest)
    );

    logger.success("INIT_JOIN complete");

    return rx;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function doPoolJoin(
  poolId: string,
  sender: string,
  recipient: string,
  request: JoinPoolRequest
) {
  const vault = await getVault();
  awaitTransactionComplete(vault.joinPool(poolId, sender, recipient, request));
}
