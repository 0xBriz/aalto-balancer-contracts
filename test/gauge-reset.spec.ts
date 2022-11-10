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
// import VB from "../artifacts/contracts/liquidity-mining/VotingEscrowDelegationProxy.sol/VotingEscrowDelegationProxy.json";
// import BA from "../artifacts/contracts/liquidity-mining/BalancerTokenAdmin.sol/BalancerTokenAdmin.json";
// import BT from "../artifacts/contracts/liquidity-mining/BalTokenHolder.sol/BALTokenHolder.json";
// import FD from "../artifacts/contracts/liquidity-mining/fee-distribution/FeeDistributor.sol/FeeDistributor.json";
// import SG from "../artifacts/contracts/liquidity-mining/gauges/SingleRecipientGauge.sol/SingleRecipientGauge.json";
// import { expect } from "chai";
// import { JsonRpcSigner } from "@ethersproject/providers";
// import { defaultAbiCoder, formatEther, parseEther, parseUnits } from "ethers/lib/utils";
// import moment from "moment";
// import { getLiquidityGauge, getPreviousEpoch, toUnixTimestamp } from "./utils";
// import { CORE_POOLS, GaugeType, GAUGE_ADDRESSES, OPERATOR, veGauge } from "./data";
// import { deployLiquidityGaugeFactory } from "../scripts/utils/lp-mining/deploy-liquidity-gauge-factory";
// import { WEEK } from "../scripts/utils/time";

// describe("Gauge Reset Process", () => {
//   let owner: JsonRpcSigner;

//   let gaugeController: Contract;
//   let authAdapter: Contract;
//   let gaugeFactory: Contract;
//   let balMinter: Contract;
//   let veBoost: Contract;
//   let balTokenAdmin: Contract;

//   const newGauges = [];

//   beforeEach(async () => {
//     // Dev owner account
//     await helpers.impersonateAccount(OPERATOR);
//     owner = await ethers.provider.getSigner(OPERATOR);
//     await helpers.setBalance(OPERATOR, parseEther("100"));

//     gaugeController = await ethers.getContractAt(
//       GC.abi,
//       "0x585ECE7932226CCf5A259c367781F07EBBB1950F",
//       owner
//     );

//     authAdapter = await ethers.getContractAt(
//       Adapter.abi,
//       "0x12fd0D8d8dA6A5c423CdcF7f6481353A5E13CfBc",
//       owner
//     );
//     balMinter = await ethers.getContractAt(
//       Mint.abi,
//       "0x513f235C0bCCdeeecb81e2688453CAfaDf65c5e3",
//       owner
//     );
//     veBoost = await ethers.getContractAt(
//       VB.abi,
//       "0x63BeeBDc3Bad6893E96A6138641BF694c42b2CB4",
//       owner
//     );
//     balTokenAdmin = await ethers.getContractAt(
//       BA.abi,
//       "0xDe3258Fce4Afe0aB38CA3A61B21ACAD802250880",
//       owner
//     );
//   });

//   async function createNewFactory() {
//     const { factory } = await deployLiquidityGaugeFactory(
//       balMinter.address,
//       veBoost.address,
//       authAdapter.address
//     );

//     gaugeFactory = factory;
//   }

//   async function zeroOldTypeWeight() {
//     await gaugeController.change_type_weight(GaugeType.veBAL, 0);
//   }

//   async function killGauges() {
//     for (const address of GAUGE_ADDRESSES.slice(1)) {
//       const gauge = getLiquidityGauge(address, owner);
//       await gauge.killGauge();
//       expect(await gauge.is_killed()).to.be.true;
//     }
//   }

//   async function createPoolGauges() {
//     for (const pool of CORE_POOLS) {
//       const tx = await gaugeFactory.create(pool.address);
//       const receipt = await tx.wait();
//       const events = receipt.events.filter((e) => e.event === "GaugeCreated");
//       const gaugeAddress = events[0].args.gauge;
//       console.log("gaugeAddress: " + gaugeAddress);

//       newGauges.push({
//         ...pool,
//         ...{
//           gauge: gaugeAddress,
//         },
//       });
//     }
//   }

//   async function addNewGaugeType() {
//     // Check effects in next epoch for all gauges
//     // Should update the stakeless gauge as well to bring weights in line and down
//     await zeroOldTypeWeight();
//     await gaugeController.change_type_weight(GaugeType.LiquidityMiningCommittee, 65);
//     await gaugeController.add_type(GaugeType.VotingV2, 35);
//   }

//   async function addNewGaugesToController() {
//     for (const gauge of newGauges) {
//       // with proper weights, per its type
//       // ~225k emissions a week, ve should get 0.65 = 146,250, rest get 78,750
//       // gauges get: type_weight * gauge_weight / total_weight (65, 35 work to get the desire ve % then?)
//       // and use this against emissions rate to calculate what they are allocated (users allocation under that with boost and such)
//     }
//   }

//   //   it("should set the current voting gauges type to zero", async () => {
//   //     // zero old typed weight
//   //     await zeroOldTypeWeight();
//   //     expect(await gaugeController.get_type_weight(GaugeType.veBAL)).to.equal(0);
//   //   });

//   //   it("should kill the current voting gauges", async () => {
//   //     // kill current voting gauges
//   //     await killGauges();
//   //   });

//   //   it("should add a new gauge type with proper weight", async () => {
//   //     // Update stake gauge type weight accordingly with the new gauge types according to the contracts math
//   //     // (Get it right this time)
//   //     // add new gauge type
//   //   });

//   //   it("should deploy a new factory", async () => {
//   //     // Need to account for subgraph and front end with this then
//   //     // deploy new factory
//   //     await expect(createNewFactory()).to.not.be.reverted;
//   //   });

//   it("should create new gauges for core pools", async () => {
//     // deploy new gauges for pools with new factory
//     // await createNewFactory();
//     // await createPoolGauges();
//   });

//   it("should add new gauges to controller under new type", async () => {
//     // Add new ones to controller
//   });

//   it("should have proper allocations in the following epoch", async () => {
//     // Setup the rest of the items needed first and then run simulations then

//     const epochStamp = BigNumber.from(toUnixTimestamp(getPreviousEpoch(1).getTime()));
//     // Check expected per gauge emissions received
//     const rate = 0.347222222222222222;
//     const durationInCurrentEpoch = WEEK;
//     // Get Gauge relative weight (NOT MORE THAN 1.0) normalized to 1e18
//     const totalWeight = 124343264866423078924801;

//     const weight = await gaugeController.gauge_relative_weight(
//       "0x6d97daB82286D61225265232ea07FD50828F5F18",
//       epochStamp
//     );
//     const maxiWeight = 0.155528921053132977;
//     const stakelessWeight = 0.995385094740051055;
//     const typeWeight = 4;
//     const emissions = rate * maxiWeight * WEEK;
//     console.log(emissions);
//     // stakeless = 209030.86989541072 (all emissions basically)
//     // maxi = 32661.073421157926
//     // stakeless: periodEmission = (gaugeWeight * rate * durationInCurrentEpoch) / 10**18;

//     // bal ui does user vote value time 10^2
//     // so 100% vote = 100(string literal to BN) * 10^2 = 10,000(max possible user vote weight in gauge controller)

//     // Gauge does: _integrate_inv_supply += rate * w * (week_time - prev_future_epoch) / _working_supply
//   });
// });
