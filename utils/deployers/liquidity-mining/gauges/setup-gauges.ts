import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ZERO_ADDRESS } from "../../../big-numbers/ethers-big-number";
import {
  getAutEntryAdapter,
  getBalTokenAdmin,
  getDeployedContractAddress,
  getGaugeController,
  getLiquidityGauge,
  getTimelockAuth,
} from "../../../contract-utils";
import { getChainAdmin } from "../../../data/addresses";
import { AuthService } from "../../../services/auth.service";
import {
  getCreatedPoolConfigs,
  getLiquidityGaugeFactory,
  getMainPoolConfig,
  savePoolsData,
  updatePoolConfig,
} from "../../../services/pools/pool-utils";
import { awaitTransactionComplete, doTransaction } from "../../../tx-utils";
import { GaugeType, PoolCreationConfig } from "../../../types";
import { deployContractUtil } from "../../deploy-util";
import { logger } from "../../logger";
import { saveDeploymentData } from "../../save-deploy-data";
import { getSigner } from "../../signers";

export async function addGaugeController() {
  const gaugeController = await deployContractUtil("GaugeController", {
    votingEscrow: await getDeployedContractAddress("VotingEscrow"),
    authEntryAdapterAddress: await getDeployedContractAddress("AuthorizerAdaptorEntrypoint"),
    stakingAdmin: await getChainAdmin(),
  });
  await saveDeploymentData(gaugeController.deployment);
}

export async function addGaugeTypes() {
  const gc = new Contract(
    await getDeployedContractAddress("GaugeController"),
    ["function add_type(string, uint256) external"],
    await getSigner()
  );
  await awaitTransactionComplete(await gc.add_type(GaugeType.veBAL, 1));
  await awaitTransactionComplete(await gc.add_type(GaugeType.LiquidityMiningCommittee, 1));
}

export async function deployMinter() {
  const balMinter = await deployContractUtil("BalancerMinter", {
    tokenAdmin: await getDeployedContractAddress("BalancerTokenAdmin"),
    gaugeController: await getDeployedContractAddress("GaugeController"),
  });
  await saveDeploymentData(balMinter.deployment);
}

export async function giveMinterPermissions() {
  logger.info("setupGaugeSystem: giving BalMinter mint permission..");
  const tokenAdminAddress = await getDeployedContractAddress("BalancerTokenAdmin");
  const minterAddress = await getDeployedContractAddress("BalancerMinter");
  const timelockAuth = await getTimelockAuth();
  const tokenAdmin = await getBalTokenAdmin();
  const actionId = await tokenAdmin.getActionId(tokenAdmin.interface.getSighash("mint"));
  await awaitTransactionComplete(
    await timelockAuth.grantPermissions([actionId], minterAddress, [tokenAdminAddress]),
    10
  );

  const granted = await timelockAuth.hasPermission(actionId, minterAddress, tokenAdminAddress);

  console.log("Permission granted?:" + granted);

  logger.success("setupGaugeSystem: permission granted");
}

export async function setupBoostProxy() {
  logger.info("setupBoostProxy: Deploying boost setup");

  const veBoost = await deployContractUtil("BoostV2", {
    boostV1: ZERO_ADDRESS,
    adapter: await getDeployedContractAddress("VotingEscrow"),
  });

  await saveDeploymentData(veBoost.deployment);

  const boostProxy = await deployContractUtil("VotingEscrowDelegationProxy", {
    vault: await getDeployedContractAddress("Vault"),
    votingEscrow: await getDeployedContractAddress("VotingEscrow"),
    delegationImpl: veBoost.contract.address,
  });

  await saveDeploymentData(boostProxy.deployment);
}

export async function deployLiquidityGaugeFactorySetup() {
  logger.info("deployLiquidityGaugeFactorySetup: Deploying gauge factory setup");

  const gaugeTemplate = await deployContractUtil("LiquidityGaugeV5", {
    minter: await getDeployedContractAddress("BalancerMinter"),
    boostProxy: await getDeployedContractAddress("VotingEscrowDelegationProxy"),
    adapter: await getDeployedContractAddress("AuthorizerAdaptorEntrypoint"),
  });

  await saveDeploymentData(gaugeTemplate.deployment);

  const gaugeFactory = await deployContractUtil("LiquidityGaugeFactory", {
    template: gaugeTemplate.contract.address,
  });

  await saveDeploymentData(gaugeFactory.deployment);

  logger.success("deployLiquidityGaugeFactorySetup: Complete");

  // return {
  //   veBoost,
  //   gaugeTemplate,
  //   gaugeFactory,
  // };
}

