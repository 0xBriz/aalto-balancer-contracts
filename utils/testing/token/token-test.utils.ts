import { BigNumber, ethers } from "ethers";
import { hexlify } from "ethers/lib/utils";

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
