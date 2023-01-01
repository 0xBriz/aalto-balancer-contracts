import { parseEther } from "ethers/lib/utils";
import { getDeployedContractAddress } from "../../contract-utils";
import { getMainPoolConfig } from "../../services/pools/pool-utils";
import { ONE_YEAR_SECONDS } from "../../time";
import { awaitTransactionComplete } from "../../tx-utils";
import { deployContractUtil } from "../deploy-util";
import { logger } from "../logger";
import { getCurrentBlockTimestamp } from "../network";
import { saveDeplomentData } from "../save-deploy-data";

export async function setupVotingEscrow(doSave: boolean) {
  logger.info("setupVotingEscrow: initializing gauge items");

  // Setup base items/contracts

  const vePool = await getMainPoolConfig();
  const authEntryAdapterAddress = await getDeployedContractAddress("AuthorizerAdaptorEntrypoint");

  // Requires the main pool was already created
  const votingEscrow = await deployContractUtil("VotingEscrow", {
    token: vePool.poolAddress,
    name: "Voting Escrow",
    symbol: "veVRTK",
    authEntryAdapterAddress,
  });

  // Do a VE deposit to get total supply started for fee distributor deployment
  // Fee dist with revert at deployment if there is not a current supply of ve tokens
  await awaitTransactionComplete(votingEscrow.contract.deposit(parseEther("1"), ONE_YEAR_SECONDS));

  // Then we can deploy fee distributor
  const feeDistributor = await deployContractUtil("FeeDistributor", {
    votingEscrow: votingEscrow.contract.address,
    startTime: await getCurrentBlockTimestamp(),
  });

  logger.success("setupVotingEscrow: complete");

  if (doSave) {
    await Promise.all([
      saveDeplomentData(votingEscrow.deployment),
      saveDeplomentData(feeDistributor.deployment),
    ]);
  }

  return {
    votingEscrow,
    feeDistributor,
  };
}
