import { ethers } from "hardhat";
import { saveDeplomentData } from "../../save-deploy-data";
import { logger } from "../../logger";

export async function deployFactory(vault: string, contractName: string) {
  const Factory = await ethers.getContractFactory(contractName);
  const factory = await Factory.deploy(vault);
  await factory.deployed();

  logger.info(`${contractName} deployed to: ${factory.address}`);

  await saveDeplomentData(contractName, factory, {
    vault,
  });

  return factory;
}
