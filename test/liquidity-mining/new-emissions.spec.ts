import { ethers } from "hardhat";
import * as helpers from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { BigNumber, Contract } from "ethers";
import { deployTokenAdmin } from "../../scripts/utils/lp-mining/deploy-token-admin";
import { commify, formatEther, parseEther } from "ethers/lib/utils";
import { deployGovernanceToken } from "../../scripts/general/deploy-governance-token";
import { deployVault } from "../../scripts/v2/vault/deploy-vault";
import { ONE_WEEK_SECONDS } from "../../scripts/utils/time";
import { secondsToDate, THREE_MONTHS_SECONDS } from "../../utils/time";
import { OPERATOR } from "../../utils/addresses";

const WETH = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";

const DROP_TIME = THREE_MONTHS_SECONDS;

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

  async function getMintableAmount(startSeconds: number, endSeconds: number) {
    const amount: BigNumber = await balTokenAdmin.mintableInTimeframe(startSeconds, endSeconds);
    return commify(formatEther(amount));
  }

  let minty = 0;

  async function runTimeLoop(epochCount: number) {
    for (const epoch of new Array(epochCount)) {
      await logEmissionsInfo();
      await helpers.time.increase(DROP_TIME);
      await balTokenAdmin.updateMiningParameters();
    }

    console.log(`Minty: ${minty}`);
  }

  async function logEmissionsInfo() {
    let [
      RATE_REDUCTION_COEFFICIENT,
      startEpochTime,
      nextEpochStart,
      rate,
      availableSupply,
      epochStartingSupply,
      miningEpoch,
    ] = await Promise.all([
      balTokenAdmin.RATE_REDUCTION_COEFFICIENT(),
      balTokenAdmin.getStartEpochTime(),
      balTokenAdmin.getFutureEpochTime(), // Start of next epoch
      balTokenAdmin.rate(),
      balTokenAdmin.getAvailableSupply(), // Maximum allowable number of tokens in existence (claimed or unclaimed)
      balTokenAdmin.getStartEpochSupply(),
      balTokenAdmin.getMiningEpoch(),
    ]);

    // const rateReductionSeconds = rateReductionTime.toNumber();
    // const rateReductionDays = rateReductionSeconds / SECONDS_IN_DAY;
    const mintable = await getMintableAmount(startEpochTime, nextEpochStart);

    // console.log(`
    // Rate reduction time(seconds):   ${rateReductionTime.toNumber()}
    // In days:                        ${rateReductionDays}
    // `);

    console.log(`
    RATE_REDUCTION_COEFFICIENT          ${formatEther(RATE_REDUCTION_COEFFICIENT)}
    Epoch start time:                   ${secondsToDate(startEpochTime)}
    Start of next epoch:                ${secondsToDate(nextEpochStart)}
    Epoch starting supply:              ${commify(formatEther(epochStartingSupply))}
    Current rate:                       ${formatEther(rate)}
    Mining epoch:                       ${miningEpoch.toNumber()}
    Mintable amount this epoch:         ${mintable}
    Total available supply:             ${commify(formatEther(availableSupply))}
    `);

    minty += Number(mintable);

    return {
      startEpochTime,
      nextEpochStart,
    };
  }

  async function giveTokenAdminOwnership() {
    // Give vault authorization to account to call `activate`
    const selector = balTokenAdmin.interface.getSighash("activate");
    // Need the action id from the token admin auth itself so the correct disambiguator is used
    const actionId = await balTokenAdmin.getActionId(selector);
    await vaultAuth.grantPermissions([actionId], owner.address, [balTokenAdmin.address]);

    // Give token admin boss role
    await govToken.grantRole(await govToken.DEFAULT_ADMIN_ROLE(), balTokenAdmin.address);

    // Trigger admin activation
    await balTokenAdmin.activate(OPERATOR);
  }

  it("should follow the correct emissions curve", async () => {
    await giveTokenAdminOwnership();
    await runTimeLoop(5);
    // await logEmissionsInfo();
  });
});
