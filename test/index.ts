import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { WeightedPoolFactory__factory } from "../typechain";

const VAULT_ADDRESS = "0x3B415b38f1c2aE9Af2D1e04F30188AD7dE883B7a";
const TIME_AUTH = "0x68a3e75a68aD5b8ED2C59a63b95F39C5D3F8cE71";
const WEIGHTED_FACTORY = "0xbbB3Abfa2dd320d85c64e8825c1E32ad0026fAe5";
const AMES_ADDRESS = "0xb9E05B4C168B56F73940980aE6EF366354357009";
const BUSD_ADDRESS = "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56";
const USDC_ADDRESS = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";
const ZERO_ADDRESS = ethers.constants.AddressZero;

describe("Greeter", () => {
  it("Should deploy a pool", async () => {
    const NAME = "Test Pool";
    const SYMBOL = "50AMES-25BUSD-25USDC";
    const swapFeePercentage = 0.005e18; // 0.5%
    const tokens = [USDC_ADDRESS, AMES_ADDRESS, BUSD_ADDRESS]; // Must be in sorted order
    const weights = [parseUnits("0.5"), parseUnits("0.25"), parseUnits("0.25")];
    const assetManagers = [ZERO_ADDRESS, ZERO_ADDRESS, ZERO_ADDRESS];

    const owner = (await ethers.getSigners())[0];

    const factory = await ethers.getContractAt(
      "WeightedPoolFactory",
      WEIGHTED_FACTORY
    );

    const tx = await factory.create(
      NAME,
      SYMBOL,
      tokens,
      weights,
      assetManagers,
      swapFeePercentage,
      owner.address
    );

    const receipt = await tx.wait();

    const events = receipt.events.filter((e) => e.event === "PoolCreated");
    const poolAddress = events[0].args.pool;
    const pool = await ethers.getContractAt("WeightedPool", poolAddress);
    const poolId = await pool.getPoolId();
    console.log(poolId);
  });
});
