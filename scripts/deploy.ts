import { ethers } from "hardhat";

const WETH = ""; // WBNB

async function main() {
  // Needs deployment also:
  // - ProtocolFeesCollector
  // - BalancerHelpers

  // constructor(
  //   IAuthorizer authorizer, // TimelockAuthorizer,
  //   IWETH weth,
  //   uint256 pauseWindowDuration,
  //   uint256 bufferPeriodDuration
  // )
  const Vault = await ethers.getContractFactory("Vault");
  const vault = await Vault.deploy();
  await vault.deployed();
  console.log("Vault deployed to: ", vault.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
