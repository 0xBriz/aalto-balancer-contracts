import { BigNumber, ethers } from "ethers";
import { hexlify } from "ethers/lib/utils";
import { MAX_UINT256 } from "./big-number";
import { getERC20 } from "./contract-utils";
import { logger } from "./deployers/logger";

export function sortTokens(tokens: string[]) {
  return tokens.sort((t1, t2) => (t1 > t2 ? 1 : -1));
}

export async function approveTokensIfNeeded(tokens: string[], owner: string, spender: string) {
  try {
    logger.info(`Checking token allowances..`);
    for (const address of tokens) {
      const token = await getERC20(address);
      const allowance: BigNumber = await token.allowance(owner, spender);
      if (allowance.isZero()) {
        logger.info(`Approving token: ${address} - for spender ${spender}`);
        const tx = await token.approve(spender, MAX_UINT256);
        await tx.wait();
      }
    }
  } catch (error) {
    throw error;
  }
}

export const prepStorageSlotWrite = (receiverAddress: string, storageSlot: number) => {
  return ethers.utils.solidityKeccak256(
    ["uint256", "uint256"],
    [receiverAddress, storageSlot] // key, slot - solidity mappings storage = keccak256(mapping key value, value at that key)
  );
};

export const toBytes32 = (bn: BigNumber) => {
  return hexlify(ethers.utils.zeroPad(bn.toHexString(), 32));
};

export const setStorageAt = async (
  provider: ethers.providers.JsonRpcProvider,
  contractAddress: string,
  index: string,
  value: BigNumber
) => {
  await provider.send("hardhat_setStorageAt", [
    contractAddress,
    index,
    toBytes32(value).toString(),
  ]);
  await provider.send("evm_mine", []); // Just mines to the next block
};

export const giveTokenBalanceFor = async (
  provider: ethers.providers.JsonRpcProvider,
  contractAddress: string,
  addressToSet: string,
  storageSlot: number,
  amount: BigNumber
) => {
  const index = prepStorageSlotWrite(addressToSet, storageSlot);
  await setStorageAt(provider, contractAddress, index, amount);
};
