import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ZERO_ADDRESS } from "../../big-numbers/ethers-big-number";
import {
  getAutEntryAdapter,
  getBalTokenAdmin,
  getDeployedContractAddress,
  getGaugeController,
  getTimelockAuth,
} from "../../contract-utils";
import { getChainAdmin } from "../../data/addresses";
import { AuthService } from "../../services/auth.service";
import {
  getCreatedPoolConfigs,
  getLiquidityGaugeFactory,
  getMainPoolConfig,
  savePoolsData,
  updatePoolConfig,
} from "../../services/pools/pool-utils";
import { awaitTransactionComplete, doTransaction } from "../../tx-utils";
import { GaugeType, PoolCreationConfig } from "../../types";
import { deployContractUtil } from "../deploy-util";
import { logger } from "../logger";
import { saveDeplomentData } from "../save-deploy-data";
import { getSigner } from "../signers";

export async function setupGaugeSystem(
  doSave: boolean,
  authEntryAdapterAddress: string,
  votingEscrowAddress: string,
  timelockAuth: string,
  govToken: string,
  vault: string
) {
  // const authEntryAdapterAddress = await getDeployedContractAddress("AuthorizerAdaptorEntrypoint");
  // const votingEscrowAddress = await getDeployedContractAddress("VotingEscrow");
  // const gaugeController = await deployContractUtil("GaugeController", {
  //   votingEscrow: votingEscrowAddress,
  //   authEntryAdapterAddress,
  //   stakingAdmin: await getChainAdmin(),
  // });
  // // TODO: Add gauge types
  // // Added a "staking admin" to the GaugeController previously for simplicity
  // const { balMinter } = await deployMinterAndSetPermissions(
  //   gaugeController.contract.address,
  //   timelockAuth,
  //   vault
  // );
  // const {
  //   tokenHolder,
  //   singleGaugeFactory,
  //   singleRecipientGaugeAddress,
  //   receipt: singleGaugeReceipt,
  // } = await addMainPoolGauge(balMinter.contract.address, govToken, vault);
  // const { veBoost, gaugeTemplate, gaugeFactory } = await deployLiquidityGaugeFactorySetup(
  //   votingEscrowAddress,
  //   balMinter.contract.address,
  //   authEntryAdapterAddress
  // );
  // // add pool gauges
  // logger.info(`Adding liqudity gauges for pools..`);
  // await addPoolGauges(singleRecipientGaugeAddress, singleGaugeReceipt.transactionHash);
  // if (doSave) {
  //   await saveDeplomentData(gaugeController.deployment);
  //   await saveDeplomentData(balMinter.deployment);
  //   await saveDeplomentData(veBoost.deployment);
  //   await saveDeplomentData(gaugeTemplate.deployment);
  //   await saveDeplomentData(gaugeFactory.deployment);
  //   await saveDeplomentData(tokenHolder.deployment);
  //   await saveDeplomentData(singleGaugeFactory.deployment);
  // }
  // return {
  //   gaugeController,
  //   balMinter,
  //   veBoost,
  //   gaugeTemplate,
  //   gaugeFactory,
  //   tokenHolder,
  //   singleGaugeFactory,
  // };
}

export async function addGaugeController() {
  const gaugeController = await deployContractUtil("GaugeController", {
    votingEscrow: await getDeployedContractAddress("VotingEscrow"),
    authEntryAdapterAddress: await getDeployedContractAddress("AuthorizerAdaptorEntrypoint"),
    stakingAdmin: await getChainAdmin(),
  });
  await saveDeplomentData(gaugeController.deployment);
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
  await saveDeplomentData(balMinter.deployment);
}

