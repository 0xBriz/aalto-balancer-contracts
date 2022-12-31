import { ethers } from "hardhat";
import { logger } from "../logger";

export async function deployAuthAdapter(vault: string) {
  try {
    const AuthorizerAdaptor = await ethers.getContractFactory("AuthorizerAdaptor");
    const authAdapter = await AuthorizerAdaptor.deploy(vault);
    await authAdapter.deployed();
    logger.success(`AuthorizerAdaptor deployed to: ${authAdapter.address}`);
    return {
      authAdapter,
      deployment: {
        name: "",
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
