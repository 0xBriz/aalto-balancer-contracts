import BPT from "../artifacts/contracts/pool-utils/BalancerPoolToken.sol/BalancerPoolToken.json";
import WeightedPoolAbi from "../artifacts/contracts/pool-utils/BalancerPoolToken.sol/BalancerPoolToken.json";
import { Contract } from "ethers";
import { ERC20_ABI } from "./abi/ERC20ABI";

export function getBalancerPoolToken(address: string, signer) {
  return new Contract(address, BPT.abi, signer);
}

export function getWeightedPoolInstance(address: string, signer) {
  return new Contract(address, WeightedPoolAbi.abi, signer);
}

export function getERC20(address: string, signer) {
  return new Contract(address, ERC20_ABI, signer);
}
