import { getDeployedContractAddress } from "../../../contract-utils";
import { getMainPoolConfig, updatePoolConfig } from "../../../services/pools/pool-utils";

export async function updateMainPoolConfigForGovToken() {
  const govTokenAddress = await getDeployedContractAddress("GovernanceToken");
  // Set the new token address for use in pool creation and such later
  const vePool = await getMainPoolConfig();
  let hadSymbol = false;
  vePool.tokenInfo = vePool.tokenInfo.map((ti) => {
    if (ti.symbol === "VRTK") {
      hadSymbol = true;
      return {
        ...ti,
        address: govTokenAddress,
      };
    }

    return ti;
  });

  if (!hadSymbol) {
    throw new Error("Missing VRTK symbol for ve pool");
  }

  await updatePoolConfig(vePool);
}
