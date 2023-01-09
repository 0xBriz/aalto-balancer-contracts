import * as fs from "fs-extra";
import { join } from "path";
import { getAllPoolConfigs, savePoolsData } from "../../utils/services/pools/pool-utils";

const testDeploymentPath = join(process.cwd(), "deployments/hardhat");

/**
 * Not really needed anymore since the contract deploy util accouts for test chain id
 */
export async function cleanUpTestDeploymentData() {
  // Empty out the directory
  await fs.emptyDir(testDeploymentPath);
  // auto fill this back in so doesn't have to be added again later
  await fs.writeJSON(join(testDeploymentPath, "addresses.json"), {});
}

/**
 *  Resets properties that would stop a pool or gauge from being created again during testing
 */
export async function resetTestPoolConfigs() {
  const pools = (await getAllPoolConfigs()).map((p) => {
    return {
      ...p,
      created: false,
      initJoinComplete: false,
      gauge: {
        address: "",
        startingWeight: "0",
        added: false,
        txHash: "",
        controllerTxHash: "",
      },
    };
  });

  await savePoolsData(pools);
}
