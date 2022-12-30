import { ethers } from "hardhat";
import * as fs from "fs-extra";
import { join } from "path";
import { Contract } from "ethers";
import { CHAIN_KEYS } from "./data/chains";
import { logger } from "./deployers/logger";

export async function saveDeplomentData(filename: string, contract: Contract, deploymentArgs = {}) {
  try {
    const basePath = join(
      process.cwd(),
      "deployments",
      CHAIN_KEYS[ethers.provider.network.chainId]
    );

    logger.info(`Saving deployment data for ${filename}`);

    const txData = contract.deployTransaction;
    const receipt = await txData.wait(1);

    // console.log(txData);
    // console.log(receipt);

    const data = {
      name: filename,
      address: receipt.contractAddress,
      deploymentArgs,
      txData,
    };

    await fs.writeJSON(join(basePath, `${filename}-${Date.now()}.json`), data);
    const addressPath = join(basePath, "addresses.json");
    const addresses = await fs.readJSON(addressPath);
    addresses[filename] = receipt.contractAddress;
    await fs.writeJSON(addressPath, addresses);

    logger.success("Save completed");
    // console.log(data);
    logger.warn("VERIFY CONTRACT!!");
  } catch (error) {
    throw error;
  }
}
