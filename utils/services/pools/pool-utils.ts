import { BigNumber } from "ethers";
import { getAddress } from "ethers/lib/utils";
import { CreateWeightedPoolArgs, TokenWithManagerInfo } from "../../types";

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
  tokenInfo: TokenWithManagerInfo[]
): CreateWeightedPoolArgs {
  const sortedInfo = sortTokensWithManagers(tokenInfo);

  return {
    name,
    symbol,
    tokens: sortedInfo.map((info) => info.address),
    weights: sortedInfo.map((info) => info.weight),
    swapFeePercentage,
    owner,
    assetManagers: sortedInfo.map((info) => info.manager),
    initialBalances: sortedInfo.map((info) => info.initialBalance),
  };
}

export async function savePoolCreationInfo(pool: {}, deploymentArgs = {}) {
  // const path = join(
  //   process.cwd(),
  //   'src/deployments',
  //   CHAINS[chainId],
  //   fileName + '.json',
  // );
  // await fs.createFile(path);
  // await fs.writeJSON(path, data);
}
