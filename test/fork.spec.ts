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
// import { getPreviousEpoch, toUnixTimestamp } from "./utils";

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

//   let veBoost: Contract;

//   let owner: JsonRpcSigner;
//   let stakeForUser: SignerWithAddress;
//   let testPairToken: Contract;
//   let aeqBNB: Contract;
//   let weightedFactory: Contract;
//   let testRewardToken: Contract;
//   let liquidityGaugeFactory: Contract;
//   let singleRecipientFactory: Contract;

//   const TEST_ADDRESS = "0x3fF07607c5C8C619C69b1fd4C08aebF069AA10c7";
//   const GAUGES = {
//     STABLES: "0xaCC31d29022C8Eb2683597bF4c07De228Ed9EA07",
//     ASHARE_BUSD: "0x1dA7F4b2B9B644f307A313e304E1B061Eb605965",
//     VE_SINGLE_GAUGE: "0x177cA62c024Aaa0c3c65F7c8BA283b824556DAB0",
//   };

//   const ashareBusdGaugeAddress = "0x1dA7F4b2B9B644f307A313e304E1B061Eb605965";
//   const amesBusdGauge = "0xDA9D57cAabBe48301d71b7eEaf546B4A206118d3";
//   const wAaltoBusd = "0xD105D7e65922e1ac725b799481c5c113cFfA2f0D";
//   const wbnbBusdGauge = "0x34EA84d3565824573073b1A63057baf57f842F02";
//   const triBlueChipsGuage = "0x00687547D75A2d1378984bE922e1450CcC89211E";
//   const stablesGauge = "0xaCC31d29022C8Eb2683597bF4c07De228Ed9EA07";
//   const usdcBnb = "0x9721189e8ac5DD0011EaB1Ee7c25B24624b75801";
//   const technicolorGauge = "0xc328f8308B915D7DCD7D65d9c0e0a225abb3A95f";
//   const blueMaxiGauge = "0x6d97daB82286D61225265232ea07FD50828F5F18";
//   const veGauge = "0x177cA62c024Aaa0c3c65F7c8BA283b824556DAB0";

//   const gaugeAddresses = [
//     veGauge,
//     stablesGauge,
//     amesBusdGauge,
//     ashareBusdGaugeAddress,
//     wbnbBusdGauge,
//     triBlueChipsGuage,
//     wAaltoBusd,
//     usdcBnb,
//     technicolorGauge,
//     blueMaxiGauge,
//   ];

//   beforeEach(async () => {
//     // Dev owner account
//     await helpers.impersonateAccount("0x891eFc56f5CD6580b2fEA416adC960F2A6156494");
//     owner = await ethers.provider.getSigner("0x891eFc56f5CD6580b2fEA416adC960F2A6156494");

//     await helpers.setBalance("0x891eFc56f5CD6580b2fEA416adC960F2A6156494", parseEther("100"));

//     // AEQ = await ethers.getContractAt(
//     //   Token.abi,
//     //   "0x0dDef12012eD645f12AEb1B845Cb5ad61C7423F5",
//     //   owner
//     // );
//     // balMinter = await ethers.getContractAt(
//     //   Mint.abi,
//     //   "0x513f235C0bCCdeeecb81e2688453CAfaDf65c5e3",
//     //   owner
//     // );
//     // balTokenAdmin = await ethers.getContractAt(
//     //   BA.abi,
//     //   "0xDe3258Fce4Afe0aB38CA3A61B21ACAD802250880",
//     //   owner
//     // );
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
//     // authAdapter = await ethers.getContractAt(
//     //   Adapter.abi,
//     //   "0x12fd0D8d8dA6A5c423CdcF7f6481353A5E13CfBc",
//     //   owner
//     // );
//     // votingEscrow = await ethers.getContractAt(
//     //   VE.abi,
//     //   "0x06Aba6E8F69A0Be680f96D923EFB682E63Db6a9f",
//     //   owner
//     // );
//     // balTokenHolder = await ethers.getContractAt(
//     //   BT.abi,
//     //   "0x97a1b849857bF8656fb150C45d125B0a8BAa88D0",
//     //   owner
//     // );
//     // feeDistributor = await ethers.getContractAt(
//     //   FD.abi,
//     //   "0x5215012e7509C63f4B78020b02842e930BCf0a82",
//     //   owner
//     // );
//     // singleRecipientGauge = await ethers.getContractAt(
//     //   SG.abi,
//     //   "0x177cA62c024Aaa0c3c65F7c8BA283b824556DAB0",
//     //   owner
//     // );
//   });

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

