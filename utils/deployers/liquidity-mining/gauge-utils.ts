import { BigNumber } from "ethers";
import { getAutEntryAdapter, getLiquidityGauge } from "../../contract-utils";
import { getChainAdmin } from "../../data/addresses";
import {
  canPerformAction,
  getTimelockActionId,
  grantAuthEntryPermission,
  grantPerformActionIfNeeded,
  performAdapterAction,
} from "../../services/auth.service";
import { approveTokensIfNeeded } from "../../token";
import { awaitTransactionComplete } from "../../tx-utils";
import { logger } from "../logger";

export async function addGaugeReward(
  gaugeAddress: string,
  token: string,
  amount: BigNumber,
  setDistributor: boolean
) {
  const admin = await getChainAdmin();
  const gauge = await getLiquidityGauge(gaugeAddress);
  // await awaitTransactionComplete(await gauge.)
  // approve gauge

  await approveTokensIfNeeded([token], admin, gaugeAddress);

  await awaitTransactionComplete(await gauge.add_reward());
}

/**
 * Only admin account can give vault permissions
 */
export async function setGaugeRewardDistributor(
  gaugeAddress: string,
  token: string,
  distributor: string
) {
  logger.info("setGaugeRewardDistributor:");

  const gauge = await getLiquidityGauge(gaugeAddress);
  const functionName = "add_reward";
  const actionId = await getTimelockActionId(gauge, functionName);
  //  await grantAuthEntryPermission(gauge.address, actionId);
  await grantPerformActionIfNeeded(gauge.address, actionId, await getChainAdmin());
  // await performAdapterAction(gauge, functionName, [token, distributor]);
}
