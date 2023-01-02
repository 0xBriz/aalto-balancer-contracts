import { getChainId } from "../deployers/network";

export const OPERATOR = "0x891eFc56f5CD6580b2fEA416adC960F2A6156494";

export const ADMIN = {
  5: OPERATOR,
  56: OPERATOR,
  31337: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
};

export async function getChainAdmin() {
  return ADMIN[await getChainId()];
}