//   it("should not end us", async () => {
//     // const acct = "0x3fF07607c5C8C619C69b1fd4C08aebF069AA10c7";
//     // await helpers.impersonateAccount(acct);
//     // const me = await ethers.provider.getSigner(acct);

//     // const gauge = await ethers.getContractAt(
//     //   [
//     //     "function withdraw(uint256, bool) external",
//     //     "function balanceOf(address) public view returns (uint256)",
//     //     "function killGauge() external",
//     //   ],
//     //   wAaltoBusd,
//     //   me
//     // );

//     // await gauge.killGauge()
//     // await gauge.connect(me).withdraw(0, false);

//     // await gaugeController.change_type_weight(0, parseUnits("0"));
//     // await gaugeController.change_type_weight(1, parseUnits("0"));

//     const fml = [
//       veGauge,
//       stablesGauge,
//       amesBusdGauge,
//       ashareBusdGaugeAddress,
//       wbnbBusdGauge,
//       triBlueChipsGuage,
//       wAaltoBusd,
//       usdcBnb,
//       technicolorGauge,
//       blueMaxiGauge,
//     ];

//     const WEEK = 86400 * 7;
//     const MULTIPLIER = BigNumber.from(10).pow(18);
//     const gauge = wAaltoBusd;

//     // for (const epoch of [2, 1, 0]) {
//     //   // let timeWeight = (await gaugeController.time_weight(wAaltoBusd)).toNumber();
//     //   let timeWeight = BigNumber.from(toUnixTimestamp(getPreviousEpoch(epoch).getTime()));
//     //   //console.log(timeWeight);
//     //   // console.log("timeWeight: " + moment.unix(timeWeight).format());
//     //   const point = await gaugeController.points_weight(gauge, timeWeight);
//     //   console.log("bias: " + formatEther(point.bias));
//     //   console.log("slope: " + formatEther(point.slope));

//     //   const totalWeight = await gaugeController.points_total(timeWeight);
//     //   const typeWeight = await gaugeController.points_type_weight(1, timeWeight);
//     //   const gaugeWeight = point.bias;

//     //   console.log(`
//     // totalWeight: ${totalWeight}
//     // typeWeight: ${typeWeight}
//     // gaugeWeight: ${gaugeWeight}
//     // `);

//     //   const relativeWeight = MULTIPLIER.mul(typeWeight).mul(gaugeWeight).div(totalWeight);
//     //   console.log("relativeWeight: " + formatEther(relativeWeight));
//     //   console.log(`
//     //   `);
//     // }

//     // for (const epoch of [1, 1, 1, 1]) {
//     //   const blockTime = await helpers.time.latest();
//     //   //console.log("blockTime: " + blockTime);

//     //   if (timeWeight > blockTime) {
//     //     console.log("Reached current block");
//     //     break;
//     //   }

//     //   timeWeight += WEEK;
//     //   // console.log("timeWeight: " + timeWeight);
//     //   console.log("timeWeight: " + moment.unix(timeWeight).format());
//     //   const d_bias = point.slope.mul(WEEK);
//     //   console.log("d_bias: " + formatEther(d_bias));

