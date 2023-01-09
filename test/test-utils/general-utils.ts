import * as fs from "fs-extra";
import { join } from "path";

export async function cleanUpTestDeploymentData() {
  const basePath = join(process.cwd(), "deployments/hardhat");
  // Empty out the directory
  await fs.emptyDir(basePath);
  // auto fill this back in so doesn't have to be added again later
  await fs.writeJSON(join(basePath, "addresses.json"), {});
}
