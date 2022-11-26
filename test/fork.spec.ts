// import * as helpers from "@nomicfoundation/hardhat-network-helpers";
// import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
// import { BigNumber, Contract } from "ethers";
// import { ethers, network } from "hardhat";
// import GC from "../artifacts/contracts/liquidity-mining/GaugeController.vy/GaugeController.json";
// import Mint from "../artifacts/contracts/liquidity-mining/BalancerMinter.sol/BalancerMinter.json";
// import Token from "../artifacts/contracts/liquidity-mining/governance/AequinoxToken.sol/AequinoxToken.json";
// import VA from "../artifacts/contracts/Vault.sol/Vault.json";
// import TimeAuth from "../artifacts/contracts/authorizer/TimelockAuthorizer.sol/TimelockAuthorizer.json";
// import Adapter from "../artifacts/contracts/liquidity-mining/admin/AuthorizerAdaptor.sol/AuthorizerAdaptor.json";
// import VE from "../artifacts/contracts/liquidity-mining/VotingEscrow.vy/VotingEscrow.json";
// import BA from "../artifacts/contracts/liquidity-mining/BalancerTokenAdmin.sol/BalancerTokenAdmin.json";
// import BT from "../artifacts/contracts/liquidity-mining/BalTokenHolder.sol/BALTokenHolder.json";
// import FD from "../artifacts/contracts/liquidity-mining/fee-distribution/FeeDistributor.sol/FeeDistributor.json";
// import SG from "../artifacts/contracts/liquidity-mining/gauges/SingleRecipientGauge.sol/SingleRecipientGauge.json";
// import { expect } from "chai";
// import { JsonRpcSigner } from "@ethersproject/providers";
// import { defaultAbiCoder, formatEther, parseEther, parseUnits } from "ethers/lib/utils";
// import moment from "moment";
// import {
//   approveTokensIfNeeded,
//   getLiquidityGauge,
//   getPreviousEpoch,
//   toUnixTimestamp,
// } from "./utils";
// import * as W2T from "./abis/WeightedPool2Tokens.json";
// import { max } from "date-fns";

// describe("Mainnet setup", () => {
//   let AEQ: Contract;

//   let Vault: Contract;
//   let vaultAuthorizer: Contract;
//   let authAdapter: Contract;
//   let balTokenAdmin: Contract;
//   let votingEscrow: Contract;
//   let gaugeController: Contract;
//   let balMinter: Contract;
//   let singleRecipientGauge: Contract;
//   let balTokenHolder: Contract;
//   let feeDistributor: Contract;
//   let veBalHelper: Contract;
//   let AEQ_BNB: Contract;

//   let veBoost: Contract;

//   let owner: JsonRpcSigner;
//   let stakeForUser: SignerWithAddress;
//   let testPairToken: Contract;
//   let aeqBNB: Contract;
//   let weightedFactory: Contract;
//   let testRewardToken: Contract;
//   let liquidityGaugeFactory: Contract;
//   let singleRecipientFactory: Contract;

//   const OPERATOR = "0x891eFc56f5CD6580b2fEA416adC960F2A6156494";

//   const ashareBusdGaugeAddress = "0x1dA7F4b2B9B644f307A313e304E1B061Eb605965";
//   const amesBusdGauge = "0xDA9D57cAabBe48301d71b7eEaf546B4A206118d3";
//   const wAaltoBusd = "0xD105D7e65922e1ac725b799481c5c113cFfA2f0D";
//   const wbnbBusdGauge = "0x34EA84d3565824573073b1A63057baf57f842F02";
//   const triBlueChipsGauge = "0x00687547D75A2d1378984bE922e1450CcC89211E";
//   const stablesGauge = "0xaCC31d29022C8Eb2683597bF4c07De228Ed9EA07";
//   const usdcBnb = "0x9721189e8ac5DD0011EaB1Ee7c25B24624b75801";
//   const technicolorGauge = "0xc328f8308B915D7DCD7D65d9c0e0a225abb3A95f";
//   const blueMaxiGauge = "0x6d97daB82286D61225265232ea07FD50828F5F18";
//   const veGauge = "0x177cA62c024Aaa0c3c65F7c8BA283b824556DAB0";

