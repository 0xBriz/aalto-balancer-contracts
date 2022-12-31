import * as BPT from "../artifacts/contracts/pool-utils/BalancerPoolToken.sol/BalancerPoolToken.json";
import * as WeightedPoolAbi from "../artifacts/contracts/pool-utils/BalancerPoolToken.sol/BalancerPoolToken.json";
import * as Vault from "../artifacts/contracts/Vault.sol/Vault.json";
import * as AM from "./abi/DexTokenManager.json";
import { Contract } from "ethers";
import { ERC20_ABI } from "./abi/ERC20ABI";
import { PoolType } from "./types";
import { getSigner } from "./deployers/signers";

const contractCache: { [contractAddress: string]: Contract } = {};

// TODO: Use the typechain types for these things
// And just setup something that links the artifacts to the new address

export async function getVault(address: string) {
  return getCacheOrNew(address, Vault.abi);
}

export async function getBalancerPoolToken(address: string) {
  return new Contract(address, BPT.abi);
}

export async function getWeightedPoolInstance(address: string) {
  return new Contract(address, WeightedPoolAbi.abi);
}

export async function getERC20(address: string, signer) {
  return new Contract(address, ERC20_ABI, signer);
}

export async function getDexAssetManager(address: string) {
  return new Contract(address, AM.abi);
}

async function getCacheOrNew(address, abi) {
  if (contractCache[address]) {
    return contractCache[address];
  }

  const contract = new Contract(address, abi, await getSigner());
  contractCache[address] = contract;

  return contract;
}
