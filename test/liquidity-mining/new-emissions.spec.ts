import { ethers } from "hardhat";
import * as helpers from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { Contract } from "ethers";
import { deployTokenAdmin } from "../../scripts/utils/lp-mining/deploy-token-admin";
import { formatEther, parseEther } from "ethers/lib/utils";
import { deployGovernanceToken } from "../../scripts/general/deploy-governance-token";
import { deployVault } from "../../scripts/v2/vault/deploy-vault";
import { ONE_WEEK_SECONDS } from "../../scripts/utils/time";

const WETH = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";

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
    const selector = balTokenAdmin.interface.getSighash("activate");
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