export async function giveMinterPermissions() {
  logger.info("setupGaugeSystem: giving BalMinter mint permission..");
  const tokenAdminAddress = await getDeployedContractAddress("BalancerTokenAdmin");
  const minterAddress = await getDeployedContractAddress("BalancerMinter");
  const timelockAuth = await getTimelockAuth(
    await getDeployedContractAddress("TimelockAuthorizer")
  );
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

export async function deployLiquidityGaugeFactorySetup() {
  logger.info("deployLiquidityGaugeFactorySetup: Deploying gauge factory setup");

  const veBoost = await deployContractUtil("BoostV2", {
    boostV1: ZERO_ADDRESS,
    adapter: await getDeployedContractAddress("AuthorizerAdaptorEntrypoint"),
  });

  await saveDeplomentData(veBoost.deployment);

  const gaugeTemplate = await deployContractUtil("LiquidityGaugeV5", {
    minter: await getDeployedContractAddress("BalancerMinter"),
    boostProxy: await getDeployedContractAddress("BoostV2"),
    adapter: await getDeployedContractAddress("AuthorizerAdaptorEntrypoint"),
  });

  await saveDeplomentData(gaugeTemplate.deployment);

  const gaugeFactory = await deployContractUtil("LiquidityGaugeFactory", {
    template: gaugeTemplate.contract.address,
  });

  await saveDeplomentData(gaugeFactory.deployment);

  logger.success("deployLiquidityGaugeFactorySetup: Complete");

  // return {
  //   veBoost,
  //   gaugeTemplate,
  //   gaugeFactory,
  // };
}

export async function addMainPoolGauge() {
  logger.info("addMainPoolGauge: Starting setup for SingleGauge");

  const tokenHolder = await deployContractUtil("BALTokenHolder", {
    balToken: await getDeployedContractAddress("GovernanceToken"),
    vault: await getDeployedContractAddress("Vault"),
    name: "BalTokenHolder",
  });

  await saveDeplomentData(tokenHolder.deployment);

  const singleGaugeFactory = await deployContractUtil("SingleRecipientGaugeFactory", {
    minter: await getDeployedContractAddress("BalancerMinter"),
  });

  await saveDeplomentData(singleGaugeFactory.deployment);

  const receipt = await doTransaction(
    singleGaugeFactory.contract.create(tokenHolder.contract.address)
  );

  const events = receipt.events.filter((e) => e.event === "SingleRecipientGaugeCreated");
  const gaugeAddress = events[0].args.gauge;
  logger.success("SingleRecipientGaugeCreated: " + gaugeAddress);

  logger.success("addMainPoolGauge: Complete");

  const pool = await getMainPoolConfig();
  pool.gauge.address = gaugeAddress;
  await updatePoolConfig(pool);

  return {
    tokenHolder,
    singleGaugeFactory,
    singleRecipientGaugeAddress: gaugeAddress,
    receipt,
  };
}

export async function deployLiquidityGauge(poolAddress: string) {
  logger.info("deployLiquidityGauge: Adding LiqudityGauge for pool address: " + poolAddress);
  const factory = await getLiquidityGaugeFactory();
  const receipt = await doTransaction(await factory.create(poolAddress));
  const events = receipt.events.filter((e) => e.event === "GaugeCreated");
  const gaugeAddress = events[0].args.gauge;
  logger.success("deployLiquidityGauge: Gauge created " + gaugeAddress);
  return {
    receipt,
    gaugeAddress,
  };
}

export async function addPoolGauges() {
  logger.info(`Adding liqudity gauges for pools..`);

  const poolConfigs = await getCreatedPoolConfigs();

  for (const pool of poolConfigs) {
    if (pool.gauge.added) {
      continue;
    }

    try {
      // already taken care of
      if (pool.isVePool) {
        continue;
      }

      logger.info(`Creating gauge for pool "${pool.name}"`);

      const { gaugeAddress, receipt } = await deployLiquidityGauge(pool.poolAddress);
      pool.gauge.address = gaugeAddress;
      pool.gauge.txHash = receipt.transactionHash;

      await savePoolsData(poolConfigs);
    } catch (error) {
      logger.error(`Error adding pool gauge`);
      console.error(error);
    }
  }
}

export async function addGaugesToController() {
  const poolConfigs = await getCreatedPoolConfigs();

  for (const pool of poolConfigs) {
    if (pool.gauge.added) {
      continue;
    }

    try {
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
      await savePoolsData(poolConfigs);
    } catch (error) {
      console.error(error);
      logger.error("Error adding gauge to controller");
    }
  }
}
