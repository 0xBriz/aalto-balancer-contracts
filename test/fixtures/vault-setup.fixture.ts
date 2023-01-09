import { setupVault } from "../../utils/deployers/vault/deploy-vault";

export async function vaultSetupFixture() {
  return await setupVault();
}
