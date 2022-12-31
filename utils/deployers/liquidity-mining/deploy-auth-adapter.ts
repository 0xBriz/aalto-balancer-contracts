import { ethers } from "hardhat";
import { logger } from "../logger";

export async function deployAuthAdapter(vault: string) {
  try {
    logger.info(`Deploying AuthorizerAdaptor..`);
    const AuthorizerAdaptor = await ethers.getContractFactory("AuthorizerAdaptor");
    const authAdapter = await AuthorizerAdaptor.deploy(vault);
    await authAdapter.deployed();
    logger.success(`AuthorizerAdaptor deployed to: ${authAdapter.address}`);
    return {
      authAdapter,
      deployment: {
        name: "AuthorizerAdaptor",
        contract: authAdapter,
        args: {
          vault,
        },
      },
    };
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
}
