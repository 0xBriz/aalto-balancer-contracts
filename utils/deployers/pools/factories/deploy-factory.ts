import { ethers } from "hardhat";
import { saveDeplomentData } from "../../../save-deploy-data";

export async function deployFactory(vault: string, contractName: string) {
  const Factory = await ethers.getContractFactory(contractName);
  const factory = await Factory.deploy(vault);
  await factory.deployed();
  console.log(`${contractName} deployed to: ${factory.address}`);

  await saveDeplomentData(contractName, factory, {
    vault,
  });

  return factory;
}
