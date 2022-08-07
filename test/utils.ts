import { BigNumber, Contract, ethers } from "ethers";
import { defaultAbiCoder } from "ethers/lib/utils";
import { string } from "hardhat/internal/core/params/argumentTypes";
import { MAX_UINT256 } from "../scripts/utils/constants";
import { ERC20_ABI } from "./abis/ERC20ABI";
import { WEIGHTED_POOL_ABI } from "./abis/WeightPool";
import { IERC20, JoinPoolRequest } from "./types";

// Contract storage slots for user balances
// Use to overwrite a users balance to any value for testing
// Removes need for a whole dex and swap setup just for test tokens
export const ASHARE_BALANCEOF_SLOT = 0;
export const BUSD_BALANCEOF_SLOT = 1;
export const USDC_BALANCEOF_SLOT = 1;
export const AMES_BALANCEOF_SLOT = 0;

export const prepStorageSlotWrite = (receiverAddress: string, storageSlot: number) => {
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

export async function moveUpBlocks(blockCount: number, provider: ethers.providers.JsonRpcProvider) {
  // To base 16 Hex
  await provider.send("hardhat_mine", ["0x" + blockCount.toString(16)]);
}

export function sortTokens(tokens: string[]) {
  tokens.sort((t1, t2) => (t1 > t2 ? 1 : -1));
}

export function getWeightedPoolInstance(address: string, signer) {
  return new Contract(address, WEIGHTED_POOL_ABI, signer);
}

export async function initWeightedJoin(
  poolId: string,
  tokens: string[],
  initialBalances: BigNumber[],
  recipient: string,
  vault: Contract,
  signer
) {
  try {
    console.log("initWeightedJoin");
    const JOIN_KIND_INIT = 0; // Can only be called once for most pools
    // Must be encoded
    const initUserData = defaultAbiCoder.encode(
      ["uint256", "uint256[]"],
      [JOIN_KIND_INIT, initialBalances]
    );

    const joinPoolRequest: JoinPoolRequest = {
      assets: tokens,
      maxAmountsIn: initialBalances,
      userData: initUserData,
      fromInternalBalance: false,
    };

    // Vault needs approval to pull the tokens in
    await approveTokensIfNeeded(tokens, recipient, vault.address, signer);

    // Joins are done on the Vault instead of pools
    const tx = await vault.joinPool(poolId, recipient, recipient, joinPoolRequest);
    return await tx.wait();
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export function getERC20(address: string, signer): IERC20 & Contract {
  return new Contract(address, ERC20_ABI, signer) as unknown as IERC20 & Contract;
}

export async function approveTokensIfNeeded(
  tokens: string[],
  owner: string,
  spender: string,
  signer
) {
  try {
    console.log(`Checking allowances..`);
    for (const address of tokens) {
      const token = getERC20(address, signer);
      const allowance: BigNumber = await token.allowance(owner, spender);
      if (allowance.isZero()) {
        console.log(`Approving token: ${address} - for spender ${spender}`);
        const tx = await token.approve(spender, MAX_UINT256);
        await tx.wait();
      }
    }
  } catch (error) {
    throw error;
  }
}
