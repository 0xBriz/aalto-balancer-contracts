import { ethers } from "hardhat";
import * as fs from "fs-extra";
import { join } from "path";
import { Contract } from "ethers";

const CHAINS = {
  5: "goerli",
  56: "bsc",
};

export async function saveDeplomentData(filename: string, contract: Contract, deploymentArgs = {}) {
  try {
    const basePath = join(process.cwd(), "deployments", CHAINS[ethers.provider.network.chainId]);

    console.log(`Saving deployment data for ${filename}`);

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

    const when = new Date();
    const label = `${when.getFullYear()}-${when.getDay()}${when.getMonth()}`;

    await fs.writeJSON(join(basePath, `${label}-${filename}.json`), data);

    const addressPath = join(basePath, "addresses.json");
    const addresses = await fs.readJSON(addressPath);
    addresses[filename] = receipt.contractAddress;
    await fs.writeJSON(addressPath, addresses);

    console.log("Save completed");
    // console.log(data);
    console.log("VERIFY CONTRACT!!");
  } catch (error) {
    throw error;
  }
}
