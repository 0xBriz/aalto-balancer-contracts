// import { ethers } from "hardhat";
// import * as helpers from "@nomicfoundation/hardhat-network-helpers";
// import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
// import { BigNumber, Contract } from "ethers";
// import { deployVault } from "../scripts/deploy-vault";
// import { deployGovernanceToken } from "../scripts/deploy-governance-token";
// import { expect } from "chai";
// import { deployTokenAdmin } from "../scripts/utils/lp-mining/deploy-token-admin";
// import TimeAuth from "../artifacts/contracts/authorizer/TimelockAuthorizer.sol/TimelockAuthorizer.json";
// import AuthAdapter from "../artifacts/contracts/liquidity-mining/admin/AuthorizerAdaptor.sol/AuthorizerAdaptor.json";
// import { defaultAbiCoder, formatEther, Interface, parseEther, parseUnits } from "ethers/lib/utils";
// import { deployAuthAdapter } from "../scripts/utils/lp-mining/deploy-auth-adapter";
// import { deployTestERC20 } from "../scripts/utils/deploy-test-erc20";
// import { deployVotingEscrow } from "../scripts/utils/lp-mining/deploy-voting-escrow";
// import { deployGaugeController } from "../scripts/utils/lp-mining/deploy-gauge-controller";
// import { deployVeBoost } from "../scripts/utils/lp-mining/deploy-ve-boost";
// import { deployBalancerMinter } from "../scripts/utils/lp-mining/deploy-bal-minter";
// import { deployWeightedNoAssetManagersFactory } from "../scripts/utils/factories/weighted-nomanagers";
// import {
//   awaitTransactionComplete,
//   getAuthAdapter,
//   getFunctionSigHash,
//   getLiquidityGauge,
//   getWeightedPoolInstance,
//   initWeightedJoin,
//   sortTokens,
// } from "./utils";
// import GC from "../artifacts/contracts/liquidity-mining/GaugeController.vy/GaugeController.json";
// import { deployLiquidityGaugeFactory } from "../scripts/utils/lp-mining/deploy-liquidity-gauge-factory";
// import { deploySingleRecipientGaugeFactory } from "../scripts/utils/lp-mining/deploy-single-recipient-factory";
// import { deployBalTokenHolder } from "../scripts/utils/lp-mining/deploy-token-holder";
// import { deployFeeDistributor } from "../scripts/utils/lp-mining/deploy-fee-distributor";

// const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"; // ETH mainnet

// const ONE_DAY = (60 * 1000 * 60 * 24) / 1000;
// const SECONDS_IN_DAY = 86400;
// const ONE_WEEK = SECONDS_IN_DAY * 7;
// const ONE_MONTH = SECONDS_IN_DAY * 30;
// const THREE_MONTHS = SECONDS_IN_DAY * 90;
// const SIX_MONTHS = SECONDS_IN_DAY * 180;
// const ONE_YEAR = SECONDS_IN_DAY * 365;

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

// describe("Gauges", () => {
//   let owner: SignerWithAddress;
//   let stakeForUser: SignerWithAddress;
//   let AEQ: Contract;
//   let testPairToken: Contract;
//   let aeqBNB: Contract;
//   let Vault: Contract;
//   let vaultAuthorizer: Contract;
//   let authAdapter: Contract;
//   let balTokenAdmin: Contract;
//   let tokenAdminAuthAdapter: Contract;
//   let votingEscrow: Contract;
//   let veBoost: Contract;
//   let gaugeController: Contract;
//   let liquidityGaugeFactory: Contract;
//   let singleRecipientFactory: Contract;
//   let balMinter: Contract;
//   let weightedFactory: Contract;
//   let testRewardToken: Contract;
//   let singleRecipientGauge: Contract;
//   let tokenHolder: Contract;
//   let feeDist: Contract;

//   const pools: PoolInfo[] = [];

//   beforeEach(async () => {
//     const accounts = await ethers.getSigners();
//     owner = accounts[0];
//     stakeForUser = accounts[1];