export async function addMainPoolGaugeSetup() {
  logger.info("addMainPoolGauge: Starting setup for SingleGauge");

  const tokenHolder = await deployContractUtil("BALTokenHolder", {
    balToken: await getDeployedContractAddress("GovernanceToken"),
    vault: await getDeployedContractAddress("Vault"),
    name: "BalTokenHolder",
  });

  await saveDeploymentData(tokenHolder.deployment);

  const singleGaugeFactory = await deployContractUtil("SingleRecipientGaugeFactory", {
    minter: await getDeployedContractAddress("BalancerMinter"),
  });

  await saveDeploymentData(singleGaugeFactory.deployment);

  const receipt = await doTransaction(
    singleGaugeFactory.contract.create(tokenHolder.contract.address)
  );

  const events = receipt.events.filter((e) => e.event === "SingleRecipientGaugeCreated");
  const gaugeAddress = events[0].args.gauge;
  logger.success("SingleRecipientGaugeCreated: " + gaugeAddress);

  logger.success("addMainPoolGauge: Complete");

  const pool = await getMainPoolConfig();
  pool.gauge.address = gaugeAddress;
  pool.gauge.txHash = receipt.transactionHash;

  await updatePoolConfig(pool);

  await addGaugeToController(pool);

  return {
    tokenHolder,
    singleGaugeFactory,
    singleRecipientGaugeAddress: gaugeAddress,
    receipt,
  };
}

export async function createLiquidityGaugeForPool(poolAddress: string) {
  logger.info("createLiquidityGaugeForPool: Adding LiqudityGauge for pool address: " + poolAddress);
  const factory = await getLiquidityGaugeFactory();
  const receipt = await doTransaction(await factory.create(poolAddress));
  const events = receipt.events.filter((e) => e.event === "GaugeCreated");
  const gaugeAddress = events[0].args.gauge;
  logger.success("createLiquidityGaugeForPool: Gauge created " + gaugeAddress);
  return {
    receipt,
    gaugeAddress,
  };
}

export async function createPoolGaugesAndAddToController() {
  logger.info(`Adding liquidity gauges for pools..`);

  const poolConfigs = await getCreatedPoolConfigs();

  for (const pool of poolConfigs) {
    if (pool.gauge.added) {
      continue;
    }

    try {
      // handled in addMainPoolGaugeSetup
      if (pool.isVePool) {
        continue;
      }

      logger.info(`Creating gauge for pool "${pool.name}"`);

      const { gaugeAddress, receipt } = await createLiquidityGaugeForPool(pool.poolAddress);
      pool.gauge.address = gaugeAddress;
      pool.gauge.txHash = receipt.transactionHash;

      await updatePoolConfig(pool);

      await addGaugeToController(pool);
    } catch (error) {
      logger.error(`Error adding pool gauge`);
      console.error(error);
    }
  }
}

export async function giveGaugeRewardsPermissions() {
  logger.info(`giveGaugeRewardsPermissions:`);

  const poolConfigs = await getCreatedPoolConfigs();
  for (const pool of poolConfigs) {
    if (!pool.gauge.added) continue;

    const gauge = await getLiquidityGauge(pool.gauge.address);
  }
}

export async function addGaugeToController(pool: PoolCreationConfig) {
  logger.info(`addGaugeToController: for pool id ${pool.poolId}`);
  // avoiding the weird vyper generated abi from default param values causing two functions to be created
  const controller = new Contract(
    await getDeployedContractAddress("GaugeController"),
    ["function add_gauge(address, int128, uint256) external"],
    await getSigner()
  );

  const weight = pool.gauge.startingWeight.length ? parseUnits(pool.gauge.startingWeight) : 0;
  const gaugeType = pool.isVePool ? 0 : 1;
  const receipt = await awaitTransactionComplete(
    await controller.add_gauge(pool.gauge.address, gaugeType, weight)
  );

  pool.gauge.added = true;
  pool.gauge.controllerTxHash = receipt.transactionHash;
  await updatePoolConfig(pool);

  logger.success(`addGaugeToController: gauge added to controller`);
}

export async function addVeBalHelpers() {
  const veHelper = await deployContractUtil("GaugeControllerQuerier", {
    gaugeController: await getDeployedContractAddress("GaugeController"),
  });
  await saveDeploymentData(veHelper.deployment);
}
