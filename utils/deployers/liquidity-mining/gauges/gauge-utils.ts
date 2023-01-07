import { BigNumber } from "ethers";
import { getLiquidityGauge } from "../../../contract-utils";
import { awaitTransactionComplete } from "../../../tx-utils";

export async function addGaugeReward(gaugeAddress: string, token: string, amount: BigNumber) {
  const gauge = await getLiquidityGauge(gaugeAddress);
  // await awaitTransactionComplete(await gauge.)
}
