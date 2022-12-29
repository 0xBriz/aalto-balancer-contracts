import { BigNumber, Contract } from "ethers";
import { defaultAbiCoder } from "ethers/lib/utils";
import { approveTokensIfNeeded } from "./token";
import { JoinPoolRequest } from "./types";

export async function initWeightedJoin(
  poolId: string,
  tokens: string[],
  initialBalances: BigNumber[],
  recipient: string,
  vault: Contract,
  signer
) {
  try {
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

    // Vault needs approval to pull the tokens in
    await approveTokensIfNeeded(tokens, recipient, vault.address, signer);

    // Joins are done on the Vault instead of pools
    const tx = await vault.joinPool(poolId, recipient, recipient, joinPoolRequest);
    return await tx.wait();
  } catch (error) {
    console.log(error);
    throw error;
  }
}
