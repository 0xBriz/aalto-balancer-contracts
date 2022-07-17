import { ethers } from "hardhat";

async function main() {
  // Will deploy a BalancerRelayer for itself during construction
  const BaseRelayerLibrary = await ethers.getContractFactory("BaseRelayerLibrary");
  const lib = await BaseRelayerLibrary.deploy("0x26683651C18018b3d6e0754366D145a5CE1b36bc");
  await lib.deployed();
  console.log("BaseRelayerLibrary: ", lib.address);

  console.log("BalancerRelayer at: ", await lib.getEntrypoint());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