//   const gaugeAddresses = [
//     veGauge,
//     // stablesGauge,
//     // ashareBusdGaugeAddress,
//     amesBusdGauge,
//     // wAaltoBusd,
//     wbnbBusdGauge,
//     triBlueChipsGauge,
//     usdcBnb,
//     technicolorGauge,
//     blueMaxiGauge,
//   ];

//   beforeEach(async () => {
//     // Dev owner account
//     await helpers.impersonateAccount(OPERATOR);
//     owner = await ethers.provider.getSigner(OPERATOR);
//     await helpers.setBalance(OPERATOR, parseEther("100"));

//     AEQ_BNB = await ethers.getContractAt(
//       W2T.abi,
//       "0x7a09ddF458FdA6e324A97D1a8E4304856fb3e702",
//       owner
//     );
//     AEQ = await ethers.getContractAt(
//       Token.abi,
//       "0x0dDef12012eD645f12AEb1B845Cb5ad61C7423F5",
//       owner
//     );
//     veBalHelper = await ethers.getContractAt(
//       ["function gauge_relative_weight(address) public view returns (uint256)"],
//       "0x13C3d00FB2F37dEea036B1dF6Ca9963e8690fAa6",
//       owner
//     );
//     balMinter = await ethers.getContractAt(
//       Mint.abi,
//       "0x513f235C0bCCdeeecb81e2688453CAfaDf65c5e3",
//       owner
//     );
//     balTokenAdmin = await ethers.getContractAt(
//       BA.abi,
//       "0xDe3258Fce4Afe0aB38CA3A61B21ACAD802250880",
//       owner
//     );
//     gaugeController = await ethers.getContractAt(
//       GC.abi,
//       "0x585ECE7932226CCf5A259c367781F07EBBB1950F",
//       owner
//     );
//     // Vault = await ethers.getContractAt(VA.abi, "0xEE1c8DbfBf958484c6a4571F5FB7b99B74A54AA7", owner);
//     // vaultAuthorizer = await ethers.getContractAt(
//     //   TimeAuth.abi,
//     //   "0x7Bdc7b728cf0a45F0464B84CB90BD9beF01C5E0b",
//     //   owner
//     // );
//     authAdapter = await ethers.getContractAt(
//       Adapter.abi,
//       "0x12fd0D8d8dA6A5c423CdcF7f6481353A5E13CfBc",
//       owner
//     );
//     // votingEscrow = await ethers.getContractAt(
//     //   VE.abi,
//     //   "0x06Aba6E8F69A0Be680f96D923EFB682E63Db6a9f",
//     //   owner
//     // );
//     balTokenHolder = await ethers.getContractAt(
//       BT.abi,
//       "0x97a1b849857bF8656fb150C45d125B0a8BAa88D0",
//       owner
//     );
//     // feeDistributor = await ethers.getContractAt(
//     //   FD.abi,
//     //   "0x5215012e7509C63f4B78020b02842e930BCf0a82",
//     //   owner
//     // );
//     singleRecipientGauge = await ethers.getContractAt(
//       SG.abi,
//       "0x177cA62c024Aaa0c3c65F7c8BA283b824556DAB0",
//       owner
//     );
//   });

//   it("should not end us", async () => {
//     const epochStamp = BigNumber.from(toUnixTimestamp(getPreviousEpoch(0).getTime()));
//     const next = moment().add(1, "day").startOf("day").utc().unix();
//     const DAY = 86400;
//     const WEEK = DAY * 7;

