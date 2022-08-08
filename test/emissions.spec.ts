// import { ethers } from "hardhat";
// import * as helpers from "@nomicfoundation/hardhat-network-helpers";
// import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
// import { BigNumber, Contract } from "ethers";
// import { deployVault } from "../scripts/deploy-vault";
// import { deployAdminToken } from "../scripts/deploy-governance-token";
// import { expect } from "chai";
// import { deployTokenAdmin } from "../scripts/utils/lp-mining/deploy-token-admin";
// import TimeAuth from "../artifacts/contracts/authorizer/TimelockAuthorizer.sol/TimelockAuthorizer.json";
// import AuthAdapter from "../artifacts/contracts/liquidity-mining/admin/AuthorizerAdaptor.sol/AuthorizerAdaptor.json";
// import {
//   commify,
//   defaultAbiCoder,
//   formatEther,
//   Interface,
//   parseEther,
//   parseUnits,
// } from "ethers/lib/utils";
// import {
//   awaitTransactionComplete,
//   getFunctionSigHash,
//   getLiquidityGauge,
//   getWeightedPoolInstance,
//   initWeightedJoin,
//   sortTokens,
// } from "./utils";

// const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"; // ETH mainnet

// const SECONDS_IN_DAY = 86400;
// const ONE_DAY_SECONDS = SECONDS_IN_DAY;
// const ONE_WEEK_SECONDS = SECONDS_IN_DAY * 7;
// const ONE_MONTH_SECONDS = SECONDS_IN_DAY * 30;
// const THREE_MONTHS_SECONDS = SECONDS_IN_DAY * 90;
// const SIX_MONTHS_SECONDS = SECONDS_IN_DAY * 180;
// const ONE_YEAR_SECONDS = SECONDS_IN_DAY * 365;

// enum GaugeType {
//   LiquidityMiningCommittee,
//   veBAL,
//   Ethereum,
// }

// interface PoolInfo {
//   name: string;
//   contract: Contract;
//   poolId: string;
//   poolAddress: string;
// }

// describe("Token Emissions", () => {
//   let owner: SignerWithAddress;
//   let AEQ: Contract;
//   let Vault: Contract;
//   let vaultAuthorizer: Contract;
//   let balTokenAdmin: Contract;
//   let balMinter: Contract;

//   beforeEach(async () => {
//     const accounts = await ethers.getSigners();
//     owner = accounts[0];
//     Vault = await deployVault(WETH);
//     vaultAuthorizer = await ethers.getContractAt(TimeAuth.abi, await Vault.getAuthorizer(), owner);
//     AEQ = await deployAdminToken();
//     // await AEQ.mint(owner.address, parseEther("100000"));
//     balTokenAdmin = await deployTokenAdmin(Vault.address, AEQ.address);
//     await giveTokenAdminOwnership();
//   });

//   async function giveTokenAdminOwnership() {
//     // Give vault authorization to account to call `activate`
//     const selector = getFunctionSigHash("function activate() external");
//     // Need the action id from the token admin auth itself so the correct disambiguator is used
//     const actionId = await balTokenAdmin.getActionId(selector);
//     await vaultAuthorizer.grantPermissions([actionId], owner.address, [balTokenAdmin.address]);

//     // Give token admin boss role
//     await AEQ.grantRole(await AEQ.DEFAULT_ADMIN_ROLE(), balTokenAdmin.address);

//     // Trigger admin activation
//     await balTokenAdmin.activate();
//   }

//   function convertDate(seconds: number) {
//     return new Date(seconds * 1000).toLocaleString();
//   }

//   async function getMintableAmount(startSeconds: number, endSeconds: number) {
//     const amount: BigNumber = await balTokenAdmin.mintableInTimeframe(startSeconds, endSeconds);
//     return commify(formatEther(amount));
//   }

//   async function takeSnapshot() {
//     const [
//       rateReductionTime,
//       startEpochTime,
//       nextEpochStart,
//       rate,
//       availableSupply,
//       epochStartingSupply,
//       miningEpoch,
//     ] = await Promise.all([
//       balTokenAdmin.RATE_REDUCTION_TIME(),
//       balTokenAdmin.getStartEpochTime(),
//       balTokenAdmin.getFutureEpochTime(), // Start of next epoch
//       balTokenAdmin.rate(),
//       balTokenAdmin.getAvailableSupply(), // Maximum allowable number of tokens in existence (claimed or unclaimed)
//       balTokenAdmin.getStartEpochSupply(),
//       balTokenAdmin.getMiningEpoch(),
//     ]);

//     const mintable = await getMintableAmount(startEpochTime, nextEpochStart);

//     const data = {
//       epochStart: convertDate(startEpochTime),
//       startOfNextEpoch: convertDate(nextEpochStart),
//       epochStartingSupply: commify(formatEther(epochStartingSupply)),
//       currentRate: formatEther(rate),
//       miningEpoch: miningEpoch.toNumber(),
//       mintableInEpoch: mintable,
//       totalAvailableSupply: commify(formatEther(availableSupply)),
//     };

//     return data;
//   }

//   async function runTimeLoop() {
//     // Try to snapshot every month until end of mining epochs
//     // 1189207115002721024

//     console.log(formatEther(BigNumber.from("97325973987698445")));
//     console.log(formatEther(BigNumber.from("40920531318665947")));
//     console.log(formatEther(BigNumber.from("17204964048071776")));
//     console.log(formatEther(BigNumber.from("7233796296296297")));
//     console.log(formatEther(BigNumber.from("3041436687115576")));

//     // const epochs = new Array(5);
//     // for (const epoch of epochs) {
//     //   await logEmissionsInfo();
//     //   await helpers.time.increase(ONE_YEAR_SECONDS);
//     //   await balTokenAdmin.updateMiningParameters();
//     // }
//   }

//   async function logEmissionsInfo() {
//     let [
//       rateReductionTime,
//       startEpochTime,
//       nextEpochStart,
//       rate,
//       availableSupply,
//       epochStartingSupply,
//       miningEpoch,
//     ] = await Promise.all([
//       balTokenAdmin.RATE_REDUCTION_TIME(),
//       balTokenAdmin.getStartEpochTime(),
//       balTokenAdmin.getFutureEpochTime(), // Start of next epoch
//       balTokenAdmin.rate(),
//       balTokenAdmin.getAvailableSupply(), // Maximum allowable number of tokens in existence (claimed or unclaimed)
//       balTokenAdmin.getStartEpochSupply(),
//       balTokenAdmin.getMiningEpoch(),
//     ]);

//     // const rateReductionSeconds = rateReductionTime.toNumber();
//     // const rateReductionDays = rateReductionSeconds / SECONDS_IN_DAY;
//     const mintable = await getMintableAmount(startEpochTime, nextEpochStart);

//     // console.log(`
//     // Rate reduction time(seconds):   ${rateReductionTime.toNumber()}
//     // In days:                        ${rateReductionDays}
//     // `);

//     console.log(`
//     Epoch start time:                   ${convertDate(startEpochTime)}
//     Start of next epoch:                ${convertDate(nextEpochStart)}
//     Epoch starting supply:              ${commify(formatEther(epochStartingSupply))}
//     Current rate:                       ${formatEther(rate)}
//     Minig epoch:                        ${miningEpoch.toNumber()}
//     Mintable amount this epoch:         ${mintable}
//     Total available supply:             ${commify(formatEther(availableSupply))}
//     `);

//     return {
//       startEpochTime,
//       nextEpochStart,
//     };
//   }

//   it("should follow the correct emissions curve", async () => {
//     await runTimeLoop();
//   });
// });
