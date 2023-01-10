import { getAddress } from "ethers/lib/utils";
import { getChainId } from "../deployers/network";

export const OPERATOR = "0x891eFc56f5CD6580b2fEA416adC960F2A6156494";

export const ADMIN = {
  5: OPERATOR,
  56: OPERATOR,
  31337: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
};

export const VERTEK_ADDRESS = {
  56: {
    MULTISIG: "0xA8AAe7bEB83d62eb908F8F1F833A83407e0E04a6",
  },
  5: {
    MULTISIG: OPERATOR,
  },
};

export async function getChainAdmin() {
  return getAddress(ADMIN[await getChainId()]);
}
