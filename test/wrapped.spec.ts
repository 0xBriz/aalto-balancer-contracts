import * as helpers from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { Contract } from "ethers";
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
import LF from "../artifacts/contracts/liquidity-mining/gauges/LiquidityGaugeFactory.sol/LiquidityGaugeFactory.json";
import LG from "../artifacts/contracts/liquidity-mining/gauges/LiquidityGaugeV5.vy/LiquidityGaugeV5.json";
import TF from "./abis/WeightedPool2TokensFactory.json";
import PA from "./abis/WeightedPool2Tokens.json";
import WA from "./abis/WrappedRebaseToken.json";
import { expect } from "chai";
import { JsonRpcSigner } from "@ethersproject/providers";
import { defaultAbiCoder, formatEther, parseUnits } from "ethers/lib/utils";
import { MAX_UINT256 } from "../scripts/utils/constants";
import { BUSD_BALANCEOF_SLOT, prepStorageSlotWrite } from "./utils";
import { ONE_DAY_SECONDS } from "../scripts/utils/time";

export interface JoinPoolRequest {
  assets: string[];
  maxAmountsIn: string[];
  userData: any;
  fromInternalBalance: boolean;
}

describe("Wrapped pool", () => {
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

  let veBoost: Contract;

  let owner: JsonRpcSigner;
  let stakeForUser: SignerWithAddress;
  let testPairToken: Contract;
  let aeqBNB: Contract;
  let weightedFactory: Contract;
  let testRewardToken: Contract;
  let liquidityGaugeFactory: Contract;
  let singleRecipientFactory: Contract;
  let twoTokenFactory: Contract;
  let pool: Contract;
  let poolGauge: Contract;
  let aalto: Contract;
  let busd: Contract;
  let wrappedAalto: Contract;

  const devAccount = "0x891eFc56f5CD6580b2fEA416adC960F2A6156494";
  const aaltoOwner = "0x570108E54d11348BD3734FF73dc55eC52c28d3EF";

  const BUSD_ADDRESS = "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56";
  const WRAPPED_AALTO_ADDRESS = "0x12b70d84DAb272Dc5A24F49bDbF6A4C4605f15da";

  beforeEach(async () => {
    // Dev owner account
    await helpers.impersonateAccount(devAccount);
    owner = await ethers.provider.getSigner(devAccount);

    AEQ = await ethers.getContractAt(
      Token.abi,
      "0x0dDef12012eD645f12AEb1B845Cb5ad61C7423F5",
      owner
    );
    balMinter = await ethers.getContractAt(
      Mint.abi,
      "0x513f235C0bCCdeeecb81e2688453CAfaDf65c5e3",
      owner
    );
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
    Vault = await ethers.getContractAt(VA.abi, "0xEE1c8DbfBf958484c6a4571F5FB7b99B74A54AA7", owner);
    vaultAuthorizer = await ethers.getContractAt(
      TimeAuth.abi,
      "0x7Bdc7b728cf0a45F0464B84CB90BD9beF01C5E0b",
      owner
    );
    authAdapter = await ethers.getContractAt(
      Adapter.abi,
      "0x12fd0D8d8dA6A5c423CdcF7f6481353A5E13CfBc",
      owner
    );
    votingEscrow = await ethers.getContractAt(
      VE.abi,
      "0x06Aba6E8F69A0Be680f96D923EFB682E63Db6a9f",
      owner
    );
    balTokenHolder = await ethers.getContractAt(
      BT.abi,
      "0x97a1b849857bF8656fb150C45d125B0a8BAa88D0",
      owner
    );
    feeDistributor = await ethers.getContractAt(
      FD.abi,
      "0x5215012e7509C63f4B78020b02842e930BCf0a82",
      owner
    );
    singleRecipientGauge = await ethers.getContractAt(
      SG.abi,
      "0x177cA62c024Aaa0c3c65F7c8BA283b824556DAB0",
      owner
    );

    liquidityGaugeFactory = await ethers.getContractAt(
      LF.abi,
      "0x0FA1097A49F54420CC5895455345dC605ee8d3c4",
      owner
    );

    twoTokenFactory = await ethers.getContractAt(
      TF.abi,
      "0x7e29FE79CBbE9eAcA251BcDdD57c97377A97E8C6",
      owner
    );

    busd = await ethers.getContractAt(
      [
        "function approve(address, uint256) external",
        "function transfer(address, uint256) external",
      ],
      BUSD_ADDRESS,
      owner
    );

    wrappedAalto = await ethers.getContractAt(WA.abi, WRAPPED_AALTO_ADDRESS, owner);

    await helpers.stopImpersonatingAccount(devAccount);
    await helpers.impersonateAccount(aaltoOwner);
    owner = await ethers.provider.getSigner(aaltoOwner);

    aalto = await ethers.getContractAt(
      [
        "function approve(address, uint256) external",
        "function transfer(address, uint256) external",
      ],
      "0xcE18FbBAd490D4Ff9a9475235CFC519513Cfb19a",
      owner
    );

    await aalto.transfer(devAccount, parseUnits("50000"));

    await helpers.stopImpersonatingAccount(aaltoOwner);
    await helpers.impersonateAccount(devAccount);
    owner = await ethers.provider.getSigner(devAccount);
  });

  async function createPool() {
    // Must be in address sorted order
    const TOKENS = [WRAPPED_AALTO_ADDRESS, BUSD_ADDRESS];

    const NAME = "Wrapped Aalto BUSD";
    const SYMBOL = "wAALTO-BUSD";
    const swapFeePercentage = parseUnits("0.01");
    const weights = [parseUnits("0.8"), parseUnits("0.2")];
    const oracleEnabled = true;

    const tx = await twoTokenFactory.create(
      NAME,
      SYMBOL,
      TOKENS,
      weights,
      swapFeePercentage,
      oracleEnabled,
      devAccount
    );

    const receipt = await tx.wait();
    const events = receipt.events.filter((e) => e.event === "PoolCreated");
    const poolAddress = events[0].args.pool;

    pool = await ethers.getContractAt(PA.abi, poolAddress);

    await busd.approve(Vault.address, MAX_UINT256);
    await wrappedAalto.approve(Vault.address, MAX_UINT256);

    const JOIN_KIND_INIT = 0;

    await aalto.connect(owner).approve(wrappedAalto.address, MAX_UINT256);
    await wrappedAalto.wrap(parseUnits("50000"));

    console.log("Wrapped balance: " + formatEther(await wrappedAalto.balanceOf(devAccount)));

    const initialBalances = [parseUnits("45000"), parseUnits("10000")];

    const slot = prepStorageSlotWrite(devAccount, BUSD_BALANCEOF_SLOT);
    await helpers.setStorageAt(busd.address, slot, parseUnits("10000"));

    // Must be encoded
    const initUserData = ethers.utils.defaultAbiCoder.encode(
      ["uint256", "uint256[]"],
      [JOIN_KIND_INIT, initialBalances]
    );

    const joinPoolRequest = {
      assets: TOKENS,
      maxAmountsIn: initialBalances,
      userData: initUserData,
      fromInternalBalance: false,
    };

    await Vault.joinPool(await pool.getPoolId(), devAccount, devAccount, joinPoolRequest);
  }

  async function addPoolGauge() {
    const tx = await liquidityGaugeFactory.create(pool.address);
    const receipt = await tx.wait();
    const events = receipt.events.filter((e) => e.event === "GaugeCreated");
    const gaugeAddress = events[0].args.gauge;
    poolGauge = await ethers.getContractAt(LG.abi, gaugeAddress, owner);

    await gaugeController["add_gauge(address,int128,uint256)"](
      gaugeAddress,
      1,
      parseUnits("10000")
    );
  }

  async function depositGauge() {
    // already have apts
    const aptBalance = await pool.balanceOf(devAccount);
    await pool.connect(owner).approve(poolGauge.address, MAX_UINT256);
    await poolGauge["deposit(uint256)"](aptBalance.div(2));
  }

  async function checkRewards() {
    const viewGauge = new Contract(
      poolGauge.address,
      ["function claimable_tokens(address) external view returns (uint256)"],
      ethers.provider
    );

    await logTime();
    console.log("Pending rewards: " + formatEther(await viewGauge.claimable_tokens(devAccount)));
    await helpers.time.increase(ONE_DAY_SECONDS);
    await logTime();
    console.log("Pending rewards: " + formatEther(await viewGauge.claimable_tokens(devAccount)));

    await helpers.time.increase(ONE_DAY_SECONDS * 6);
    await logTime();
    console.log("Pending rewards: " + formatEther(await viewGauge.claimable_tokens(devAccount)));
  }

  async function doCheckpoints() {
    await gaugeController.checkpoint();
  }

  async function logTime() {
    console.log(
      "Current date/time: " + new Date((await helpers.time.latest()) * 1000).toUTCString()
    );
  }

  it("should get rewards", async () => {
    await createPool();
    await addPoolGauge();
    await depositGauge();
    await checkRewards();
  });
});
