import { BigNumber, ethers } from "ethers";

// Contract storage slots for user balances
// Use to overwrite a users balance to any value for testing
// Removes need for a whole dex and swap setup just for test tokens
export const ASHARE_BALANCEOF_SLOT = 0;
export const BUSD_BALANCEOF_SLOT = 1;
export const USDC_BALANCEOF_SLOT = 1;
export const AMES_BALANCEOF_SLOT = 0;

export const prepStorageSlotWrite = (
  receiverAddress: string,
  storageSlot: number
) => {
  return ethers.utils.solidityKeccak256(
    ["uint256", "uint256"],
    [receiverAddress, storageSlot] // key, slot - solidity mappings storage = keccak256(mapping key value, value at that key)
  );
};

export const toBytes32 = (bn: BigNumber) => {
  return ethers.utils.hexlify(ethers.utils.zeroPad(bn.toHexString(), 32));
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

export async function moveUpBlocks(
  blockCount: number,
  provider: ethers.providers.JsonRpcProvider
) {
  // To base 16 Hex
  await provider.send("hardhat_mine", ["0x" + blockCount.toString(16)]);
}
