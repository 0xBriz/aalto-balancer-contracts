import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { Contract } from "ethers";
import { deployVault } from "../scripts/deploy-vault";
import { deployAdminToken } from "../scripts/deploy-governance-token";
import { expect } from "chai";
import { deployBalTokenAdmin } from "../scripts/lp-mining/deploy-token-admin";
import TimeAuth from "../artifacts/contracts/authorizer/TimelockAuthorizer.sol/TimelockAuthorizer.json";
import { Interface, parseEther } from "ethers/lib/utils";

const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"; // ETH mainnet

describe("Token Admin", () => {
  let owner: SignerWithAddress;
  let AEQ: Contract;
  let Vault: Contract;
  let authorizer: Contract;
  let BalTokenAdmin: Contract;

  beforeEach(async () => {
    const accounts = await ethers.getSigners();
    owner = accounts[0];

    AEQ = await deployAdminToken();
    Vault = await deployVault(WETH);
    authorizer = await ethers.getContractAt(TimeAuth.abi, await Vault.getAuthorizer());
    BalTokenAdmin = await deployBalTokenAdmin(Vault.address, AEQ.address);
  });

  it("should activate token admin ownership", async () => {
    const iface = new Interface(["function activate() external"]);
    const selector = iface.getSighash("activate()");
    console.log(selector);

    const actionId = await BalTokenAdmin.getActionId(selector);
    console.log(actionId);

    let canDo = await authorizer.canPerform(actionId, owner.address, BalTokenAdmin.address);
    console.log(canDo);

    const canGrant = await authorizer.canGrant(actionId, owner.address, BalTokenAdmin.address);
    console.log(canGrant);

    await authorizer.grantPermissions([actionId], owner.address, [BalTokenAdmin.address]);

    canDo = await authorizer.canPerform(actionId, owner.address, BalTokenAdmin.address);
    console.log(canDo);

    await AEQ.grantRole(await AEQ.DEFAULT_ADMIN_ROLE(), BalTokenAdmin.address);
    await BalTokenAdmin.activate();

    // await BalTokenAdmin.mint(owner.address, parseEther("100"));
    expect(true).to.be.true;
  });
});
