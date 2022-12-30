import * as fs from "fs-extra";
import { ethers } from "hardhat";
import { join } from "path";
import { CHAIN_KEYS } from "../../data/chains";

export async function createPools() {
  try {
    await ethers.provider.ready;

    const basePath = join(
      process.cwd(),
      "utils",
      "data",
      `${CHAIN_KEYS[ethers.provider.network.chainId]}-pools.json`
    );
    const poolInfo = await fs.readJSON(basePath);
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
}
