import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { DeployedContract, FactoryContracts } from "../../contract-utils";
import { CreateWeightedPoolArgs, PoolFactoryInfo } from "../../types";
import { deployContractUtil } from "../deploy-util";
import { logger } from "../logger";
import { saveDeploymentData } from "../save-deploy-data";

const FACTORY_TYPES: DeployedContract[] = [
  "ERC4626LinearPoolFactory",
  "LiquidityBootstrappingPoolFactory",
  "StablePoolFactory",
  "WeightedPoolFactory",
];

export async function deployPoolFactories(
  vault: string,
  excludeTypes: FactoryContracts[]
): Promise<PoolFactoryInfo[]> {
  try {
    logger.info("deployPoolFactories: Deploying factories");

    const factories: PoolFactoryInfo[] = [];
    const factoryDeployments = [];

    for (const factory of FACTORY_TYPES.filter(
      (f) => !excludeTypes.includes(f as FactoryContracts)
    )) {
      const info = await deployContractUtil(factory, {
        vault,
      });

      factoryDeployments.push(info);
      factories.push({
        type: factory,
        address: info.contract.address,
        contract: info.contract,
      });
    }

    logger.success("deployPoolFactories: Factories deployment complete");

    for (const factory of factoryDeployments) {
      await saveDeploymentData(factory.deployment);
    }

    return factories;
  } catch (error) {
    throw error;
  }
}

export async function createWeightedPool(
  factoryAddress: string,
  args: CreateWeightedPoolArgs,
  signer
) {
  console.log("createWeightedPool: creating pool...");
  const factory = new Contract(
    factoryAddress,
    [
      `function create(
      string  name,
      string  symbol,
      address[]  tokens,
      uint256[]  normalizedWeights,
      address[]  rateProviders,
      uint256 swapFeePercentage,
      address owner
  ) external returns (address) `,
    ],
    signer
  );

  const tx = await factory.create(
    args.name,
    args.symbol,
    args.tokens,
    args.weights.map((w) => parseUnits(w)),
    args.rateProviders,
    parseUnits(args.swapFeePercentage),
    args.owner
  );

  return tx.wait();
}

export async function getPoolCreationData(poolAddress: string, signer) {
  const pool = new Contract(
    poolAddress,
    ["function getPoolId() public view returns (bytes32)"],
    signer
  );

  const data = {
    poolId: await pool.getPoolId(),
    poolAddress,
    // txHash: receipt.transactionHash,
    date: new Date().toLocaleString(),
  };

  console.log(data);

  return data;
}