//     //   // if pt.bias > d_bias:
//     //   //     pt.bias -= d_bias
//     //   //     d_slope: uint256 = self.changes_weight[gauge_type][t]
//     //   //     pt.slope -= d_slope
//     //   // else:
//     //   //     pt.bias = 0
//     //   //     pt.slope = 0
//     //   // self.points_sum[gauge_type][t] = pt
//     //   // if t > block.timestamp:
//     //   //     self.time_sum[gauge_type] = t

//     //   if (point.bias.gt(d_bias)) {
//     //     console.log("pt.bias > d_bias");

//     //     // Cant access changes_weight, but changes_weight is only updated through voting
//     //   } else {
//     //     console.log("pt.bias NOT > d_bias");
//     //   }

//     //   console.log(`
//     //   `);
//     // }
//   });

//   it("should not end us", async () => {
//     // const epochStamp = BigNumber.from(toUnixTimestamp(getPreviousEpoch(1).getTime()));
//     // await logWeights(epochStamp);

//     // # controller props
//     // # total weight for a certain week in time
//     // points_total: public(HashMap[uint256, uint256])  # time -> total weight
//     // time_total: public(uint256)  # last scheduled time

//     // # gauge props
//     // points_weight: public(HashMap[address, HashMap[uint256, Point]])  # gauge_addr -> time -> Point
//     // changes_weight: HashMap[address, HashMap[uint256, uint256]]  # gauge_addr -> time -> slope
//     // time_weight: public(HashMap[address, uint256])  # gauge_addr -> last scheduled time (next week)

//     // const epochStamp = toUnixTimestamp(getPreviousEpoch().getTime());
//     // console.log(epochStamp);

//     const epochs = [0, 1, 2, 3];

//     // TYPE SUMS
//     // for (const ep of epochs) {
//     //   const epochStamp = toUnixTimestamp(getPreviousEpoch(ep).getTime());
//     //   const bnStamp = BigNumber.from(epochStamp);

//     //   console.log("LM:");
//     //   const lm = await gaugeController.points_sum(0, bnStamp);
//     //   console.log(formatEther(lm.bias));
//     //   console.log(formatEther(lm.slope));

//     //   console.log("VE:");
//     //   const ve = await gaugeController.points_sum(1, bnStamp);
//     //   console.log(formatEther(ve.bias));
//     //   console.log(formatEther(ve.slope));

//     //   console.log(`
//     //   `);
//     // }

//     const issues = [wAaltoBusd, stablesGauge, ashareBusdGaugeAddress];
//     const goodOnes = [wbnbBusdGauge, usdcBnb];

//     // // WEIGHT SLOPES (POINT WEIGHTS)
//     // for (const ep of epochs) {
//     //   console.log("Epochs back: " + ep);
//     //   const bnStamp = BigNumber.from(toUnixTimestamp(getPreviousEpoch(ep).getTime()));

//     //   for (const gAdd of issues) {
//     //     const wPt = await gaugeController.points_weight(gAdd, bnStamp);
//     //     console.log(`
//     //       gauge: ${gAdd}
//     //       bias: ${formatEther(wPt.bias)}
//     //       slope: ${formatEther(wPt.slope)}
//     //     `);
//     //   }
//     // }

//     // TIME WEIGHTS
//     // time_weight: public(HashMap[address, uint256])  # gauge_addr -> last scheduled time (next week)
//     // await runForGauges(async (gAdd) => {
//     //   const tw = await gaugeController.time_weight(gAdd);
//     //   console.log(gAdd);
//     //   // console.log(tw.toNumber());
//     //   console.log(moment.unix(tw.toNumber()).utc().format());
//     //   console.log(`
//     //   `);
//     // });

//     // let tw0 = await gaugeController.get_weights_sum_per_type(0);
//     // console.log(formatEther(tw0));

//     // let tw1 = await gaugeController.get_weights_sum_per_type(1);
//     // console.log(formatEther(tw1));

//     // await gaugeController.change_type_weight(0, parseUnits("0.24"));
//     // await gaugeController.change_type_weight(1, parseUnits("0.76"));

