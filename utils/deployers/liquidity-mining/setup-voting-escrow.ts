import { getDeployedContractAddress } from "../../contract-utils";
import { getDeployedPools } from "../../services/pools/pool-utils";
import { deployContractUtil } from "../deploy-util";
import { logger } from "../logger";
import { saveDeplomentData } from "../save-deploy-data";

export async function setupVotingEscrow(doSave: boolean) {
  logger.info("setupVotingEscrow: initializing gauge items");

  // Setup base items/contracts

  const poolConfigs = await getDeployedPools();
  const vePool = poolConfigs.filter((p) => p.isVePool)[0];
  const authEntryAdapterAddress = await getDeployedContractAddress("AuthorizerAdaptorEntrypoint");

  // Requires the main pool was already created
  const votingEscrow = await deployContractUtil("VotingEscrow", {
    token: vePool.poolAddress,
    name: "Voting Escrow",
    symbol: "veVRTK",
    authEntryAdapterAddress,
  });

  // TODO: Join pool to get total supply started for fee dist deployment
  // deploy fee dist

  logger.success("setupVotingEscrow: complete");

  if (doSave) {
    await Promise.all([saveDeplomentData(votingEscrow.deployment)]);
  }

  return {
    votingEscrow,
  };
}
