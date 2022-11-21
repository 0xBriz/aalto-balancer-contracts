import * as fs from "fs-extra";
import { join } from "path";

const CHAINS = {
  5: "goerli",
  56: "bsc",
};

export async function saveDeplomentData(filename: string, data, chainId: number) {
  try {
    const file = filename + ".json";
    await fs.writeJSON(join(process.cwd(), "deployments", `${CHAINS[chainId]}`, file), data);
    console.log("Save deploy data for: " + filename);
    console.log(data);
    console.log("VERIFY CONTRACT!!");
  } catch (error) {
    throw error;
  }
}
