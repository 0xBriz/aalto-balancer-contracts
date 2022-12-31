import * as fs from "fs-extra";
import { join } from "path";
import { getChainId } from "../deployers/network";
import { CHAIN_KEYS } from "./chains";

export type DeployedContract = "WeightedPoolFactory" | "AssetManager" | "Vault";

// Doing actual file reads every time here.
// Maybe save some milliseconds per, but with a long job using the same contracts, saving some total seconds iz good
const contractCache: { [contractName: string]: string } = {};

export async function getDeployedContractAddress(contractName: DeployedContract): Promise<string> {
  // if (contractCache[contractName]) {
  //   return contractCache[contractName];
  // }

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
