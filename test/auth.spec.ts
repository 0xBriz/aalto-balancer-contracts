import { ethers } from "hardhat";
import * as helpers from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { BigNumber, Contract } from "ethers";
import { deployVault } from "../scripts/deploy-vault";
import { expect } from "chai";
import TimeAuth from "../artifacts/contracts/authorizer/TimelockAuthorizer.sol/TimelockAuthorizer.json";
import AuthAdapter from "../artifacts/contracts/liquidity-mining/admin/AuthorizerAdaptor.sol/AuthorizerAdaptor.json";
import { formatEther, Interface, parseEther, parseUnits } from "ethers/lib/utils";
import { deployAuthAdapter } from "../scripts/utils/lp-mining/deploy-auth-adapter";
import { deployTestERC20 } from "../scripts/utils/deploy-test-erc20";
import { deployWeightedFactory } from "../scripts/utils/factories/weighted-factory";
import { deployWeightedNoAssetManagersFactory } from "../scripts/utils/factories/weighted-nomanagers";
import { getBalancerPoolToken, getWeightedPoolInstance, initWeightedJoin } from "./utils";

const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"; // ETH mainnet

const ONE_DAY = (60 * 1000 * 60 * 24) / 1000;
const SECONDS_IN_DAY = 86400;
const ONE_WEEK = SECONDS_IN_DAY * 7;
const ONE_MONTH = SECONDS_IN_DAY * 30;
const THREE_MONTHS = SECONDS_IN_DAY * 90;
const SIX_MONTHS = SECONDS_IN_DAY * 180;
const ONE_YEAR = SECONDS_IN_DAY * 365;

describe("Authorization", () => {
  let owner: SignerWithAddress;
  let Vault: Contract;
  let vaultAuthorizer: Contract;
  let authAdapter: Contract;
  let weightedFactory: Contract;
  let token0: Contract;
  let token1: Contract;

  let mainPool: Contract;

  beforeEach(async () => {
    const accounts = await ethers.getSigners();
    owner = accounts[0];

    Vault = await deployVault(WETH);
    vaultAuthorizer = await ethers.getContractAt(TimeAuth.abi, await Vault.getAuthorizer());
    authAdapter = await deployAuthAdapter(Vault.address);
    weightedFactory = await deployWeightedNoAssetManagersFactory(Vault.address);

    token0 = await deployTestERC20(parseEther("100000"));
    token1 = await deployTestERC20(parseEther("100000"));

    const tokens = [token0.address, token1.address].sort((t1, t2) => (t1 > t2 ? 1 : -1));
    const tx = await weightedFactory.create(
      "Pool",
      "Pool",
      tokens,
      [parseUnits("0.5"), parseUnits("0.5")],
      parseUnits("0.01"),
      owner.address
    );

    const receipt = await tx.wait();
    const events = receipt.events.filter((e) => e.event === "PoolCreated");
    const poolAddress = events[0].args.pool;
    mainPool = getWeightedPoolInstance(poolAddress, owner);
    const poolId = await mainPool.getPoolId();
    const data = {
      poolId,
      poolAddress,
    };
    console.log(data);

    await initWeightedJoin(
      poolId,
      tokens,
      [parseEther("1000"), parseEther("1000")],
      owner.address,
      Vault,
      owner
    );
  });

  it("should ", async () => {
    // const poolAuthorizer = await mainPool.getAuthorizer();
    let pauseState = await mainPool.getPausedState();
    console.log(pauseState.paused);

    // const abi = new Interface(["function pause() external"]);
    // const hash = abi.getSighash("pause");
    // const actionId = await mainPool.getActionId(hash);
    // console.log("actionId: " + actionId);

    // const canOne = await vaultAuthorizer.isPermissionGrantedOnTarget(
    //   actionId,
    //   owner.address,
    //   mainPool.address
    // );
    // console.log(canOne);

    // const canTwo = await vaultAuthorizer.hasPermission(actionId, owner.address, mainPool.address);
    // console.log(canTwo);

    // // const isGranter = await vaultAuthorizer.isGranter(actionId, owner.address, mainPool.address);
    // // console.log(isGranter);

    // const permissionId = await vaultAuthorizer.permissionId(
    //   actionId,
    //   owner.address,
    //   mainPool.address
    // );
    // console.log("permissionId: " + permissionId);

    // await vaultAuthorizer.grantPermissions([actionId], owner.address, [mainPool.address]);
    // console.log(await vaultAuthorizer.hasPermission(actionId, owner.address, mainPool.address));

    // await mainPool.pause();
    // console.log(await mainPool.getPausedState());

    // const vaultActionId = await vaultAuthorizer["getActionId(bytes4)"](hash);
    // console.log(vaultActionId);
  });
});
