const hre = require("hardhat");
import { ONE_MONTH_SECONDS, DAY } from "./utils/time";

async function verify(address, args) {
  try {
    await hre.run("verify:verify", {
      address: address,
      constructorArguments: args,
    });
  } catch (error) {
    console.log("Error verify contract", error);
  }
}

async function run() {
  const pauseWindowDuration = ONE_MONTH_SECONDS * 3;
  const bufferPeriodDuration = DAY;
  await verify("0xEE1c8DbfBf958484c6a4571F5FB7b99B74A54AA7", [
    "0x7Bdc7b728cf0a45F0464B84CB90BD9beF01C5E0b",
    "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
    pauseWindowDuration,
    bufferPeriodDuration,
  ]);
}

run().catch(console.log);
