import { BigNumber, Contract } from "ethers";
import { defaultAbiCoder } from "ethers/lib/utils";
import { getVault } from "./contract-utils";
import { getDeployedContractAddress } from "./data/utils";
import { logger } from "./deployers/logger";
import { approveTokensIfNeeded } from "./token";
import { JoinPoolRequest } from "./types";

export async function initWeightedJoin(
  poolId: string,
  tokens: string[],
  initialBalances: BigNumber[],
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
      maxAmountsIn: initialBalances,
      userData: initUserData,
      fromInternalBalance: false,
    };

    const vault = await getVault(await getDeployedContractAddress("Vault"));

    // Vault needs approval to pull the tokens in
    await approveTokensIfNeeded(tokens, recipient, vault.address, signer);

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
