import { ethers } from "hardhat";
import { getDeployedContractAddress } from "../utils/data/utils";
import { deployPoolFactories } from "../utils/deployers/pools/deploy-factories";
import { deployVault } from "../utils/deployers/vault/deploy-vault";

async function main() {
  try {
    await ethers.provider.ready;
    const chainId = ethers.provider.network.chainId;
    // deploy vault system
    // deploy factories
    // create pools
    // setup liquidity mining system components
    // do any auth items along the way
    // save all deployment data (TODO: setup auto verification step)
    // const vaultData = await deployVault();
    // const vaultAddress = await getDeployedContractAddress(chainId, "Vault");
    // await deployPoolFactories(vaultAddress);
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
}

main();