//     const technicolorUser = "0x179c4ef17188fe081b977b5e522bcd2071551b52";
//     const triBlueChipsGaugeUser = "0xd0c5c6454524eb80056e345fa283f461b2b1ecc3";
//     const amesBusdGaugeUser = "0x276aae2cb997ba9e00292b7f3f7ff151a79b199d"; // owns 27%
//     const usdcBnbUser = "0x2e7d56de3a38d60d9c9cb30bbeaf32f3a3a7e19d";
//     const blueMaxiGaugeUser = "0x5b39829b09a1b81e920a0c514a46a390cb0aa4cb"; // owns 95%
//     const wbnbBusdGaugeUser = "0xe2036acc4a5aef7df28ee817f093edb3e1de3e0b";

//     // const user = amesBusdGaugeUser;
//     // const aeqGauge = amesBusdGauge;
//     // await helpers.impersonateAccount(user);
//     // const signer = await ethers.provider.getSigner(user);
//     // const gauge = new Contract(
//     //   aeqGauge,
//     //   [
//     //     "function withdraw(uint256) external",
//     //     "function balanceOf(address) public view returns (uint256)",
//     //     "function claimable_tokens(address) public view returns (uint256)",
//     //   ],
//     //   signer
//     // );

//     // console.log(formatEther(await AEQ.balanceOf(balTokenHolder.address)));
//     // const calldata = singleRecipientGauge.interface.encodeFunctionData("checkpoint");
//     // await authAdapter.performAction(singleRecipientGauge.address, calldata);
//     // console.log(formatEther(await AEQ.balanceOf(balTokenHolder.address)));

//     // await logWeights(epochStamp);

//     // await gaugeController.change_gauge_weight(amesBusdGauge, 1);
//     // await gaugeController.change_gauge_weight(wbnbBusdGauge, 1);
//     // await gaugeController.change_gauge_weight(usdcBnb, 1);
//     // await gaugeController.change_gauge_weight(technicolorGauge, 1);
//     // await gaugeController.change_gauge_weight(blueMaxiGauge, 1);

//     // console.log(`
//     // `);
//     // await logWeights(next);

//     const stables = getLiquidityGauge(stablesGauge, owner);
//     const wrapped = getLiquidityGauge(wAaltoBusd, owner);
//     const ashare = getLiquidityGauge(ashareBusdGaugeAddress, owner);
//     const maxi = getLiquidityGauge(blueMaxiGauge, owner);

//     // await gaugeController.checkpoint();

//     // const calldata = singleRecipientGauge.interface.encodeFunctionData("checkpoint");
//     // await authAdapter.performAction(singleRecipientGauge.address, calldata);
//   });

//   async function calculateTokenPayableToGauge(address: string, inflationRate) {
//     const gauge = new Contract(
//       address,
//       ["function working_supply() public view returns (uint256)"],
//       ethers.provider
//     );

//     const gaugeRelativeWeight = await veBalHelper.gauge_relative_weight(address);
//     const weightNum = Number(formatEther(gaugeRelativeWeight));
//     console.log("weight: " + weightNum);
//     console.log("inflationRate: " + inflationRate);
//     const payable = inflationRate * 86400 * 7 * weightNum;
//     const workingSupply = Number(formatEther(await gauge.working_supply()));
//     console.log("workingSupply: " + inflationRate);
//     const workingBalance = 0.4;
//     const share = workingBalance / (workingSupply + workingBalance);
//     console.log("share: " + share);
//     const weeklyAmount = share * payable;
//     console.log("weeklyAmount: " + weeklyAmount);

//     return weeklyAmount;
//   }

//   async function logWeights(time) {
//     for (const gAdd of gaugeAddresses) {
//       console.log(gAdd);
//       const relWeight = await gaugeController.gauge_relative_weight(gAdd, time);
//       console.log("relWeight: " + formatEther(relWeight));

//       // const straightWeight = await gaugeController.get_gauge_weight(gAdd);
//       // console.log("straightWeight: " + formatEther(straightWeight));
//     }
//   }

//   async function checkpoint() {
//     for (const gAdd of gaugeAddresses) {
//       await gaugeController.checkpoint_gauge(gAdd);
//     }
//   }

//   async function runForGauges(fn) {
//     for (const gAdd of gaugeAddresses) {
//       await fn(gAdd);
//     }
//   }
// });