//     Vault = await deployVault(WETH);
//     authAdapter = await deployAuthAdapter(Vault.address);
//     vaultAuthorizer = await ethers.getContractAt(TimeAuth.abi, await Vault.getAuthorizer(), owner);
//     weightedFactory = await deployWeightedNoAssetManagersFactory(Vault.address);

//     AEQ = await deployGovernanceToken();
//     // Mint before handing ownership to token admin
//     await AEQ.mint(owner.address, parseEther("1000000"));
//     testPairToken = await deployTestERC20("test", "test", parseEther("1000000"));
//     balTokenAdmin = await deployTokenAdmin(Vault.address, AEQ.address);
//     tokenAdminAuthAdapter = new Contract(
//       await balTokenAdmin.getAuthorizer(),
//       AuthAdapter.abi,
//       owner
//     );

//     const { poolAddress } = await createPool();

//     votingEscrow = await deployVotingEscrow(
//       poolAddress,
//       "veToken",
//       "veToken",
//       authAdapter.address,
//       owner.address
//     );

//     const { veBoostContract } = await deployVeBoost(Vault.address, votingEscrow.address);
//     veBoost = veBoostContract;

//     gaugeController = await deployGaugeController(
//       votingEscrow.address,
//       authAdapter.address,
//       owner.address
//     );
//     balMinter = await deployBalancerMinter(balTokenAdmin.address, gaugeController.address);

//     const { factory } = await deployLiquidityGaugeFactory(
//       balMinter.address,
//       veBoost.address,
//       vaultAuthorizer.address,
//       owner.address
//     );
//     liquidityGaugeFactory = factory;

//     singleRecipientFactory = await deploySingleRecipientGaugeFactory(balMinter.address);

//     testRewardToken = await deployTestERC20("test", "test", parseEther("1000000"));

//     await giveTokenAdminOwnership();
//   });

//   async function createPool() {
//     const tokens = [AEQ.address, testPairToken.address];
//     sortTokens(tokens);

//     const args = {
//       name: "Big Booty Hoes",
//       symbol: "AEQ-BNB-APT",
//       tokens,
//       weights: [parseUnits("0.8"), parseUnits("0.2")],
//       swapFeePercentage: parseUnits("0.01"), // 1%
//       owner: owner.address,
//     };

//     console.log("creating pool..");
//     const tx = await weightedFactory.create(
//       args.name,
//       args.symbol,
//       args.tokens,
//       args.weights,
//       args.swapFeePercentage,
//       args.owner
//     );

//     const receipt = await tx.wait();
//     // We need to get the new pool address out of the PoolCreated event
//     const events = receipt.events.filter((e) => e.event === "PoolCreated");
//     const poolAddress = events[0].args.pool;

//     console.log("poolAddress: " + poolAddress);

//     const pool = getWeightedPoolInstance(poolAddress, owner);
//     const poolId = await pool.getPoolId();

//     console.log("poolId: " + poolId);

//     const poolInfo = {
//       name: args.symbol,
//       contract: pool,
//       poolAddress,
//       poolId,
//     };

//     pools.push(poolInfo);

//     await initWeightedJoin(
//       poolId,
//       tokens,
//       [parseUnits("2000"), parseUnits("5000")],
//       owner.address,
//       Vault,
//       owner
//     );

//     aeqBNB = new Contract(
//       poolAddress,
//       [
//         "function balanceOf(address) public view returns (uint256)",
//         "function approve(address, uint256) external returns (bool)",
//       ],
//       owner
//     );

//     return {
//       poolId,
//       poolAddress,
//     };
//   }

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

//   async function createSingleRecipientGauge() {
//     tokenHolder = await deployBalTokenHolder(AEQ.address, Vault.address, "AEQ Token Holder");
//     await singleRecipientFactory.create(tokenHolder.address);
//   }

//   // Create gauge, then add to controller
//   async function createLiquidityGauge(poolAddress: string) {
//     const tx = await liquidityGaugeFactory.create(poolAddress);
//     const receipt = await tx.wait();
//     const events = receipt.events.filter((e) => e.event === "GaugeCreated");
//     const gaugeAddress = events[0].args.gauge;
//     console.log("gaugeAddress: " + gaugeAddress);
//     return gaugeAddress;
//   }

