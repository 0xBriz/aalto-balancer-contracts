import { getChainAdmin } from "../../../utils/data/addresses";
import { doPoolJoin } from "../../../utils/services/pools/pool-utils";
import { JoinPoolRequest } from "../../../utils/types";

/**
 * Fills in quick defaults as needed for a join
 */
export async function doTestJoinPool(poolId: string, joinPoolRequest: JoinPoolRequest) {
  // Will be the default hardhat user admin account
  const user = await getChainAdmin();
  await doPoolJoin(poolId, user, user, joinPoolRequest);
}
