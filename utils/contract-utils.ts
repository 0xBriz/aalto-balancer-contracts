import * as BPT from "../artifacts/contracts/pool-utils/BalancerPoolToken.sol/BalancerPoolToken.json";
import * as WeightedPoolAbi from "../artifacts/contracts/pool-weighted/WeightedPool.sol/WeightedPool.json";
import * as Vault from "../artifacts/contracts/Vault.sol/Vault.json";
import * as AM from "./abi/DexTokenManager.json";
import { Contract } from "ethers";
import { ERC20_ABI } from "./abi/ERC20ABI";
import { getSigner } from "./deployers/signers";
import { getDeployedContractAddress } from "./data/utils";

const contractCache: { [contractAddress: string]: Contract } = {};

// TODO: Use the typechain types for these things
// And just setup something that links the artifacts to the new address

export async function getVault() {
  return getCacheOrNew(await getDeployedContractAddress("Vault"), Vault.abi);
}

export async function getBalancerPoolToken(address: string) {
  return getCacheOrNew(address, BPT.abi);
}

export async function getWeightedPoolInstance(address: string) {
  return getCacheOrNew(address, WeightedPoolAbi.abi);
}

export async function getERC20(address: string) {
  return getCacheOrNew(address, ERC20_ABI);
}

export async function getDexAssetManager(address: string) {
  return getCacheOrNew(address, AM.abi);
}

async function getCacheOrNew(address, abi) {
  if (contractCache[address]) {
    return contractCache[address];
  }

  const contract = new Contract(address, abi, await getSigner());
  contractCache[address] = contract;

  return contract;
}
