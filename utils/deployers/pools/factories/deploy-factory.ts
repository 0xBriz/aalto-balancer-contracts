import { ethers } from "hardhat";
import { logger } from "../../logger";

export async function deployFactory(vault: string, contractName: string) {
  const Factory = await ethers.getContractFactory(contractName);
  const factory = await Factory.deploy(vault);
  await factory.deployed();

  logger.success(`${contractName} deployed to: ${factory.address}`);

  return {
    factory,
    deployment: {
      name: contractName,
      contract: factory,
      args: {
        vault,
      },
    },
  };
}
