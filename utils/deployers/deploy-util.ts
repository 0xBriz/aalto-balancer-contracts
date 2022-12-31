import { ethers } from "hardhat";
import { DeployedContract } from "../contract-utils";
import { logger } from "./logger";
import { getSigner } from "./signers";

export async function deployContractUtil(contractName: DeployedContract, args = {}) {
  try {
    logger.info(`Deploying contract: ${contractName}`);
    const Factory = await ethers.getContractFactory(contractName, await getSigner());
    const contract = await Factory.deploy(...Object.values(args));
    await contract.deployed();
    logger.success(`${contractName} deployed to: ${contract.address}`);

    // So deployment data can be saved as needed
    return {
      contract,
      deployment: {
        name: contractName,
        contract,
        args,
      },
    };
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
}
