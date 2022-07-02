import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { expect } from "chai";
import { parseEther, parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { WeightedPoolFactory__factory } from "../typechain";
import {
  AMES_BALANCEOF_SLOT,
  ASHARE_BALANCEOF_SLOT,
  BUSD_BALANCEOF_SLOT,
  prepStorageSlotWrite,
  setStorageAt,
  USDC_BALANCEOF_SLOT,
} from "./utils";

const MAINNET_VAULT = "0xc37c34eA9CA579aDF279A16C547e801ed722F3b5";
const MAINNET_TIME_AUTH = "0x920C87A2853b02D5233d3Eb0608e660eb04de860";
const MAIN_WEGHTED_FACTORY = "0xC07511107Fb851ca95Faf0dc0804F9F287aAd7c9";
const MULTICALL = "0x15b41874b4B1f3370424413a9F0bC647c865bE79";

const VAULT_ADDRESS = "0x3B415b38f1c2aE9Af2D1e04F30188AD7dE883B7a";
const TIME_AUTH = "0x68a3e75a68aD5b8ED2C59a63b95F39C5D3F8cE71";
const WEIGHTED_FACTORY = "0xbbB3Abfa2dd320d85c64e8825c1E32ad0026fAe5";
const AMES_ADDRESS = "0xb9E05B4C168B56F73940980aE6EF366354357009";
const BUSD_ADDRESS = "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56";
const USDC_ADDRESS = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";
const ZERO_ADDRESS = ethers.constants.AddressZero;
const ASHARE_ADDRESS = "0xFa4b16b0f63F5A6D0651592620D585D308F749A4";

describe("Weighted Pool Creation", () => {
  let owner: SignerWithAddress;

  beforeEach(async () => {
    const accounts = await ethers.getSigners();
    owner = accounts[0];
  });

  async function createThreePool() {
    // Must be in address sorted order
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
    ];

    const NAME = "AMES-BUSD-USDC";
    const SYMBOL = "50AMES-25BUSD-25USDC";
    const swapFeePercentage = parseUnits("0.005"); // 0.5%

    const weights = [parseUnits("0.5"), parseUnits("0.25"), parseUnits("0.25")];
    const assetManagers = [ZERO_ADDRESS, ZERO_ADDRESS, ZERO_ADDRESS];

    const factory = await ethers.getContractAt("WeightedPoolFactory", WEIGHTED_FACTORY);

    const tx = await factory.create(
      NAME,
      SYMBOL,
      TOKENS.map((tk) => tk.address),
      weights,
      assetManagers,
      swapFeePercentage,
      owner.address
    );
  }

  async function createAmesPool() {
    // Must be in address sorted order
    const TOKENS = [
      {
        address: AMES_ADDRESS,
        slot: AMES_BALANCEOF_SLOT,
      },
      {
        address: BUSD_ADDRESS,
        slot: BUSD_BALANCEOF_SLOT,
      },
    ];

    const NAME = "AMES-BUSD";
    const SYMBOL = "50AMES-50BUSD";
    const swapFeePercentage = parseUnits("0.005"); // 0.5%

    const weights = [parseUnits("0.5"), parseUnits("0.5")];
    const assetManagers = [ZERO_ADDRESS, ZERO_ADDRESS];

    const factory = await ethers.getContractAt("WeightedPoolFactory", WEIGHTED_FACTORY);

    const tx = await factory.create(
      NAME,
      SYMBOL,
      TOKENS.map((tk) => tk.address),
      weights,
      assetManagers,
      swapFeePercentage,
      owner.address
    );
  }

  async function createAsharePool() {
    // Must be in address sorted order
    const TOKENS = [
      {
        address: BUSD_ADDRESS,
        slot: BUSD_BALANCEOF_SLOT,
      },
      {
        address: ASHARE_ADDRESS,
        slot: AMES_BALANCEOF_SLOT,
      },
    ];

    const NAME = "ASHARE-BUSD";
    const SYMBOL = "50ASHARE-50BUSD";
    const swapFeePercentage = parseUnits("0.005"); // 0.5%

    const weights = [parseUnits("0.5"), parseUnits("0.5")];
    const assetManagers = [ZERO_ADDRESS, ZERO_ADDRESS];

    const factory = await ethers.getContractAt("WeightedPoolFactory", WEIGHTED_FACTORY);

    const tx = await factory.create(
      NAME,
      SYMBOL,
      TOKENS.map((tk) => tk.address),
      weights,
      assetManagers,
      swapFeePercentage,
      owner.address
    );
  }

  it("Should deploy a pool", async () => {
    await createThreePool();
    await createAmesPool();
    await createAsharePool();
  });

  // it("should add tokens to the pool", async () => {
  //   // Need to fund test user
  //   const initialBalances = [
  //     parseEther("1000"),
  //     parseEther("1000"),
  //     parseUnits("1000", 6), // USDC has 6 decimals. Needs to be set properly so normalization of weights is scaled correctly
  //   ];

  //   let i = 0;
  //   for (const token of TOKENS) {
  //     const tokenContract = await ethers.getContractAt("ERC20", token.address);
  //     await tokenContract.approve(VAULT_ADDRESS, ethers.constants.MaxUint256);

  //     // Overwrite test user balances
  //     const slot = prepStorageSlotWrite(owner.address, token.slot);
  //     await setStorageAt(
  //       ethers.provider,
  //       token.address,
  //       slot,
  //       initialBalances[i]
  //     );

  //     i++;
  //   }

  //   const JOIN_KIND_INIT = 0; // Can only be called once for most pools

  //   // Must be encoded
  //   const initUserData = ethers.utils.defaultAbiCoder.encode(
  //     ["uint256", "uint256[]"],
  //     [JOIN_KIND_INIT, initialBalances]
  //   );

  //   // export interface JoinPoolRequest {
  //   //   assets: Address[];
  //   //   maxAmountsIn: string[];
  //   //   userData: any;
  //   //   fromInternalBalance: boolean;
  //   // }

  //   const joinPoolRequest = {
  //     assets: TOKENS.map((tk) => tk.address),
  //     maxAmountsIn: initialBalances,
  //     userData: initUserData,
  //     fromInternalBalance: false,
  //   };

  //   const vault = await ethers.getContractAt("Vault", VAULT_ADDRESS);

  //   const caller = owner.address;
  //   // joins are done on the Vault
  //   const tx = await vault.joinPool(poolId, caller, caller, joinPoolRequest);
  //   const receipt = await tx.wait();
  //   console.log(receipt);
  // });

  // it("should gimme pool id", () => {
  //   console.log(
  //     ethers.utils.isHexString(
  //       "0x0676ec2b7942ea895b912e51155a701ea5ed8841000100000000000000000000"
  //     )
  //   );
  // });
});
