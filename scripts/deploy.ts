import { ethers } from "hardhat";
import { deployContractUtil } from "../utils/deployers/deploy-util";

async function main() {
  const vault = "0x719488F4E859953967eFE963c6Bed059BaAab60c";
  console.log("Current block number: " + (await ethers.provider.getBlockNumber()));
  await deployContractUtil("StablePoolFactory", {
    vault,
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
