import * as helpers from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { BigNumber, Contract } from "ethers";
import { ethers, network } from "hardhat";
import GC from "../artifacts/contracts/liquidity-mining/GaugeController.vy/GaugeController.json";
import Mint from "../artifacts/contracts/liquidity-mining/BalancerMinter.sol/BalancerMinter.json";
import Token from "../artifacts/contracts/liquidity-mining/governance/AequinoxToken.sol/AequinoxToken.json";
import VA from "../artifacts/contracts/Vault.sol/Vault.json";
import TimeAuth from "../artifacts/contracts/authorizer/TimelockAuthorizer.sol/TimelockAuthorizer.json";
import Adapter from "../artifacts/contracts/liquidity-mining/admin/AuthorizerAdaptor.sol/AuthorizerAdaptor.json";
import VE from "../artifacts/contracts/liquidity-mining/VotingEscrow.vy/VotingEscrow.json";
import BA from "../artifacts/contracts/liquidity-mining/BalancerTokenAdmin.sol/BalancerTokenAdmin.json";
import BT from "../artifacts/contracts/liquidity-mining/BalTokenHolder.sol/BALTokenHolder.json";
import FD from "../artifacts/contracts/liquidity-mining/fee-distribution/FeeDistributor.sol/FeeDistributor.json";
import SG from "../artifacts/contracts/liquidity-mining/gauges/SingleRecipientGauge.sol/SingleRecipientGauge.json";
import { expect } from "chai";
import { JsonRpcSigner } from "@ethersproject/providers";
import { defaultAbiCoder, formatEther, parseEther, parseUnits } from "ethers/lib/utils";
import moment from "moment";
import { getPreviousEpoch, toUnixTimestamp } from "./utils";