//     // //  await checkpoint();

//     // tw0 = await gaugeController.get_weights_sum_per_type(0);
//     // console.log(formatEther(tw0));

//     // tw1 = await gaugeController.get_weights_sum_per_type(1);
//     // console.log(formatEther(tw1));

//     // await gaugeController.change_gauge_weight(veGauge, parseUnits("1"));
//     // await gaugeController.change_gauge_weight(stablesGauge, parseUnits("5000"));
//     // await gaugeController.change_gauge_weight(amesBusdGauge, parseUnits("8"));
//     // await gaugeController.change_gauge_weight(ashareBusdGaugeAddress, parseUnits("8"));
//     // await gaugeController.change_gauge_weight(wbnbBusdGauge, parseUnits("5"));
//     // await gaugeController.change_gauge_weight(triBlueChipsGuage, parseUnits("5"));
//     // await gaugeController.change_gauge_weight(wbnbBusdGauge, parseUnits("5"));
//     // await gaugeController.change_gauge_weight(wAaltoBusd, parseUnits("25000"));
//     // await gaugeController.change_gauge_weight(usdcBnb, parseUnits("5"));
//     // await gaugeController.change_gauge_weight(technicolorGauge, parseUnits("15000"));
//     // await gaugeController.change_gauge_weight(blueMaxiGauge, parseUnits("15000"));

//     // await logWeights(moment().add(1, "week").unix());
//   });

//   //   it("should mint tokens to users", async () => {
//   //     // minter should mint users token based on user integrate_fraction from the gauge
//   //     const adminAdapter = await ethers.getContractAt(
//   //       Adapter.abi,
//   //       await balTokenAdmin.getAuthorizer()
//   //     );
//   //     const adminId = await adminAdapter.getActionId(
//   //       balTokenAdmin.interface.getSighash("mint(address, uint256)")
//   //     );

//   //     await vaultAuthorizer.grantPermissions([adminId], balMinter.address, [balTokenAdmin.address]);

//   //     // // Gauges and data are live and in place
//   //     // // need to.. check rewards (mintFor()) for user?
//   //     await helpers.stopImpersonatingAccount("0x891eFc56f5CD6580b2fEA416adC960F2A6156494");
//   //     await helpers.impersonateAccount(TEST_ADDRESS);
//   //     const dude = await ethers.provider.getSigner(TEST_ADDRESS);

//   //     // Should be big.. or too big
//   //     // const fml = await balMinter.connect(dude).callStatic.mint(GAUGES.STABLES);
//   //     // console.log(formatEther(fml));

//   //     // for (const addy of gaugeAddresses) {
//   //     //   const fml = await balMinter.connect(dude).callStatic.mint(addy);
//   //     //   console.log(formatEther(fml));
//   //     // }

//   //     // Use id to give vault approval for minter
//   //     // steps:
//   //     // approve minter to call mint on admin contract
//   //     // user deposit in gauge
//   //     // fast forward stuff
//   //     // user should be able to be minted for
//   //     expect(true).to.be.true;
//   //   });

//   //   it("should not end us", async () => {
//   //     const id = await authAdapter.getActionId(
//   //       singleRecipientGauge.interface.getSighash("checkpoint()")
//   //     );
//   //     await vaultAuthorizer.grantPermissions([id], "0x891eFc56f5CD6580b2fEA416adC960F2A6156494", [
//   //       singleRecipientGauge.address,
//   //     ]);
//   //     const calldata = singleRecipientGauge.interface.encodeFunctionData("checkpoint");
//   //     console.log(calldata);

//   //     const expectedResult = defaultAbiCoder.encode(["bool"], [true]);
//   //     const result = await authAdapter.callStatic.performAction(
//   //       singleRecipientGauge.address,
//   //       calldata
//   //     );
//   //     expect(expectedResult).to.eq(result);
//   //   });
// });
