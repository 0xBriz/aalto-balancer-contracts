import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import { saveDeplomentData } from "./save-deploy-data";

export async function deployTestERC20(name: string, symbol: string, initialMint: BigNumber) {
  try {
    const TestERC20 = await ethers.getContractFactory("TestERC20");
    const token = await TestERC20.deploy(name, symbol, initialMint);
    await token.deployed();
    console.log(`${symbol} address:  `, token.address);

    // await saveDeplomentData(name + "-" + symbol, {
    //   chainId,

    //   symbol,
    // });
    return token;
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
}
