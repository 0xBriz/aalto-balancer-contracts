import * as fs from "fs-extra";
import * as BPT from "../artifacts/contracts/pool-utils/BalancerPoolToken.sol/BalancerPoolToken.json";
import * as WeightedPoolAbi from "../artifacts/contracts/pool-weighted/WeightedPool.sol/WeightedPool.json";
import * as Vault from "../artifacts/contracts/Vault.sol/Vault.json";
import * as Timelock from "../artifacts/contracts/authorizer/TimelockAuthorizer.sol/TimelockAuthorizer.json";
import * as TokenAdmin from "../artifacts/contracts/liquidity-mining/BalancerTokenAdmin.sol/BalancerTokenAdmin.json";
import * as GovenToken from "../artifacts/contracts/liquidity-mining/governance/GovernanceToken.sol/GovernanceToken.json";
import * as AuthEntry from "../artifacts/contracts/liquidity-mining/admin/AuthorizerAdapterEntrypoint.sol/AuthorizerAdaptorEntrypoint.json";
import * as GC from "../artifacts/contracts/liquidity-mining/GaugeController.vy/GaugeController.json";
import * as VE from "../artifacts/contracts/liquidity-mining/VotingEscrow.vy/VotingEscrow.json";
import * as AM from "./abi/DexTokenManager.json";
import * as LG from "../artifacts/contracts/liquidity-mining/gauges/LiquidityGaugeV5.vy/LiquidityGaugeV5.json";
import { Contract } from "ethers";
import { ERC20_ABI } from "./abi/ERC20ABI";
import { getSigner } from "./deployers/signers";
import { TimelockAuthorizer } from "../typechain";
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
  | "LiquidityGaugeV5"
  | "BoostV2"
  | "VotingEscrowDelegationProxy"
  | "SingleRecipientGaugeFactory"
  | "BALTokenHolder"
  | "FeeDistributor"
  | "GaugeControllerQuerier";
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

export async function getTimelockAuth(address: string) {
  return getCacheOrNew(address, Timelock.abi);
}

export async function getVaultAuthorizer() {
  return getCacheOrNew(await getDeployedContractAddress("TimelockAuthorizer"), [
    "function getPermissionId(bytes32 actionId,address account,address where) public pure returns (bytes32)",
    "function getActionId(bytes4 selector) public view returns (bytes32)",
    "function getActionId(bytes4 selector, bytes32 how) public pure returns (bytes32)",
  ]);
}

export async function getBalTokenAdmin() {
  return getCacheOrNew(await getDeployedContractAddress("BalancerTokenAdmin"), TokenAdmin.abi);
}

export async function getGovernanceToken() {
  return getCacheOrNew(await getDeployedContractAddress("GovernanceToken"), GovenToken.abi);
}

export async function getVotingEscrow() {
  return getCacheOrNew(await getDeployedContractAddress("VotingEscrow"), VE.abi);
}

export async function getBalancerPoolToken(address: string) {
  return getCacheOrNew(address, BPT.abi);
}

export async function getLiquidityGauge(address: string) {
  return getCacheOrNew(address, LG.abi);
}

export async function getAutEntryAdapter() {
  return await getCacheOrNew(await getDeployedContractAddress("AuthorizerAdaptorEntrypoint"), [
    "function getActionId(bytes4) external view returns(bytes32)",
    "function performAction(address, bytes) external returns (bytes)",
    "function canPerform(bytes32, address, address) public view returns (bool)",
  ]);
}

export async function getGaugeController() {
  return await getCacheOrNew(await getDeployedContractAddress("GaugeController"), GC.abi);
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

export async function updateContractAddress(contract: DeployedContract, address: string) {
  const addresses = await getContractAddresses();
  addresses[contract] = address;
}

export async function getContractAddresses() {
  return await fs.readJSON(
    join(process.cwd(), "deployments", `${CHAIN_KEYS[await getChainId()]}`, "addresses.json")
  );
}

export async function getDeployedContractAddress(contractName: DeployedContract): Promise<string> {
  if (addressCache[contractName]) {
    return addressCache[contractName];
  }

  const addresses = await getContractAddresses();

  const addy = addresses[contractName];
  if (!addy) {
    throw new Error(`Contract address lookup failed for: ${contractName}`);
  }

  contractCache[contractName] = addy;

  return addresses[contractName];
}