//   async function initGaugeTypes() {
//     const controllerAuth = getAuthAdapter(await gaugeController.admin(), owner);
//     const hash = gaugeController.interface.getSighash("add_type(string)");
//     console.log(hash);
//     // Get unique action id based on the controllers auth adapter diambiguator
//     const actionId = await controllerAuth.getActionId(hash);
//     await vaultAuthorizer.grantPermissions([actionId], owner.address, [gaugeController.address]);
//     const canDo = await vaultAuthorizer.canPerform(
//       actionId,
//       owner.address,
//       gaugeController.address
//     );
//     console.log(canDo);
//     // Need to add the type first to pass checks
//     // Have to add the total number needed here
//     // to be able to able any of the type later
//     await gaugeController["add_type(string)"](GaugeType.LiquidityMiningCommittee);
//     await gaugeController["add_type(string)"](GaugeType.veBAL);
//     await gaugeController["add_type(string)"](GaugeType.Ethereum);
//   }

//   async function addGauge(gaugeAddress: string, type: GaugeType, weight = 0) {
//     await initGaugeTypes();
//     await gaugeController["add_gauge(address,int128,uint256)"](gaugeAddress, type, weight);
//   }

//   async function setupGaugeForPool(type: GaugeType) {
//     const { poolAddress } = await createPool();

//     // BalTokenAdmin has to be activated before creating gauges
//     // Since their initialize function will call for epoch data from it
//     // Which will trigger a max256 overflow if `activate` has not been triggered yet
//     // await giveTokenAdminOwnership();
//     const gaugeAddress = await createLiquidityGauge(poolAddress);
//     // // Add to controller
//     await addGauge(gaugeAddress, type);

//     return gaugeAddress;
//   }
//   //   it("should mint tokens to users", async () => {
//   //     // minter should mint users token based on user integrate_fraction from the gauge
//   //     const adminId = await tokenAdminAuthAdapter.getActionId([balTokenAdmin.interface.getSighash('mint(address, uint256)')])
//   //     console.log(adminId)
//   //   });

//   // it("should add a gauge to the controller", async () => {
//   //   await setupGaugeForPool(GaugeType.LiquidityMiningCommittee);
//   // });

//   // it("should add rewards to a gauge", async () => {
//   //   const gaugeAddress = await setupGaugeForPool(GaugeType.veBAL);
//   //   const gauge = getLiquidityGauge(gaugeAddress, owner);

//   //   const token = testRewardToken.address;
//   //   const distributor = owner.address;
//   //   await gauge.add_reward(token, distributor);
//   // });

//   // it("should deposit to a gauge", async () => {
//   //   const gaugeAddress = await setupGaugeForPool(GaugeType.veBAL);
//   // });

//   // it("should setup the single recipient gauge", async () => {
//   //   // pool already created
//   //   // const bal = await aeqBNB.balanceOf(owner.address)
//   //   // console.log(formatEther(bal))
//   //   // do ve deposit
//   //   let now = await helpers.time.latest()
//   //   await aeqBNB.approve(votingEscrow.address, ethers.constants.MaxUint256)
//   //   await votingEscrow.create_lock(parseEther('100'), now + (ONE_WEEK * 50))
//   //   // fast forward and deploy fee dist
//   //   await helpers.time.increase(ONE_WEEK)
//   //   feeDist = await deployFeeDistributor(votingEscrow.address, await helpers.time.latest())
//   //   await AEQ.approve(feeDist.address, ethers.constants.MaxUint256)
//   //   await feeDist.depositToken(AEQ.address, parseEther('1000'))
//   //   // Check if user has rewards now, then fast for to next epoch and check again
//   //   let testCall = await feeDist.callStatic.claimToken(owner.address, AEQ.address)
//   //   console.log(testCall)
//   //   await helpers.time.increase(ONE_WEEK)
//   //   testCall = await feeDist.callStatic.claimToken(owner.address, AEQ.address)
//   //   console.log(formatEther(testCall))
//   //   // await createSingleRecipientGauge();
//   // });
// });
