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
import VB from "../artifacts/contracts/liquidity-mining/VotingEscrowDelegationProxy.sol/VotingEscrowDelegationProxy.json";
import BA from "../artifacts/contracts/liquidity-mining/BalancerTokenAdmin.sol/BalancerTokenAdmin.json";
import BT from "../artifacts/contracts/liquidity-mining/BalTokenHolder.sol/BALTokenHolder.json";
import FD from "../artifacts/contracts/liquidity-mining/fee-distribution/FeeDistributor.sol/FeeDistributor.json";
import SG from "../artifacts/contracts/liquidity-mining/gauges/SingleRecipientGauge.sol/SingleRecipientGauge.json";
import { expect } from "chai";
import { JsonRpcSigner } from "@ethersproject/providers";
import { defaultAbiCoder, formatEther, parseEther, parseUnits } from "ethers/lib/utils";
import moment from "moment";
import { getLiquidityGauge, getPreviousEpoch, toUnixTimestamp } from "./utils";
import { CORE_POOLS, GaugeType, GAUGE_ADDRESSES, OPERATOR, veGauge } from "./data";
import {
  deployLiquidityGaugeFactory,
  deployLiquidityGaugeFactoryNoAdmin,
} from "../scripts/utils/lp-mining/deploy-liquidity-gauge-factory";
import { WEEK } from "../scripts/utils/time";

describe("Gauge Reset Process", () => {
  let owner: JsonRpcSigner;

  let gaugeController: Contract;
  let authAdapter: Contract;
  let gaugeFactory: Contract;
  let balMinter: Contract;
  let veBoost: Contract;
  let balTokenAdmin: Contract;

  const ashareBusdGaugeAddress = "0x1dA7F4b2B9B644f307A313e304E1B061Eb605965";
  const amesBusdGauge = "0xDA9D57cAabBe48301d71b7eEaf546B4A206118d3";
  const wAaltoBusd = "0xD105D7e65922e1ac725b799481c5c113cFfA2f0D";
  const wbnbBusdGauge = "0x34EA84d3565824573073b1A63057baf57f842F02";
  const triBlueChipsGauge = "0x00687547D75A2d1378984bE922e1450CcC89211E";
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
    triBlueChipsGauge,
    usdcBnb,
    technicolorGauge,
    blueMaxiGauge,
  ];

  const newGauges = [];

  beforeEach(async () => {
    // Dev owner account
    await helpers.impersonateAccount(OPERATOR);
    owner = await ethers.provider.getSigner(OPERATOR);
    await helpers.setBalance(OPERATOR, parseEther("100"));

    gaugeController = await ethers.getContractAt(
      GC.abi,
      "0x585ECE7932226CCf5A259c367781F07EBBB1950F",
      owner
    );

    authAdapter = await ethers.getContractAt(
      Adapter.abi,
      "0x12fd0D8d8dA6A5c423CdcF7f6481353A5E13CfBc",
      owner
    );
    balMinter = await ethers.getContractAt(
      Mint.abi,
      "0x513f235C0bCCdeeecb81e2688453CAfaDf65c5e3",
      owner
    );
    veBoost = await ethers.getContractAt(
      VB.abi,
      "0x63BeeBDc3Bad6893E96A6138641BF694c42b2CB4",
      owner
    );
    balTokenAdmin = await ethers.getContractAt(
      BA.abi,
      "0xDe3258Fce4Afe0aB38CA3A61B21ACAD802250880",
      owner
    );
  });

  async function createNewFactory() {
    const { factory } = await deployLiquidityGaugeFactoryNoAdmin(
      balMinter.address,
      veBoost.address,
      authAdapter.address
    );

    gaugeFactory = factory;
  }

  async function zeroOldTypeWeight() {
    await gaugeController.change_type_weight(GaugeType.veBAL, 0);
  }

  async function killGauges() {
    for (const address of GAUGE_ADDRESSES.slice(1)) {
      const gauge = getLiquidityGauge(address, owner);
      await gauge.killGauge();
      expect(await gauge.is_killed()).to.be.true;
    }
  }

  async function createPoolGauges() {
    // Exclude AEQ-BNB
    for (const pool of CORE_POOLS.slice(1)) {
      const tx = await gaugeFactory.create(pool.address);
      const receipt = await tx.wait();
      const events = receipt.events.filter((e) => e.event === "GaugeCreated");
      const gaugeAddress = events[0].args.gauge;
      console.log("gaugeAddress: " + gaugeAddress);

      newGauges.push({
        ...pool,
        ...{
          gaugeAddress,
        },
      });
    }
  }

  async function updateGaugeTypes() {
    // Check effects in next epoch for all gauges
    // Should update the stakeless gauge as well to bring weights in line and down
    await zeroOldTypeWeight();
    // BAL USES 1 FOR ALL TYPES
    await gaugeController.change_type_weight(GaugeType.LiquidityMiningCommittee, 1);
    await gaugeController.change_gauge_weight(veGauge, parseUnits("0.65"));
    await gaugeController.add_type("VotingV2", 1);
  }

  async function addNewGaugesToController() {
    for (const gauge of newGauges) {
      // 0.35 / 8 gauges
      await gaugeController.add_gauge(gauge.gaugeAddress, 2, parseUnits("0.0388888889"));
    }
  }

  //   it("should set the current voting gauges type to zero", async () => {
  //     // zero old typed weight
  //     await zeroOldTypeWeight();
  //     expect(await gaugeController.get_type_weight(GaugeType.veBAL)).to.equal(0);
  //   });

  //   it("should kill the current voting gauges", async () => {
  //     // kill current voting gauges
  //     await killGauges();
  //   });

  //   it("should add a new gauge type with proper weight", async () => {
  //     // Update stake gauge type weight accordingly with the new gauge types according to the contracts math
  //     // (Get it right this time)
  //     // add new gauge type
  //   });

  //   it("should deploy a new factory", async () => {
  //     // Need to account for subgraph and front end with this then
  //     // deploy new factory
  //     await expect(createNewFactory()).to.not.be.reverted;
  //   });

  //   it("should create new gauges for core pools", async () => {
  //     // deploy new gauges for pools with new factory
  //     // await createNewFactory();
  //     // await createPoolGauges();
  //   });

  it("should add new gauges to controller under new type", async () => {
    // Add new ones to controller
    await killGauges();
    await createNewFactory();
    await createPoolGauges();
    await updateGaugeTypes();
    await addNewGaugesToController();

    const epochStamp = BigNumber.from(toUnixTimestamp(getPreviousEpoch().getTime()));

    // const pt = await gaugeController.points_total(epochStamp);
    // console.log(formatEther(pt));
  });

  //   it("should have proper allocations in the following epoch", async () => {
  //     // Setup the rest of the items needed first and then run simulations then
  //     const epochStamp = BigNumber.from(toUnixTimestamp(getPreviousEpoch(1).getTime()));
  //   });

  async function logWeights(time) {
    for (const gAdd of gaugeAddresses) {
      console.log(gAdd);
      const relWeight = await gaugeController.gauge_relative_weight(gAdd, time);
      console.log("relativeWeight: " + formatEther(relWeight));

      const straightWeight = await gaugeController.get_gauge_weight(gAdd);
      console.log("straightWeight: " + formatEther(straightWeight));
    }
  }
});
