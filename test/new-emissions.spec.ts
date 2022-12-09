import { ethers } from "hardhat";
import * as helpers from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { BigNumber, Contract } from "ethers";
import { expect } from "chai";
import { deployTokenAdmin } from "../scripts/utils/lp-mining/deploy-token-admin";
import TimeAuth from "../artifacts/contracts/authorizer/TimelockAuthorizer.sol/TimelockAuthorizer.json";
import AuthAdapter from "../artifacts/contracts/liquidity-mining/admin/AuthorizerAdaptor.sol/AuthorizerAdaptor.json";
import {
  commify,
  defaultAbiCoder,
  formatEther,
  Interface,
  parseEther,
  parseUnits,
} from "ethers/lib/utils";
import {
  awaitTransactionComplete,
  getFunctionSigHash,
  getLiquidityGauge,
  getWeightedPoolInstance,
  initWeightedJoin,
  sortTokens,
} from "./utils";
import { deployGovernanceToken } from "../scripts/general/deploy-governance-token";
import { deployVault } from "../scripts/v2/vault/deploy-vault";

const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"; // ETH mainnet

const SECONDS_IN_DAY = 86400;
const ONE_DAY_SECONDS = SECONDS_IN_DAY;
const ONE_WEEK_SECONDS = SECONDS_IN_DAY * 7;
const ONE_MONTH_SECONDS = SECONDS_IN_DAY * 30;
const THREE_MONTHS_SECONDS = SECONDS_IN_DAY * 90;
const SIX_MONTHS_SECONDS = SECONDS_IN_DAY * 180;
const ONE_YEAR_SECONDS = SECONDS_IN_DAY * 365;

enum GaugeType {
  LiquidityMiningCommittee,
  veBAL,
  Ethereum,
}

interface PoolInfo {
  name: string;
  contract: Contract;
  poolId: string;
  poolAddress: string;
}

describe("Token Emissions", () => {
  let owner: SignerWithAddress;
  let govToken: Contract;
  let Vault: Contract;
  let vaultAuth: Contract;
  let balTokenAdmin: Contract;
  let balMinter: Contract;

  const initialMintAllowance = parseEther("2000000");

  beforeEach(async () => {
    const accounts = await ethers.getSigners();
    owner = accounts[0];
    const { vault, vaultAuthorizer } = await deployVault(WETH);
    vaultAuth = vaultAuthorizer;
    govToken = await deployGovernanceToken("Vertek", "VRTK");
    balTokenAdmin = await deployTokenAdmin(vault.address, govToken.address, initialMintAllowance);
  });

  async function giveTokenAdminOwnership() {
    // Give vault authorization to account to call `activate`
    const selector = getFunctionSigHash("function activate() external");
    // Need the action id from the token admin auth itself so the correct disambiguator is used
    const actionId = await balTokenAdmin.getActionId(selector);
    await vaultAuth.grantPermissions([actionId], owner.address, [balTokenAdmin.address]);

    // Give token admin boss role
    await govToken.grantRole(await govToken.DEFAULT_ADMIN_ROLE(), balTokenAdmin.address);

    // Trigger admin activation
    await balTokenAdmin.activate();
  }

  it("should follow the correct emissions curve", async () => {
    await govToken.mint(owner.address, initialMintAllowance);
    await giveTokenAdminOwnership();
    console.log((await balTokenAdmin.getStartEpochTime()).toNumber());
    console.log(formatEther(await balTokenAdmin.getStartEpochSupply()));
    await helpers.time.increase(ONE_WEEK_SECONDS);
    console.log(formatEther(await balTokenAdmin.getAvailableSupply()));
    // await runTimeLoop();
    // await logEmissionsInfo();
  });
});