describe("Mainnet setup", () => {
  let AEQ: Contract;

  let Vault: Contract;
  let vaultAuthorizer: Contract;
  let authAdapter: Contract;
  let balTokenAdmin: Contract;
  let votingEscrow: Contract;
  let gaugeController: Contract;
  let balMinter: Contract;
  let singleRecipientGauge: Contract;
  let balTokenHolder: Contract;
  let feeDistributor: Contract;
  let veBalHelper: Contract;

  let veBoost: Contract;

  let owner: JsonRpcSigner;
  let stakeForUser: SignerWithAddress;
  let testPairToken: Contract;
  let aeqBNB: Contract;
  let weightedFactory: Contract;
  let testRewardToken: Contract;
  let liquidityGaugeFactory: Contract;
  let singleRecipientFactory: Contract;

  const OPERATOR = "0x891eFc56f5CD6580b2fEA416adC960F2A6156494";

  const ashareBusdGaugeAddress = "0x1dA7F4b2B9B644f307A313e304E1B061Eb605965";
  const amesBusdGauge = "0xDA9D57cAabBe48301d71b7eEaf546B4A206118d3";
  const wAaltoBusd = "0xD105D7e65922e1ac725b799481c5c113cFfA2f0D";
  const wbnbBusdGauge = "0x34EA84d3565824573073b1A63057baf57f842F02";
  const triBlueChipsGuage = "0x00687547D75A2d1378984bE922e1450CcC89211E";
  const stablesGauge = "0xaCC31d29022C8Eb2683597bF4c07De228Ed9EA07";
  const usdcBnb = "0x9721189e8ac5DD0011EaB1Ee7c25B24624b75801";
  const technicolorGauge = "0xc328f8308B915D7DCD7D65d9c0e0a225abb3A95f";
  const blueMaxiGauge = "0x6d97daB82286D61225265232ea07FD50828F5F18";
  const veGauge = "0x177cA62c024Aaa0c3c65F7c8BA283b824556DAB0";

  const gaugeAddresses = [
    veGauge,
    stablesGauge,
    ashareBusdGaugeAddress,
    amesBusdGauge,
    wAaltoBusd,
    wbnbBusdGauge,
    triBlueChipsGuage,
    usdcBnb,
    technicolorGauge,
    blueMaxiGauge,
  ];

  beforeEach(async () => {
    // Dev owner account
    await helpers.impersonateAccount(OPERATOR);
    owner = await ethers.provider.getSigner(OPERATOR);
    await helpers.setBalance(OPERATOR, parseEther("100"));

    AEQ = await ethers.getContractAt(
      Token.abi,
      "0x0dDef12012eD645f12AEb1B845Cb5ad61C7423F5",
      owner
    );
    veBalHelper = await ethers.getContractAt(
      ["function gauge_relative_weight(address) public view returns (uint256)"],
      "0x13C3d00FB2F37dEea036B1dF6Ca9963e8690fAa6",
      owner
    );
    // balMinter = await ethers.getContractAt(
    //   Mint.abi,
    //   "0x513f235C0bCCdeeecb81e2688453CAfaDf65c5e3",
    //   owner
    // );
    balTokenAdmin = await ethers.getContractAt(
      BA.abi,
      "0xDe3258Fce4Afe0aB38CA3A61B21ACAD802250880",
      owner
    );
    gaugeController = await ethers.getContractAt(
      GC.abi,
      "0x585ECE7932226CCf5A259c367781F07EBBB1950F",
      owner
    );
    // Vault = await ethers.getContractAt(VA.abi, "0xEE1c8DbfBf958484c6a4571F5FB7b99B74A54AA7", owner);
    // vaultAuthorizer = await ethers.getContractAt(
    //   TimeAuth.abi,
    //   "0x7Bdc7b728cf0a45F0464B84CB90BD9beF01C5E0b",
    //   owner
    // );
    authAdapter = await ethers.getContractAt(
      Adapter.abi,
      "0x12fd0D8d8dA6A5c423CdcF7f6481353A5E13CfBc",
      owner
    );
    // votingEscrow = await ethers.getContractAt(
    //   VE.abi,
    //   "0x06Aba6E8F69A0Be680f96D923EFB682E63Db6a9f",
    //   owner
    // );
    balTokenHolder = await ethers.getContractAt(
      BT.abi,
      "0x97a1b849857bF8656fb150C45d125B0a8BAa88D0",
      owner
    );
    // feeDistributor = await ethers.getContractAt(
    //   FD.abi,
    //   "0x5215012e7509C63f4B78020b02842e930BCf0a82",
    //   owner
    // );
    singleRecipientGauge = await ethers.getContractAt(
      SG.abi,
      "0x177cA62c024Aaa0c3c65F7c8BA283b824556DAB0",
      owner
    );
  });

  it("should not end us", async () => {
    // Make sure this isnt some crazy amount
    // console.log(formatEther(await AEQ.balanceOf(balTokenHolder.address)));
    // let calldata = singleRecipientGauge.interface.encodeFunctionData("checkpoint");
    // await authAdapter.performAction(singleRecipientGauge.address, calldata);
    // console.log(formatEther(await AEQ.balanceOf(balTokenHolder.address)));
    // VE Gauge gets 78,700 AEQ here.
    //
    // Fast forward and check again?
    // await logWeights(epochStamp);

    // await gaugeController.change_gauge_weight(veGauge, 0);

    // // const w1 = await gaugeController.get_type_weight(0);
    // // console.log(formatEther(w1));
    // // const w2 = await gaugeController.get_type_weight(1);
    // // console.log(formatEther(w2));
    // await gaugeController.change_type_weight(0, 0);
    // // await gaugeController.change_type_weight(1, 1);

    // // await helpers.time.increase(86400);

    // console.log(`
    // `);

    const next = moment().add(1, "day").startOf("day").utc().unix();
    // // await logWeights(next);

    // let pt = await gaugeController.points_weight(technicolorGauge, epochStamp);
    // console.log("bias: " + formatEther(pt.bias));
    // console.log("slope: " + formatEther(pt.slope));

    // pt = await gaugeController.points_weight(technicolorGauge, next);
    // console.log("bias: " + formatEther(pt.bias));
    // console.log("slope: " + formatEther(pt.slope));

    // await helpers.stopImpersonatingAccount(OPERATOR)

    // const trez = "0x3fF07607c5C8C619C69b1fd4C08aebF069AA10c7";
    // await helpers.impersonateAccount(trez);
    // const me = await ethers.provider.getSigner(trez);
    // const gauge = new Contract(
    //   technicolorGauge,
    //   [
    //     "function withdraw(uint256) external",
    //     "function balanceOf(address) public view returns (uint256)",
    //   ],
    //   me
    // );

    // await helpers.time.increase(86400);
    // await gauge.withdraw(await gauge.balanceOf(trez));

    // point time was off for the other effected ones. CHECK THE TECHNICOLOR

    // await runForGauges(async (gAdd) => {
    //   let pt = await gaugeController.points_weight(gAdd, epochStamp);
    //   console.log("bias: " + formatEther(pt.bias));
    //   console.log("slope: " + formatEther(pt.slope));
    // });

    // await gaugeController.change_type_weight(0, 30);
    // await gaugeController.change_type_weight(1, 70);
    // // Shrink this
    // await gaugeController.change_gauge_weight(veGauge, 1);

    const DAY = 86400;
    const WEEK = DAY * 7;

    const account = "0xda7a763bde6ee9cafc3876ef33d67f8eed7891f7";
    await helpers.impersonateAccount(account);
    const user = await ethers.provider.getSigner(account);
    let gauge = new Contract(
      triBlueChipsGuage,
      [
        "function withdraw(uint256) external",
        "function balanceOf(address) public view returns (uint256)",
      ],
      user
    );

    // await gaugeController.change_type_weight(0, 1);
    // await gaugeController.change_type_weight(1, 1);
    // await gaugeController.change_gauge_weight(amesBusdGauge, 1);
    // await gaugeController.change_gauge_weight(amesBusdGauge, 1);
    // await helpers.time.increase(DAY);
    // await gaugeController.checkpoint();
    // // await helpers.time.increase(WEEK);
    // // await gaugeController.checkpoint();
    // await gauge.withdraw(await gauge.balanceOf(account));

    // await logWeights(epochStamp);

    const epochStamp = BigNumber.from(toUnixTimestamp(getPreviousEpoch(0).getTime()));

    await runForGauges(async (addy) => {
      const pt = await gaugeController.points_weight(addy, epochStamp);
      console.log(formatEther(pt.bias));
      console.log(formatEther(pt.slope));
    });

    // await calculateTokenPayableToGauge(wbnbBusdGauge);

    // await authAdapter.performAction(singleRecipientGauge.address, calldata);
    // console.log(formatEther(await AEQ.balanceOf(balTokenHolder.address)));
    // //
    // Check mintable amounts to make sure gauges can get their share of emissions
    // const avb = await balTokenAdmin.getAvailableSupply();
    // console.log(formatEther(avb));

    // const start = toUnixTimestamp(getPreviousEpoch(0).getTime());
    // const end = start + WEEK;
    // const range = await balTokenAdmin.mintableInTimeframe(start, end);
    // console.log(formatEther(range)); // 210k

    //await logWeights(epochStamp);
  });

  async function calculateTokenPayableToGauge(address: string) {
    const gauge = new Contract(
      address,
      ["function working_supply() public view returns (uint256)"],
      ethers.provider
    );

    const gaugeRelativeWeight = await veBalHelper.gauge_relative_weight(address);
    const inflationRate = await balTokenAdmin.getInflationRate();
    const balPayableToGauge = inflationRate.mul(7).mul(86400).mul(gaugeRelativeWeight);
    const weightNum = Number(formatEther(gaugeRelativeWeight));
    const payableNum = Number(formatEther(inflationRate)) * 86400 * 7 * weightNum;

    const workingSupply = await gauge.working_supply();
    const workNum = Number(formatEther(workingSupply));
    const workingBalanceNum = 0.4;
    const shareNum = workingBalanceNum / (workNum + workingBalanceNum);
    //  const payableNum = Number(formatEther(balPayableToGauge));
    const weekNum = shareNum * payableNum;
    console.log(weekNum);

    const workingBalance = parseUnits("0.4");
    const shareForOneBpt = workingBalance.div(workingSupply.add(workingBalance));
    //console.log(formatEther(shareForOneBpt));
    const weeklyReward = shareForOneBpt.mul(balPayableToGauge);

    //console.log(formatEther(weeklyReward));
    // return Number(formatEther(weeklyReward));
  }

  async function logWeights(time) {
    for (const gAdd of gaugeAddresses) {
      console.log(gAdd);
      const relWeight = await gaugeController.gauge_relative_weight(gAdd, time);
      console.log("relWeight: " + formatEther(relWeight));

      // const straightWeight = await gaugeController.get_gauge_weight(gAdd);
      // console.log("straightWeight: " + formatEther(straightWeight));
    }
  }

  async function checkpoint() {
    for (const gAdd of gaugeAddresses) {
      await gaugeController.checkpoint_gauge(gAdd);
    }
  }

  async function runForGauges(fn) {
    for (const gAdd of gaugeAddresses) {
      await fn(gAdd);
    }
  }
});
