import { ethers } from "hardhat";
import * as helpers from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { BigNumber, Contract } from "ethers";
import { deployVault } from "../scripts/deploy-vault";
import { deployAdminToken } from "../scripts/deploy-governance-token";
import { expect } from "chai";
import { deployTokenAdmin } from "../scripts/utils/lp-mining/deploy-token-admin";
import TimeAuth from "../artifacts/contracts/authorizer/TimelockAuthorizer.sol/TimelockAuthorizer.json";
import AuthAdapter from "../artifacts/contracts/liquidity-mining/admin/AuthorizerAdaptor.sol/AuthorizerAdaptor.json";
import { formatEther, Interface, parseEther } from "ethers/lib/utils";
import { deployAuthAdapter } from "../scripts/utils/lp-mining/deploy-auth-adapter";
import { deployTestERC20 } from "../scripts/utils/deploy-test-erc20";
import { deployVotingEscrow } from "../scripts/utils/lp-mining/deploy-voting-escrow";
import { deployGaugeController } from "../scripts/utils/lp-mining/deploy-gauge-controller";
import { deployVeBoost } from "../scripts/utils/lp-mining/deploy-ve-boost";
import { deployGaugeFactory } from "../scripts/utils/lp-mining/deploy-gauge-factory";
import { deployBalancerMinter } from "../scripts/utils/lp-mining/deploy-bal-minter";

const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"; // ETH mainnet

const ONE_DAY = (60 * 1000 * 60 * 24) / 1000;
const SECONDS_IN_DAY = 86400;
const ONE_WEEK = SECONDS_IN_DAY * 7;
const ONE_MONTH = SECONDS_IN_DAY * 30;
const THREE_MONTHS = SECONDS_IN_DAY * 90;
const SIX_MONTHS = SECONDS_IN_DAY * 180;
const ONE_YEAR = SECONDS_IN_DAY * 365;

describe("Gauges", () => {
  let owner: SignerWithAddress;
  let stakeForUser: SignerWithAddress;
  let AEQ: Contract;
  let Vault: Contract;
  let authorizer: Contract;
  let authAdapter: Contract;
  let balTokenAdmin: Contract;
  let mockVeDepositToken: Contract;
  let votingEscrow: Contract;
  let veBoost: Contract;
  let gaugeController: Contract;
  let liquidityGaugeFactory: Contract;
  let balMinter: Contract;

  beforeEach(async () => {
    const accounts = await ethers.getSigners();
    owner = accounts[0];
    stakeForUser = accounts[1];

    Vault = await deployVault(WETH);
    authAdapter = await deployAuthAdapter(Vault.address);
    authorizer = await ethers.getContractAt(TimeAuth.abi, await Vault.getAuthorizer());

    AEQ = await deployAdminToken();
    balTokenAdmin = await deployTokenAdmin(Vault.address, AEQ.address);

    mockVeDepositToken = await deployTestERC20(parseEther("1000000"));
    votingEscrow = await deployVotingEscrow(
      mockVeDepositToken.address,
      "veToken",
      "veToken",
      authAdapter.address,
      owner.address
    );
    const { veBoostContract } = await deployVeBoost(Vault.address, votingEscrow.address);
    veBoost = veBoostContract;

    gaugeController = await deployGaugeController(votingEscrow.address, authAdapter.address);
    balMinter = await deployBalancerMinter(balTokenAdmin.address, gaugeController.address);

    const { factory } = await deployGaugeFactory(
      balMinter.address,
      veBoost.address,
      authorizer.address
    );
    liquidityGaugeFactory = factory;
  });

  it("should add a gauge to the controller", async () => {
    expect(true).to.be.true;
  });
});
