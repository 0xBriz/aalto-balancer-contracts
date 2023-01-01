import * as fs from "fs-extra";
import { getAddress } from "ethers/lib/utils";
import { CreateWeightedPoolArgs, PoolCreationConfig, PoolTokenInfo } from "../../types";
import { join } from "path";
import { CHAIN_KEYS } from "../../data/chains";
import { getChainId } from "../../deployers/network";

/**
 * Sorts the tokens for a pool according to address as required by the vault.
 * Having the initial balance to be used for liquidity, and the weights attached(if applicable),
 * allows for all required info to be "index aligned".
 * Would have a busted pool if these items do not line up with their associated token.
 * @param tokens
 * @returns
 */
export function sortTokensWithInfo(tokens: PoolTokenInfo[]): PoolTokenInfo[] {
  return tokens.sort((t1, t2) => (getAddress(t1.address) < getAddress(t2.address) ? -1 : 1));
}

/**
 * Sets the values needed for pool creation arguments.
 * Items need to be index aligned based on each tokens resulting index.
 * Uses `sortTokensWithInfo` to help with this.
 */
export function getWeightedPoolCreationArgs(
  name: string,
  symbol: string,
  swapFeePercentage: string,
  owner: string,
  tokenInfo: PoolTokenInfo[]
): CreateWeightedPoolArgs {
  const sortedInfo = sortTokensWithInfo(tokenInfo);

  return {
    name,
    symbol,
    tokens: sortedInfo.map((info) => info.address),
    weights: sortedInfo.map((info) => info.weight),
    swapFeePercentage,
    owner,
    initialBalances: sortedInfo.map((info) => info.initialBalance),
  };
}

export async function getPoolConfigPath() {
  return join(process.cwd(), "utils", "data", `${CHAIN_KEYS[await getChainId()]}-pools.json`);
}

export async function getDeployedPools(): Promise<PoolCreationConfig[]> {
  const pools: PoolCreationConfig[] = await fs.readJSON(await getPoolConfigPath());
  return pools.filter((p) => p.created);
}

export async function savePoolsData(pools: PoolCreationConfig[]) {
  await fs.writeJSON(await getPoolConfigPath(), pools);
}
