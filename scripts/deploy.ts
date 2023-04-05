import { ethers } from "hardhat";
import { deployContractUtil } from "../utils/deployers/deploy-util";

async function main() {
  const vault = "0xe4E96Cf369D4d604Bedc4d7962F94D53E4B5e3C6";
  console.log("Current block number: " + (await ethers.provider.getBlockNumber()));
  await deployContractUtil("StablePoolFactory", {
    vault,
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
