import { BigNumber, Contract } from "ethers";
import {
  defaultAbiCoder,
  formatBytes32String,
  hexZeroPad,
  parseBytes32String,
  toUtf8Bytes,
} from "ethers/lib/utils";
import {
  getAutEntryAdapter,
  getDeployedContractAddress,
  getLiquidityGauge,
} from "../../../contract-utils";
import { getChainAdmin } from "../../../data/addresses";
import {
  getActionIdWithParams,
  getFunctionSelectorBytes,
  getTimelockActionId,
  grantAuthEntryPermission,
  grantPerformActionIfNeeded,
  performAdapterAction,
} from "../../../services/auth.service";
import { approveTokensIfNeeded } from "../../../token/token-utils";
import { awaitTransactionComplete } from "../../../tx-utils";
import { logger } from "../../logger";
import { getSigner } from "../../signers";
import { getTimelockAuth } from "../../../contract-utils";

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
  // const actionId = await getTimelockActionId(gauge, functionName);
  const params = [token, distributor];

  const adapter = await getAutEntryAdapter();

  // const actionId = await adapter.getActionId(getFunctionSelectorBytes(gauge, functionName));
  // const authorizer = await getTimelockAuth(await getDeployedContractAddress("TimelockAuthorizer"));
  // await awaitTransactionComplete(
  //   await authorizer.grantPermissions([actionId], adapter.address, [gauge.address]),
  //   10
  // );

  const callData = gauge.interface.encodeFunctionData(functionName, params);
  await awaitTransactionComplete(await adapter.performAction(gauge.address, callData));
  // const actionId2 = await authorizer.getActionId(actionId, hexZeroPad(toUtf8Bytes(callData), 32));
  // console.log(actionId2);
}
