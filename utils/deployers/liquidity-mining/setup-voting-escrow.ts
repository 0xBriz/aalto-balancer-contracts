import { parseEther } from "ethers/lib/utils";
import {
  getBalancerPoolToken,
  getDeployedContractAddress,
  getGovernanceToken,
  getVotingEscrow,
} from "../../contract-utils";
import { getChainAdmin } from "../../data/addresses";
import { getMainPoolConfig } from "../../services/pools/pool-utils";
import { ONE_WEEK_SECONDS, ONE_YEAR_SECONDS } from "../../time";
import { approveTokensIfNeeded } from "../../token/token-utils";
import { awaitTransactionComplete } from "../../tx-utils";
import { deployContractUtil } from "../deploy-util";
import { logger } from "../logger";
import { getCurrentBlockTimestamp } from "../network";
import { saveDeploymentData } from "../save-deploy-data";

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

  if (doSave) {
    await saveDeploymentData(votingEscrow.deployment);
  }

  // Then we can deploy fee distributor
  const feeDistributor = await deployContractUtil("FeeDistributor", {
    votingEscrow: votingEscrow.contract.address,
    startTime: await getCurrentBlockTimestamp(),
  });

  logger.success("setupVotingEscrow: complete");

  if (doSave) {
    await saveDeploymentData(feeDistributor.deployment);
  }

  return {
    votingEscrow,
    feeDistributor,
  };
}

export async function doVeDeposit() {
  // Do a VE deposit to get total supply started for fee distributor deployment
  // Fee dist with revert at deployment if there is not a current supply of ve tokens

  const ve = await getVotingEscrow();
  // await approveTokensIfNeeded(
  //   [(await getMainPoolConfig()).poolAddress],
  //   await getChainAdmin(),
  //   ve.address
  // );

  const blockTime = await getCurrentBlockTimestamp();
  await awaitTransactionComplete(
    await ve.create_lock(parseEther("1"), blockTime + ONE_YEAR_SECONDS)
  );
}

export async function addFeeDistributor() {
  const feeDistributor = await deployContractUtil("FeeDistributor", {
    votingEscrow: await getDeployedContractAddress("VotingEscrow"),
    startTime: (await getCurrentBlockTimestamp()) + ONE_WEEK_SECONDS,
  });

  await saveDeploymentData(feeDistributor.deployment);
}
