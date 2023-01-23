import { ethers } from "hardhat";
import {
  createWeightedPool,
  deployPoolFactories,
  getPoolCreationData,
} from "../utils/deployers/pools/factories";
import { setupVault } from "../utils/deployers/vault/deploy-vault";
import { deployLiquidityMining } from "../utils/deployers/liquidity-mining/setup-liquidity-mining";
import {
  getBalTokenAdmin,
  getDeployedContractAddress,
  getERC20,
  getGovernanceToken,
  getVault,
} from "../utils/contract-utils";
import {
  createGovernanceToken,
  createTokenAdmin,
  setupGovernance,
} from "../utils/deployers/liquidity-mining/governance/contract-deployment";
import {
  getAllPoolConfigs,
  getMainPoolConfig,
  getPoolFactories,
  getWeightedPoolArgsFromConfig,
  initWeightedJoin,
  savePoolsData,
  updatePoolConfig,
} from "../utils/services/pools/pool-utils";
import { PoolCreationService } from "../utils/services/pools/pool-creation.service";
import { ANY_ADDRESS, ZERO_ADDRESS } from "./utils/constants";
import {
  addFeeDistributor,
  doVeDeposit,
  setupVotingEscrow,
} from "../utils/deployers/liquidity-mining/setup-voting-escrow";
import { getChainAdmin } from "../utils/data/addresses";
import { formatEther } from "ethers/lib/utils";
import { saveDeploymentData } from "../utils/deployers/save-deploy-data";
import {
  addGaugeController,
  // addPoolGaugesToController,
  addGaugeTypes,
  addMainPoolGaugeSetup,
  addVeBalHelpers,
  createPoolGaugesAndAddToController,
  deployLiquidityGaugeFactorySetup,
  deployMinter,
  giveMinterPermissions,
  setupBoostProxy,
} from "../utils/deployers/liquidity-mining/gauges/setup-gauges";
import { setGaugeRewardDistributor } from "../utils/deployers/liquidity-mining/gauges/gauge-utils";
import { doPoolsCreation } from "../utils/deployers/pools/pool-creation";
import { Logger } from "../utils/deployers/logger";
import { CreateWeightedPoolArgs, PoolFactoryInfo } from "../utils/types";
import { deployContractUtil } from "../utils/deployers/deploy-util";
import { AuthorizerAdaptor } from "../utils/models/AuthorizerAdapter";
import { getSigner } from "../utils/deployers/signers";
import { AuthorizerAdaptorEntrypoint } from "../utils/models/AuthorizerAdaptorEntrypoint";
import { TimelockAuthorizer } from "../utils/models/TimelockAuthorizer";
import { Contract } from "ethers";
import { actionId, getCalldata } from "../utils/actionid";
import { awaitTransactionComplete } from "../utils/tx-utils";

// For testing/dev env
export async function resetAllPoolConfigs() {
  const pools = (await getAllPoolConfigs()).map((p) => {
    return {
      ...p,
      created: false,
    };
  });

  await savePoolsData(pools);
}

async function sleep(ms = 5000) {
  console.log("Sleeping...");
  return new Promise((res) => setTimeout(res, ms));
}

async function main() {
  try {
    await ethers.provider.ready;

    const weightedFactory = "0x8F1a6dD65E8d76de878dEb776A5D41b5919Feba7";
    const vaultAddress = "0x1F56FDcB9E3a818E4BB2E6Fe2cb73F7385D3Aeac";
    const signer = await getSigner();

    const pools = await getAllPoolConfigs();
    const pool = pools[0];
    const args = getWeightedPoolArgsFromConfig(pool, signer.address);
    pool.deploymentArgs = {
      ...pool.deploymentArgs,
      ...args,
    };
    await updatePoolConfig(pool);

    // const receipt = await createWeightedPool(weightedFactory, args, signer);

    // console.log(receipt);
    const poolAddress = "0x39F84FE24135D3C160b5E1BCa36b0e66b6C11c4E";
    // pool.created = true;
    // pool.poolAddress = poolAddress;
    // await updatePoolConfig(pool);

    // const poolData = await getPoolCreationData(poolAddress, signer);
    // await updatePoolConfig({
    //   ...pool,
    //   ...poolData,
    // });

    const rx = await initWeightedJoin(
      vaultAddress,
      pool.poolId,
      pool.deploymentArgs.tokens,
      pool.deploymentArgs.initialBalances,
      signer.address,
      signer
    );

    const tokenAdmin = new Contract(
      "0xb8e6D3700BCE2CC163BD4FfC52dA1F65CFeE8909",
      [
        "function getActionId(bytes4) public view returns (bytes32)",
        "function activate() external",
      ],
      signer
    );

    const actionId = await tokenAdmin.getActionId(tokenAdmin.interface.getSighash("activate"));
    console.log(actionId);

    const authorizer = new Contract(
      "0x3d838DF4F4Ac0b28693771B83E40DB07F9b1ADe9",
      [
        `function grantPermissions(
          bytes32[] memory actionIds,
          address account,
          address[] memory where
      ) external`,
      ],
      signer
    );

    const tx = await authorizer.grantPermissions([actionId], signer.address, [tokenAdmin.address]);
    await tx.wait(2);

    awaitTransactionComplete;
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
}

main();
