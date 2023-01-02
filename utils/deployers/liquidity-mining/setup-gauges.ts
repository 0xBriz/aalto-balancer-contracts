import { ZERO_ADDRESS } from "../../big-numbers/ethers-big-number";
import { getBalTokenAdmin, getTimelockAuth } from "../../contract-utils";
import { getChainAdmin } from "../../data/addresses";
import { getCreatedPoolConfigs, savePoolsData } from "../../services/pools/pool-utils";
import { awaitTransactionComplete, doTransaction } from "../../tx-utils";
import { deployContractUtil } from "../deploy-util";
import { logger } from "../logger";
import { saveDeplomentData } from "../save-deploy-data";

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

  const gaugeController = await deployContractUtil("GaugeController", {
    votingEscrow: votingEscrowAddress,
    authEntryAdapterAddress,
    stakingAdmin: await getChainAdmin(),
  });

  // TODO: Add gauge types
  // Added a "staking admin" to the GaugeController previously for simplicity

  const { balMinter } = await deployMinterAndSetPermissions(
    gaugeController.contract.address,
    timelockAuth,
    vault
  );

  const {
    tokenHolder,
    singleGaugeFactory,
    singleRecipientGaugeAddress,
    receipt: singleGaugeReceipt,
  } = await addMainPoolGauge(balMinter.contract.address, govToken, vault);

  const { veBoost, gaugeTemplate, gaugeFactory } = await deployLiquidityGaugeFactorySetup(
    votingEscrowAddress,
    balMinter.contract.address,
    authEntryAdapterAddress
  );

  // add pool gauges

  logger.info(`Adding liqudity gauges for pools..`);

  await addPoolGauges(singleRecipientGaugeAddress, singleGaugeReceipt.transactionHash);

  if (doSave) {
    saveDeplomentData(gaugeController.deployment);
    saveDeplomentData(balMinter.deployment);
    saveDeplomentData(veBoost.deployment);
    saveDeplomentData(gaugeTemplate.deployment);
    saveDeplomentData(gaugeFactory.deployment);
    saveDeplomentData(tokenHolder.deployment);
    saveDeplomentData(singleGaugeFactory.deployment);
  }

  return {
    gaugeController,
    balMinter,
    veBoost,
    gaugeTemplate,
    gaugeFactory,
    tokenHolder,
    singleGaugeFactory,
  };
}

export async function deployMinterAndSetPermissions(
  gaugeController: string,
  authAddress: string,
  tokenAdminAddress: string
) {
  const balMinter = await deployContractUtil("BalancerMinter", {
    tokenAdmin: tokenAdminAddress,
    gaugeController: gaugeController,
  });

  // Give bal minter auth to call mint on admin

  logger.info("setupGaugeSystem: giving BalMinter mint permission..");

  const timelockAuth = await getTimelockAuth(authAddress);
  const tokenAdmin = await getBalTokenAdmin();
  const actionId = await tokenAdmin.getActionId(tokenAdmin.interface.getSighash("mint"));
  await awaitTransactionComplete(
    await timelockAuth.grantPermissions([actionId], balMinter.contract.address, [
      tokenAdminAddress,
    ]),
    5
  );

  const granted = await timelockAuth.hasPermission(
    actionId,
    balMinter.contract.address,
    tokenAdminAddress
  );

  if (!granted) {
    throw new Error("Setting BalMinter permission failed");
  }

  logger.success("setupGaugeSystem: permission granted");

  return {
    balMinter,
  };
}

export async function deployLiquidityGaugeFactorySetup(
  votingEscrow: string,
  minter: string,
  authEntryAdapterAddress: string
) {
  logger.info("deployLiquidityGaugeFactorySetup: Deploying gauge factory setup");

  const veBoost = await deployContractUtil("BoostV2", {
    boostV1: ZERO_ADDRESS,
    votingEscrow,
  });

  const gaugeTemplate = await deployContractUtil("LiquidityGauge", {
    minter,
    boostProxy: veBoost.contract.address,
    authEntryAdapterAddress,
  });

  const gaugeFactory = await deployContractUtil("LiquidityGaugeFactory", {
    template: gaugeTemplate.contract.address,
  });

  logger.success("deployLiquidityGaugeFactorySetup: Complete");

  return {
    veBoost,
    gaugeTemplate,
    gaugeFactory,
  };
}

export async function addMainPoolGauge(minter: string, balToken: string, vault: string) {
  logger.info("addMainPoolGauge: Starting setup for SingleGauge");

  const tokenHolder = await deployContractUtil("BALTokenHolder", {
    balToken,
    vault,
    name: "BalTokenHolder",
  });

  const singleGaugeFactory = await deployContractUtil("SingleRecipientGaugeFactory", {
    minter,
  });

  const receipt = await doTransaction(
    singleGaugeFactory.contract.create(tokenHolder.contract.address)
  );

  const events = receipt.events.filter((e) => e.event === "SingleRecipientGaugeCreated");
  const gaugeAddress = events[0].args.gauge;
  logger.success("SingleRecipientGaugeCreated: " + gaugeAddress);

  logger.success("addMainPoolGauge: Complete");

  return {
    tokenHolder,
    singleGaugeFactory,
    singleRecipientGaugeAddress: gaugeAddress,
    receipt,
  };
}

export async function deployLiquidityGauge(poolAddress: string) {
  logger.info("deployLiquidityGauge: Adding LiqudityGauge for pool address: " + poolAddress);
  const receipt = await doTransaction(await this.liquidityGaugeFactory.create(poolAddress));
  const events = receipt.events.filter((e) => e.event === "GaugeCreated");
  const gaugeAddress = events[0].args.gauge;
  logger.success("deployLiquidityGauge: Gauge created " + gaugeAddress);
  return {
    receipt,
    gaugeAddress,
  };
}

export async function addPoolGauges(
  singleRecipientGaugeAddress: string,
  singleGaugeReceiptTxHash: string
) {
  logger.info(`Adding liqudity gauges for pools..`);

  const poolConfigs = await getCreatedPoolConfigs();

  for (const pool of poolConfigs) {
    if (pool.gauge.added) {
      continue;
    }

    try {
      logger.info(`Creating gauge for pool "${pool.name}"`);

      if (pool.isVePool) {
        pool.gauge.address = singleRecipientGaugeAddress;
        pool.gauge.txHash = singleGaugeReceiptTxHash;
      } else {
        const { gaugeAddress, receipt } = await deployLiquidityGauge(pool.poolAddress);
        pool.gauge.address = gaugeAddress;
        pool.gauge.txHash = receipt.transactionHash;
      }

      pool.gauge.added = true;

      await savePoolsData(poolConfigs);
    } catch (error) {
      logger.error(`Error adding pool gauge`);
      console.error(error);
    }
  }
}
