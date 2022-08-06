import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { Contract } from "ethers";
import { deployVault } from "../scripts/deploy-vault";
import { deployAdminToken } from "../scripts/deploy-governance-token";
import { expect } from "chai";
import { deployBalTokenAdmin } from "../scripts/lp-mining/deploy-token-admin";
import TimeAuth from "../artifacts/contracts/authorizer/TimelockAuthorizer.sol/TimelockAuthorizer.json";
import AuthAdapter from "../artifacts/contracts/liquidity-mining/admin/AuthorizerAdaptor.sol/AuthorizerAdaptor.json";
import { formatEther, Interface, parseEther } from "ethers/lib/utils";
import { deployAuthAdapter } from "../scripts/utils/lp-mining/deploy-auth-adapter";
import { deployTestERC20 } from "../scripts/utils/deploy-test-erc20";
import { deployVotingEscrow } from "../scripts/utils/lp-mining/deploy-voting-escrow";
import { deployGaugeController } from "../scripts/utils/lp-mining/deploy-gauge-controller";

const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"; // ETH mainnet

const ONE_DAY = (60 * 1000 * 60 * 24) / 1000;
const SECONDS_IN_DAY = 86400;

describe("Token Admin", () => {
  let owner: SignerWithAddress;
  let stakeForUser: SignerWithAddress;
  let AEQ: Contract;
  let Vault: Contract;
  let authorizer: Contract;
  let authAdapter: Contract;
  let BalTokenAdmin: Contract;
  let mockVeDepositToken: Contract;
  let votingEscrow: Contract;
  let gaugeController: Contract;

  beforeEach(async () => {
    const accounts = await ethers.getSigners();
    owner = accounts[0];
    stakeForUser = accounts[1];

    AEQ = await deployAdminToken();
    Vault = await deployVault(WETH);
    authorizer = await ethers.getContractAt(TimeAuth.abi, await Vault.getAuthorizer());
    BalTokenAdmin = await deployBalTokenAdmin(Vault.address, AEQ.address);
    mockVeDepositToken = await deployTestERC20(parseEther("1000000"));
    authAdapter = await deployAuthAdapter(Vault.address);
    votingEscrow = await deployVotingEscrow(
      mockVeDepositToken.address,
      "veToken",
      "veToken",
      authAdapter.address,
      owner.address
    );
    gaugeController = await deployGaugeController(votingEscrow.address, authAdapter.address);
  });

  // it("should activate token admin ownership", async () => {
  //   const iface = new Interface(["function activate() external"]);
  //   const selector = iface.getSighash("activate()");
  //   console.log(selector);

  //   const actionId = await BalTokenAdmin.getActionId(selector);
  //   console.log(actionId);
  //   let canDo = await authorizer.canPerform(actionId, owner.address, BalTokenAdmin.address);
  //   console.log(canDo);
  //   const canGrant = await authorizer.canGrant(actionId, owner.address, BalTokenAdmin.address);
  //   console.log(canGrant);
  //   await authorizer.grantPermissions([actionId], owner.address, [BalTokenAdmin.address]);
  //   canDo = await authorizer.canPerform(actionId, owner.address, BalTokenAdmin.address);
  //   console.log(canDo);

  //   await AEQ.grantRole(await AEQ.DEFAULT_ADMIN_ROLE(), BalTokenAdmin.address);
  //   await BalTokenAdmin.activate();

  //   // await BalTokenAdmin.mint(owner.address, parseEther("100"));
  //   expect(true).to.be.true;
  // });

  // it("should create locks and mint ve tokens", async () => {
  //   await mockVeDepositToken.approve(votingEscrow.address, ethers.constants.MaxUint256);

  //   const lockAmount = parseEther("100");
  //   let currentBlock = await ethers.provider.getBlock(await ethers.provider.getBlockNumber());
  //   console.log(currentBlock.timestamp);
  //   const lockEnd = currentBlock.timestamp + 365 * SECONDS_IN_DAY;
  //   console.log(lockEnd);
  //   await votingEscrow.create_lock(lockAmount, lockEnd);

  //   currentBlock = await ethers.provider.getBlock(await ethers.provider.getBlockNumber());
  //   const balance = await votingEscrow.balanceOfAt(owner.address, currentBlock.number);
  //   console.log(`
  //   veAEQ balance: ${formatEther(balance)}`);
  // });

  it("should creating locks for users", async () => {
    const lockAmount = parseEther("100");
    let currentBlock = await ethers.provider.getBlock(await ethers.provider.getBlockNumber());
    const unlockTime = currentBlock.timestamp + 365 * SECONDS_IN_DAY;
    await mockVeDepositToken.approve(votingEscrow.address, ethers.constants.MaxUint256);

    const veAuthAdapter = new Contract(await votingEscrow.admin(), AuthAdapter.abi, owner);
    const iface = new Interface(["function create_lock_for(address, uint256, uint256) external"]);
    const selector = iface.getSighash("create_lock_for(address, uint256, uint256)");
    console.log(selector);

    // This wont work without transferring the funds to the auth adapter contract itself first
    // So sticking with the "staking admin" thing
    // Need function selector encode in initial bytes
    // const argsWithSelector = iface.encodeFunctionData("create_lock_for", [
    //   stakeForUser.address,
    //   lockAmount,
    //   unlockTime,
    // ]);
    // console.log(argsWithSelector);

    const actionId = await veAuthAdapter.getActionId(selector);
    await authorizer.grantPermissions([actionId], owner.address, [votingEscrow.address]);

    const args = ethers.utils.defaultAbiCoder.encode(
      ["address", "uint256", "uint256"],
      [stakeForUser.address, lockAmount, unlockTime]
    );

    console.log(args);

    await authAdapter.performAction(votingEscrow.address, args);

    // // await votingEscrow.create_lock_for(stakeForUser.address, lockAmount, unlockTime);
    // currentBlock = await ethers.provider.getBlock(await ethers.provider.getBlockNumber());
    // const balance = await votingEscrow.balanceOfAt(stakeForUser.address, currentBlock.number);
    // console.log(`
    // 60 day staked for: ${stakeForUser.address}
    // Staked for user veAEQ balance: ${formatEther(balance)}`);
    expect(true).to.be.true;
  });

  // it("should do supply curve shit", async () => {
  //   // If going this route we need to be able to update the emissions according to our schedule
  //   expect(true).to.be.true;
  // });
});
