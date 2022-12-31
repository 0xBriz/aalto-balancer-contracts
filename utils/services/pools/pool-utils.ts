import { BigNumber } from "ethers";
import { getAddress } from "ethers/lib/utils";
import { CreateWeightedPoolArgs, PoolCreationConfig, TokenWithManagerInfo } from "../../types";

export function sortTokensWithManagers(tokens: TokenWithManagerInfo[]): TokenWithManagerInfo[] {
  return tokens.sort((t1, t2) => (getAddress(t1.address) < getAddress(t2.address) ? -1 : 1));
}

/**
 * Sorts all items that need to be index aligned based on the tokens resulting index
 */
export function getWeightedPoolCreationArgs(
  name: string,
  symbol: string,
  swapFeePercentage: BigNumber,
  owner: string,
  tokenInfo: TokenWithManagerInfo[],
  assetManager: string
): CreateWeightedPoolArgs {
  const sortedInfo = sortTokensWithManagers(tokenInfo);

  return {
    name,
    symbol,
    tokens: sortedInfo.map((info) => info.address),
    weights: sortedInfo.map((info) => info.weight),
    swapFeePercentage,
    owner,
    assetManagers: sortedInfo.map((_) => assetManager),
    initialBalances: sortedInfo.map((info) => info.initialBalance),
  };
}

export async function savePoolCreationInfo(pool: PoolCreationConfig) {
  // const path = join(
  //   process.cwd(),
  //   'src/deployments',
  //   CHAINS[chainId],
  //   fileName + '.json',
  // );
  // await fs.createFile(path);
  // await fs.writeJSON(path, data);
}
