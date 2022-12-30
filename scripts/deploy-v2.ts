import { deployVault } from "../utils/deployers/vault/deploy-vault";

async function main() {
  try {
    // deploy vault system
    // create pools
    // setup liquidity mining
    // do any auth items along the way
    // save all deployment data (TODO: setup auto verification step)
    // await deployVault();
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
}

main();
