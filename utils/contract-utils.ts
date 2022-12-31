import * as BPT from "../artifacts/contracts/pool-utils/BalancerPoolToken.sol/BalancerPoolToken.json";
import * as WeightedPoolAbi from "../artifacts/contracts/pool-utils/BalancerPoolToken.sol/BalancerPoolToken.json";
import * as Vault from "../artifacts/contracts/Vault.sol/Vault.json";
import * as AM from "./abi/DexTokenManager.json";
import { Contract } from "ethers";
import { ERC20_ABI } from "./abi/ERC20ABI";
import { PoolType } from "./types";

// TODO: Use the typechain types for these things

export function getVault(address: string, signer) {
  return new Contract(address, Vault.abi, signer);
}

export function getBalancerPoolToken(address: string, signer) {
  return new Contract(address, BPT.abi, signer);
}

export function getWeightedPoolInstance(address: string, signer) {
  return new Contract(address, WeightedPoolAbi.abi, signer);
}

export function getERC20(address: string, signer) {
  return new Contract(address, ERC20_ABI, signer);
}

export function getDexAssetManager(address: string, signer) {
  return new Contract(address, AM.abi, signer);
}
