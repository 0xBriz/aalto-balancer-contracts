import * as fs from "fs-extra";
import { join } from "path";
import { CHAIN_KEYS } from "./chains";

export async function getDeployedContractAddress(
  chainId: number,
  contractName: string
): Promise<string> {
  const addresses = await fs.readJSON(
    join(process.cwd(), "deployments", `${CHAIN_KEYS[chainId]}`, "addresses.json")
  );

  if (!addresses[contractName]) {
    throw new Error(`Contract address lookup failed for: ${contractName}`);
  }

  return addresses[contractName];
}
