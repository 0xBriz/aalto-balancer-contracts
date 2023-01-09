import { getChainId } from "../deployers/network";

export const CHAIN_KEYS = {
  [5]: "goerli",
  [56]: "bsc",
  [31337]: "hardhat",
};

export const CONFIRMATIONS_COUNT = {
  [5]: 5,
  [56]: 3,
  [31337]: 1,
};

export async function getDefaultConfirmationsForChain() {
  return CONFIRMATIONS_COUNT[await getChainId()];
}
