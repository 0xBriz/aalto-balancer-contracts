import * as fs from "fs-extra";
import * as BPT from "../artifacts/contracts/pool-utils/BalancerPoolToken.sol/BalancerPoolToken.json";
import * as WeightedPoolAbi from "../artifacts/contracts/pool-weighted/WeightedPool.sol/WeightedPool.json";
import * as Vault from "../artifacts/contracts/Vault.sol/Vault.json";
import * as Timelock from "../artifacts/contracts/authorizer/TimelockAuthorizer.sol/TimelockAuthorizer.json";
import * as TokenAdmin from "../artifacts/contracts/liquidity-mining/BalancerTokenAdmin.sol/BalancerTokenAdmin.json";
import * as AM from "./abi/DexTokenManager.json";
import { Contract } from "ethers";
import { ERC20_ABI } from "./abi/ERC20ABI";
import { getSigner } from "./deployers/signers";
import { BalancerTokenAdmin, TimelockAuthorizer } from "../typechain";
import { CHAIN_KEYS } from "./data/chains";
import { getChainId } from "./deployers/network";
import { join } from "path";

type FactoryContracts =
  | "WeightedPoolFactory"
  | "LiquidityBootstrappingPoolFactory"
  | "ERC4626LinearPoolFactory"
  | "StablePoolFactory";

type VaulContracts = "Vault" | "TimelockAuthorizer" | "AuthorizerAdaptorEntrypoint";
type GovernanceContracts = "GovernanceToken" | "BalancerTokenAdmin" | "BalancerMinter";
type GaugeContracts =
  | "VotingEscrow"
  | "GaugeController"
  | "LiquidityGaugeFactory"
  | "LiquidityGauge"
  | "BoostV2"
  | "SingleRecipientGaugeFactory"
  | "BALTokenHolder"
  | "FeeDistributor";
export type DeployedContract =
  | FactoryContracts
  | VaulContracts
  | GovernanceContracts
  | GaugeContracts
  | "AssetManager";

// Doing actual file reads every time here.
// Maybe save some milliseconds per, but with a long job using the same contracts, saving some total seconds iz good
const contractCache: { [contractName: string]: Contract } = {};
const addressCache: { [contractName: string]: string } = {};

// TODO: Use the typechain types for these things
// And just setup something that links the artifacts to the new address

export async function getVault() {
  return getCacheOrNew(await getDeployedContractAddress("Vault"), Vault.abi);
}

export async function getTimelockAuth(): Promise<TimelockAuthorizer> {
  return getCacheOrNew(
    await getDeployedContractAddress("TimelockAuthorizer"),
    Timelock.abi
  ) as unknown as TimelockAuthorizer;
}

export async function getBalTokenAdmin(): Promise<BalancerTokenAdmin> {
  return getCacheOrNew(
    await getDeployedContractAddress("BalancerTokenAdmin"),
    TokenAdmin.abi
  ) as unknown as BalancerTokenAdmin;
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

export async function getDeployedContractAddress(contractName: DeployedContract): Promise<string> {
  if (addressCache[contractName]) {
    return addressCache[contractName];
  }

  const addresses = await fs.readJSON(
    join(process.cwd(), "deployments", `${CHAIN_KEYS[await getChainId()]}`, "addresses.json")
  );

  const addy = addresses[contractName];
  if (!addy) {
    throw new Error(`Contract address lookup failed for: ${contractName}`);
  }

  contractCache[contractName] = addy;

  return addresses[contractName];
}
