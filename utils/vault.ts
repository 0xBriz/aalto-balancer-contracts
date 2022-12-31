import { BigNumber, Contract } from "ethers";
import { defaultAbiCoder, parseUnits } from "ethers/lib/utils";
import { getVault } from "./contract-utils";
import { getDeployedContractAddress } from "./data/utils";
import { logger } from "./deployers/logger";
import { approveTokensIfNeeded } from "./token";
import { JoinPoolRequest } from "./types";

/**
 * Utility to perform the INIT_JOIN operation on a weight pool
 * @param poolId
 * @param tokens
 * @param initialBalances
 * @param recipient
 * @param signer
 * @returns
 */
export async function initWeightedJoin(
  poolId: string,
  tokens: string[],
  initialBalances: string[],
  recipient: string,
  signer
) {
  try {
    logger.info("Starting INIT_JOIN for pool id: " + poolId);

    const JOIN_KIND_INIT = 0; // Can only be called once for most pools
    // Must be encoded
    const initUserData = defaultAbiCoder.encode(
      ["uint256", "uint256[]"],
      [JOIN_KIND_INIT, initialBalances]
    );

    const joinPoolRequest: JoinPoolRequest = {
      assets: tokens,
      maxAmountsIn: initialBalances.map((a) => parseUnits(a)),
      userData: initUserData,
      fromInternalBalance: false,
    };

    const vault = await getVault();

    // Vault needs approval to pull the tokens in
    await approveTokensIfNeeded(tokens, recipient, vault.address);

    // Joins are done on the Vault instead of pools
    const tx = await vault.joinPool(poolId, recipient, recipient, joinPoolRequest);
    const rx = await tx.wait(1);

    logger.success("INIT_JOIN complete");

    return rx;
  } catch (error) {
    console.log(error);
    throw error;
  }
}
