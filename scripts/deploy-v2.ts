import { ethers } from "hardhat";
import { deployPoolFactories } from "../utils/deployers/pools/deploy-factories";
import { deployVault } from "../utils/deployers/vault/deploy-vault";
import { deployLiquidityMining } from "../utils/deployers/liquidity-mining/setup-liquidity-mining";
import {
  getBalTokenAdmin,
  getDeployedContractAddress,
  getERC20,
  getGovernanceToken,
  getVault,
} from "../utils/contract-utils";
import {
  activateTokenAdmin,
  createGovernanceToken,
  createTokenAdmin,
  giveTokenAdminControl,
  setupGovernance,
} from "../utils/deployers/liquidity-mining/governance/setup-governance";
import {
  getAllPoolConfigs,
  getPoolFactories,
  savePoolsData,
} from "../utils/services/pools/pool-utils";
import { PoolCreationService } from "../utils/services/pools/pool-creation.service";
import { ZERO_ADDRESS } from "./utils/constants";
import { setupVotingEscrow } from "../utils/deployers/liquidity-mining/setup-voting-escrow";
import { initWeightedJoin } from "../utils/vault";
import { getChainAdmin } from "../utils/data/addresses";
import { formatEther } from "ethers/lib/utils";
import { saveDeplomentData } from "../utils/deployers/save-deploy-data";

// For testing/dev env
export async function resetAllPoolConfigs() {
  const pools = (await getAllPoolConfigs()).map((p) => {
    return {
      ...p,
      created: false,
    };
  });

  await savePoolsData(pools);
}

async function main() {
  try {
    await ethers.provider.ready;

    const saving = true;

    // await resetAllPoolConfigs();

    // const { vaultData, authorizerData } = await deployVault(saving);
    // const {} = await setupGovernance(
    //   saving,
    //   await getDeployedContractAddress("Vault"),
    //   await getDeployedContractAddress("TimelockAuthorizer")
    // );
    // const { govTokenData } = await createGovernanceToken();
    // await saveDeplomentData(govTokenData.deployment);
    // const { tokenAdminData } = await createTokenAdmin(
    //   await getDeployedContractAddress("Vault"),
    //   await getDeployedContractAddress("GovernanceToken")
    // );
    // await saveDeplomentData(tokenAdminData.deployment);

    // Has to happen before activate
    // await giveTokenAdminControl(
    //   await getGovernanceToken(),
    //   await getDeployedContractAddress("BalancerTokenAdmin")
    // );

    // const admin = await getBalTokenAdmin();
    // await activateTokenAdmin(admin, await getDeployedContractAddress("TimelockAuthorizer"));

    // await deployPoolFactories(saving, await getDeployedContractAddress("Vault"));
    // const poolCreator = new PoolCreationService(ZERO_ADDRESS, await getPoolFactories());
    // poolCreator.createPools(saving);

    // const pools = await getAllPoolConfigs()
    // for (const pool of pools) {
    //   await initWeightedJoin(poolInfo.poolId, args.tokens, args.initialBalances, await getChainAdmin());
    // }

    const vrtk = await getERC20(await getDeployedContractAddress("GovernanceToken"));
    console.log(formatEther(await vrtk.balanceOf("0x891eFc56f5CD6580b2fEA416adC960F2A6156494")));
    console.log(formatEther(await vrtk.totalSupply()));

    // const admin = await getBalTokenAdmin();
    // console.log(await getDeployedContractAddress("GovernanceToken"));

    // await setupVotingEscrow(saving);
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
}

main();
