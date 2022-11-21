import { ethers } from "hardhat";
import * as helpers from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { BigNumber, Contract } from "ethers";
import { deployVault } from "../scripts/deploy-vault";
import { deployGovernanceToken } from "../scripts/general/deploy-governance-token";
import { expect } from "chai";
import { deployTokenAdmin } from "../scripts/utils/lp-mining/deploy-token-admin";
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
const ONE_WEEK = SECONDS_IN_DAY * 7;
const ONE_MONTH = SECONDS_IN_DAY * 30;
const THREE_MONTHS = SECONDS_IN_DAY * 90;
const SIX_MONTHS = SECONDS_IN_DAY * 180;
const ONE_YEAR = SECONDS_IN_DAY * 365;

describe("Voting Escrow", () => {
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

  // beforeEach(async () => {
  //   const accounts = await ethers.getSigners();
  //   owner = accounts[0];
  //   stakeForUser = accounts[1];

  //   AEQ = await deployAdminToken();
  //   Vault = await deployVault(WETH);
  //   authorizer = await ethers.getContractAt(TimeAuth.abi, await Vault.getAuthorizer());
  //   BalTokenAdmin = await deployTokenAdmin(Vault.address, AEQ.address);
  //   mockVeDepositToken = await deployTestERC20(parseEther("1000000"));
  //   authAdapter = await deployAuthAdapter(Vault.address);
  //   votingEscrow = await deployVotingEscrow(
  //     mockVeDepositToken.address,
  //     "veToken",
  //     "veToken",
  //     authAdapter.address,
  //     owner.address
  //   );
  //   gaugeController = await deployGaugeController(votingEscrow.address, authAdapter.address);
  // });

  // it("should activate token admin ownership", async () => {
  //   const iface = new Interface(["function activate() external"]);
  //   const selector = iface.getSighash("activate()");
  //   console.log(selector);

  //   const actionId = await BalTokenAdmin.getActionId(selector);
  //   console.log(actionId);
  //   let canDo = await authorizer.canPerform(actionId, owner.address, BalTokenAdmin.address);
  //   console.log(canDo);

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

  // it("should admin create lock for a user", async () => {
  //   const lockAmount = parseEther("100");
  //   let currentBlock = await ethers.provider.getBlock(await ethers.provider.getBlockNumber());
  //   const unlockTime = currentBlock.timestamp + 365 * SECONDS_IN_DAY;
  //   await mockVeDepositToken.approve(votingEscrow.address, ethers.constants.MaxUint256);

  //   await votingEscrow.admin_create_lock_for(stakeForUser.address, lockAmount, unlockTime);
  //   currentBlock = await ethers.provider.getBlock(await ethers.provider.getBlockNumber());
  //   const balance = await votingEscrow.balanceOfAt(stakeForUser.address, currentBlock.number);
  //   console.log(`
  //   60 day staked for: ${stakeForUser.address}
  //   Staked for user veAEQ balance: ${formatEther(balance)}`);

  //   // const veAuthAdapter = new Contract(await votingEscrow.admin(), AuthAdapter.abi, owner);
  //   // const iface = new Interface(["function admin_create_lock_for(address, uint256, uint256) external"]);
  //   // const selector = iface.getSighash("admin_create_lock_for(address, uint256, uint256)");
  //   // console.log(selector);
  //   // This wont work without transferring the funds to the auth adapter contract itself first
  //   // So sticking with the "staking admin" thing
  //   // Need function selector encode in initial bytes
  //   // const argsWithSelector = iface.encodeFunctionData("admin_create_lock_for", [
  //   //   stakeForUser.address,
  //   //   lockAmount,
  //   //   unlockTime,
  //   // ]);
  //   // console.log(argsWithSelector);
  //   // const actionId = await veAuthAdapter.getActionId(selector);
  //   // let canDo = await authorizer.canPerform(actionId, owner.address, votingEscrow.address);
  //   // console.log(canDo);
  //   // await authorizer.grantPermissions([actionId], owner.address, [votingEscrow.address]);
  //   // canDo = await authorizer.canPerform(actionId, owner.address, votingEscrow.address);
  //   // console.log(canDo);
  //   // const args = ethers.utils.defaultAbiCoder.encode(
  //   //   ["address", "uint256", "uint256"],
  //   //   [stakeForUser.address, lockAmount, unlockTime]
  //   // );
  //   // console.log(args);
  //   // await authAdapter.performAction(votingEscrow.address, argsWithSelector);
  // });

  // it("should admin increase amounts for a user", async () => {
  //   const lockAmount = parseEther("100");
  //   let currentBlock = await ethers.provider.getBlock(await ethers.provider.getBlockNumber());
  //   const unlockTime = currentBlock.timestamp + 365 * SECONDS_IN_DAY;
  //   await mockVeDepositToken.approve(votingEscrow.address, ethers.constants.MaxUint256);

  //   await votingEscrow.admin_create_lock_for(stakeForUser.address, lockAmount, unlockTime);
  //   currentBlock = await ethers.provider.getBlock(await ethers.provider.getBlockNumber());

  //   let userBalance = await votingEscrow.balanceOfAt(stakeForUser.address, currentBlock.number);
  //   let lockEnd: BigNumber = await votingEscrow.locked__end(stakeForUser.address);
  //   console.log(`
  //   365 day staked for: ${stakeForUser.address}
  //   Staked for user veAEQ balance: ${formatEther(userBalance)}
  //   lockEnd: ${new Date(lockEnd.toNumber() * 1000)}`);

  //   console.log(`
  //   Increasing user lock..`);

  //   const additionalLockAmount = parseEther("200");
  //   await votingEscrow.admin_increase_amount_for(stakeForUser.address, additionalLockAmount);

  //   currentBlock = await ethers.provider.getBlock(await ethers.provider.getBlockNumber());
  //   userBalance = await votingEscrow.balanceOfAt(stakeForUser.address, currentBlock.number);
  //   lockEnd = await votingEscrow.locked__end(stakeForUser.address);

  //   console.log(`
  //   365 day staked for: ${stakeForUser.address}
  //   New staked for user veAEQ balance: ${formatEther(userBalance)}
  //   lockEnd: ${new Date(lockEnd.toNumber() * 1000)}`);
  // });

  // it("should admin increase amounts AND time for a user", async () => {
  //   const lockAmount = parseEther("100");

  //   console.log(`
  //   Starting initial user stake for THREE_MONTHS`);

  //   console.log(`
  //   Amount in: ${formatEther(lockAmount)}`);

  //   console.log(`
  //   current date/time: ${new Date((await helpers.time.latest()) * 1000).toLocaleString()}`);

  //   // Make the time shorter to stay under max for additional stake
  //   const unlockTime = (await helpers.time.latest()) + THREE_MONTHS;
  //   await mockVeDepositToken.approve(votingEscrow.address, ethers.constants.MaxUint256);

  //   await votingEscrow.admin_create_lock_for(stakeForUser.address, lockAmount, unlockTime);

  //   let currentBlock = await ethers.provider.getBlock(await ethers.provider.getBlockNumber());
  //   let userBalance = await votingEscrow.balanceOfAt(stakeForUser.address, currentBlock.number);
  //   let lockEnd: BigNumber = await votingEscrow.locked__end(stakeForUser.address);
  //   console.log(`
  //   THREE_MONTHS staked for user: ${stakeForUser.address}
  //   User veAEQ amount balance: ${formatEther(userBalance)}
  //   lockEnd: ${new Date(lockEnd.toNumber() * 1000).toLocaleString()}`);

  //   console.log(`
  //   Increasing user lock AND end time..`);
  //   console.log(`
  //   current date/time: ${new Date((await helpers.time.latest()) * 1000).toLocaleString()}`);

  //   console.log(`
  //   Fast forwarding world time one month..`);

  //   console.log(`
  //   current date/time: ${new Date(
  //     (await helpers.time.increase(ONE_MONTH)) * 1000
  //   ).toLocaleString()}`);

  //   currentBlock = await ethers.provider.getBlock(await ethers.provider.getBlockNumber());
  //   const additionalLockAmount = parseEther("150");

  //   console.log(`
  //   Additional amount in: ${formatEther(additionalLockAmount)}`);

  //   const newUnlockTime = currentBlock.timestamp + THREE_MONTHS;

  //   console.log(`
  //   Setting user unlock time to ~: ${new Date(newUnlockTime * 1000).toLocaleString()}`);

  //   await votingEscrow.admin_increase_total_stake_for(
  //     stakeForUser.address,
  //     additionalLockAmount,
  //     newUnlockTime
  //   );

  //   currentBlock = await ethers.provider.getBlock(await ethers.provider.getBlockNumber());
  //   userBalance = await votingEscrow.balanceOfAt(stakeForUser.address, currentBlock.number);
  //   lockEnd = await votingEscrow.locked__end(stakeForUser.address);
  //   console.log(`
  //   New stake for: ${stakeForUser.address}
  //   New user veAEQ balance: ${formatEther(userBalance)}
  //   New lockEnd: ${new Date(lockEnd.toNumber() * 1000)}`);
  // });

  // it("should do supply curve shit", async () => {
  //   // If going this route we need to be able to update the emissions according to our schedule
  //   expect(true).to.be.true;
  // });
});
