import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import { saveDeplomentData } from "../scripts/utils/save-deploy-data";

export async function deployTestERC20(
  name: string,
  symbol: string,
  initialMint: BigNumber,
  chainId: number,
  saveData = true
) {
  try {
    const TestERC20 = await ethers.getContractFactory("TestERC20");
    const token = await TestERC20.deploy(name, symbol, initialMint);
    await token.deployed();
    console.log(`${symbol} address:  `, token.address);

    if (saveData) {
      await saveDeplomentData(
        symbol,
        {
          address: token.address,
        },
        chainId
      );
    }

    return token;
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
}
