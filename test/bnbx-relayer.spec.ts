// import * as helpers from "@nomicfoundation/hardhat-network-helpers";
// import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
// import { BigNumber, Contract } from "ethers";
// import { ethers, network } from "hardhat";
// import { JsonRpcSigner } from "@ethersproject/providers";
// import { formatEther, parseEther } from "ethers/lib/utils";
// import { giveTokenBalanceFor } from "./utils";

// describe("BNBxRelayer", () => {
//   const BNBX_ADDRESS = "0x1bdd3Cf7F79cfB8EdbB955f20ad99211551BA275";
//   const OPERATOR = "0x891eFc56f5CD6580b2fEA416adC960F2A6156494";
//   const BNBX_BALANCEOF_SLOT = 51;
//   let owner: JsonRpcSigner;
//   let BNBx: Contract;

//   async function createPool() {
//     // Need token amounts. BNB is set in beforeEach
//     // Need BNBx amount to create pool
//     // Need the wBNBx deployed
//   }

//   beforeEach(async () => {
//     await helpers.impersonateAccount(OPERATOR);
//     owner = await ethers.provider.getSigner(OPERATOR);

//     await helpers.setBalance(OPERATOR, parseEther("1000"));
//     await giveTokenBalanceFor(
//       ethers.provider,
//       BNBX_ADDRESS,
//       OPERATOR,
//       BNBX_BALANCEOF_SLOT,
//       parseEther("1000")
//     );

//     BNBx = await ethers.getContractAt(
//       ["function balanceOf(address) public view returns(uint256)"],
//       BNBX_ADDRESS,
//       owner
//     );
//   });

//   describe("Wrapping", () => {
//     it("should wrap BNBx into wBNBx", async () => {
//       console.log(formatEther(await BNBx.balanceOf(OPERATOR)));
//     });

//     it("should unwrap wBNBx into BNBx", async () => {});
//   });

//   describe("Swaps", () => {
//     it("should perform a single swap", async () => {});

//     it("should perform a batch swap", async () => {});
//   });

//   describe("Pool Operations", () => {
//     it("should join a pool for a user", async () => {});

//     it("should exit a pool for a user", async () => {});
//   });
// });
