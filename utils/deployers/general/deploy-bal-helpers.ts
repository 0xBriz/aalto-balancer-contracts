import { ethers } from "hardhat";
import { MAINNET_VAULT } from "../../../data/addresses";

async function main() {
  const BalancerHelpers = await ethers.getContractFactory("BalancerHelpers");
  const helper = await BalancerHelpers.deploy(MAINNET_VAULT);
  await helper.deployed();
  console.log("BalancerHelpers deployed to: ", helper.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
