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
    console.log(`Saving deployment data for ${filename}`);
    const txData = contract.deployTransaction;
    const receipt = await txData.wait(1);

    console.log(txData);
    console.log(receipt);

    const data = {
      name: filename,
      address: receipt.contractAddress,
      deploymentArgs,
      txData,
    };
    const file = filename + ".json";
    await fs.writeJSON(
      join(process.cwd(), "deployments", CHAINS[ethers.provider.network.chainId], file),
      data
    );
    console.log("Save deploy data for: " + filename);
    console.log(data);
    console.log("VERIFY CONTRACT!!");
  } catch (error) {
    throw error;
  }
}
