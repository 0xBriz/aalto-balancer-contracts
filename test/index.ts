import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { expect } from "chai";
import { parseEther, parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { WeightedPoolFactory__factory } from "../typechain";
import {
  AMES_BALANCEOF_SLOT,
  BUSD_BALANCEOF_SLOT,
  prepStorageSlotWrite,
  setStorageAt,
  USDC_BALANCEOF_SLOT,
} from "./utils";

const VAULT_ADDRESS = "0x3B415b38f1c2aE9Af2D1e04F30188AD7dE883B7a";
const TIME_AUTH = "0x68a3e75a68aD5b8ED2C59a63b95F39C5D3F8cE71";
const WEIGHTED_FACTORY = "0xbbB3Abfa2dd320d85c64e8825c1E32ad0026fAe5";
const AMES_ADDRESS = "0xb9E05B4C168B56F73940980aE6EF366354357009";
const BUSD_ADDRESS = "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56";
const USDC_ADDRESS = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";
const ZERO_ADDRESS = ethers.constants.AddressZero;

const TOKENS = [
  {
    address: USDC_ADDRESS,
    slot: USDC_BALANCEOF_SLOT,
  },
  {
    address: AMES_ADDRESS,
    slot: AMES_BALANCEOF_SLOT,
  },
  {
    address: BUSD_ADDRESS,
    slot: BUSD_BALANCEOF_SLOT,
  },
]; // Must be in sorted order
const poolId =
  "0x0676ec2b7942ea895b912e51155a701ea5ed8841000100000000000000000000";

describe("Weight Pool Creation", () => {
  let owner: SignerWithAddress;

  beforeEach(async () => {
    const accounts = await ethers.getSigners();
    owner = accounts[0];
  });
  // it("Should deploy a pool", async () => {
  //   const NAME = "Test Pool";
  //   const SYMBOL = "50AMES-25BUSD-25USDC";
  //   const swapFeePercentage = 0.005e18; // 0.5%

  //   const weights = [parseUnits("0.5"), parseUnits("0.25"), parseUnits("0.25")];
  //   const assetManagers = [ZERO_ADDRESS, ZERO_ADDRESS, ZERO_ADDRESS];

  //   const factory = await ethers.getContractAt(
  //     "WeightedPoolFactory",
  //     WEIGHTED_FACTORY
  //   );

  //   const tx = await factory.create(
  //     NAME,
  //     SYMBOL,
  //     TOKENS,
  //     weights,
  //     assetManagers,
  //     swapFeePercentage,
  //     owner.address
  //   );

  //   const receipt = await tx.wait();

  //   const events = receipt.events.filter((e) => e.event === "PoolCreated");
  //   const poolAddress = events[0].args.pool;
  //   const pool = await ethers.getContractAt("WeightedPool", poolAddress);
  //   const poolId = await pool.getPoolId();
  //   console.log(poolId);
  // });

  it("should add tokens to the pool", async () => {
    // Need to fund test user
    const initialBalances = [
      parseEther("1000"),
      parseEther("1000"),
      parseEther("1000"),
    ];

    let i = 0;
    for (const token of TOKENS) {
      const tokenContract = await ethers.getContractAt("ERC20", token.address);
      await tokenContract.approve(VAULT_ADDRESS, ethers.constants.MaxUint256);

      // Overwrite test user balances
      const slot = prepStorageSlotWrite(owner.address, token.slot);
      await setStorageAt(
        ethers.provider,
        token.address,
        slot,
        initialBalances[i]
      );

      i++;
    }

    const JOIN_KIND_INIT = 0; // Can only be called once for most pools

    // Must be encoded
    const initUserData = ethers.utils.defaultAbiCoder.encode(
      ["uint256", "uint256[]"],
      [JOIN_KIND_INIT, initialBalances]
    );

    const joinPoolRequest = {
      assets: TOKENS.map((tk) => tk.address),
      maxAmountsIn: initialBalances,
      userData: initUserData,
      fromInternalBalance: false,
    };

    const vault = await ethers.getContractAt("Vault", VAULT_ADDRESS);

    const caller = owner.address;
    // joins are done on the Vault
    const tx = await vault.joinPool(poolId, caller, caller, joinPoolRequest);
    const receipt = await tx.wait();
    console.log(receipt);
  });
});
