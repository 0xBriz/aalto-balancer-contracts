import * as fs from "fs-extra";
import { join } from "path";
import { CHAIN_KEYS } from "../data/chains";
import { logger } from "./logger";
import { DeploymentData } from "../types";
import { getChainId } from "./network";

export async function saveDeploymentData(deployment: DeploymentData) {
  try {
    const chainId = await getChainId();
    const basePath = join(process.cwd(), "deployments", CHAIN_KEYS[chainId]);

    logger.info(`saveDeplomentData: Saving deployment data for ${deployment.name}`);

    const txData = deployment.contract.deployTransaction;
    const receipt = await txData.wait(1);

    // console.log(txData);
    // console.log(receipt);

    const data = {
      name: deployment.name,
      address: receipt.contractAddress,
      deploymentArgs: deployment.args || {},
      txData,
    };

    // Hardhat test env
    if (chainId !== 31337) {
      await fs.writeJSON(join(basePath, `${deployment.name}-${Date.now()}.json`), data);
    }

    const addressPath = join(basePath, "addresses.json");
    const addresses = await fs.readJSON(addressPath);
    addresses[deployment.name] = receipt.contractAddress;
    await fs.writeJSON(addressPath, addresses);

    logger.success(`saveDeplomentData: Deployment data save completed for ${deployment.name}`);
    // logger.warn("VERIFY CONTRACT!!");
  } catch (error) {
    throw error;
  }
}
