import { ethers } from "hardhat";
import { predictAddresses } from "./utils/predictAddresses";
import { MONTH } from "./utils/time";

async function main() {
  // Needs deployment also:
  // - ProtocolFeesCollector
  // - BalancerHelpers

  const admin = (await ethers.getSigners())[0];

  const { vaultAddress, authorizerAddress } = await predictAddresses(
    admin.address
  );
  console.log("Predicted Vault address: " + vaultAddress);
  console.log("Predicted TimelockAuthorizer address: " + authorizerAddress);

  // Vault

  const WETH = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c"; // WBNB
  const pauseWindowDuration = 0;
  const bufferPeriodDuration = 0;

  const Vault = await ethers.getContractFactory("Vault");
  const vault = await Vault.deploy(
    authorizerAddress,
    WETH,
    pauseWindowDuration,
    bufferPeriodDuration
  );
  await vault.deployed();
  console.log("Vault deployed to: ", vault.address);

  // TimeAuth

  const rootTransferDelay = MONTH;

  const TimelockAuthorizer = await ethers.getContractFactory(
    "TimelockAuthorizer"
  );
  const authorizer = await TimelockAuthorizer.deploy(
    admin.address,
    vault.address,
    rootTransferDelay
  );
  await authorizer.deployed();
  console.log("TimelockAuthorizer deployed to: ", authorizer.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
