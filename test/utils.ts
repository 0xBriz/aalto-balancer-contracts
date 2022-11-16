import { BigNumber, Contract, ContractTransaction, ethers } from "ethers";
import { defaultAbiCoder, Interface } from "ethers/lib/utils";
import { sub } from "date-fns";
import { MAX_UINT256 } from "../scripts/utils/constants";
import { ERC20_ABI } from "./abis/ERC20ABI";
import { WEIGHTED_POOL_ABI } from "./abis/WeightPool";
import { IERC20, JoinPoolRequest } from "./types";
import liqV5 from "../artifacts/contracts/liquidity-mining/gauges/LiquidityGaugeV5.vy/LiquidityGaugeV5.json";
import AuthAdapter from "../artifacts/contracts/liquidity-mining/admin/AuthorizerAdaptor.sol/AuthorizerAdaptor.json";
import BPT from "../artifacts/contracts/pool-utils/BalancerPoolToken.sol/BalancerPoolToken.json";

export const oneSecondInMs = 1000;

// Contract storage slots for user balances
// Use to overwrite a users balance to any value for testing
// Removes need for a whole dex and swap setup just for test tokens
export const ASHARE_BALANCEOF_SLOT = 0;
export const BUSD_BALANCEOF_SLOT = 1;
export const USDC_BALANCEOF_SLOT = 1;
export const AMES_BALANCEOF_SLOT = 0;
export const WBNB_BALANCEOF_SLOT = 3;

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

export async function moveUpBlocks(blockCount: number, provider: ethers.providers.JsonRpcProvider) {
  // To base 16 Hex
  await provider.send("hardhat_mine", ["0x" + blockCount.toString(16)]);
}

export function sortTokens(tokens: string[]) {
  return tokens.sort((t1, t2) => (t1 > t2 ? 1 : -1));
}

export function getBalancerPoolToken(address: string, signer) {
  return new Contract(address, BPT.abi, signer);
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
    //  console.log(`Checking allowances..`);
    for (const address of tokens) {
      const token = getERC20(address, signer);
      const allowance: BigNumber = await token.allowance(owner, spender);
      if (allowance.isZero()) {
        //  console.log(`Approving token: ${address} - for spender ${spender}`);
        const tx = await token.approve(spender, MAX_UINT256);
        await tx.wait();
      }
    }
  } catch (error) {
    throw error;
  }
}

export async function awaitTransactionComplete(txResponse: ContractTransaction, confirmations = 1) {
  try {
    console.log(`- Starting transaction: ${txResponse.hash}`);
    console.log(`- Awaiting transaction receipt... - ` + new Date().toLocaleString());
    const txReceipt = await txResponse.wait(confirmations);
    console.log("- TransactionReceipt received - " + new Date().toLocaleString());
    if (txReceipt.status === 1) {
      // success
      console.log(`Transaction successful`);
    }
    return txReceipt;
  } catch (error) {
    throw error; // Throw and try to let this be handled back in the call stack as needed
  }
}

export function getLiquidityGauge(address: string, signer) {
  return new Contract(address, liqV5.abi, signer);
}

export function getAuthAdapter(address: string, signer) {
  return new Contract(address, AuthAdapter.abi, signer);
}

export function getFunctionSigHash(functionPrototype: string) {
  const iface = new Interface([functionPrototype]);
  // "function fn() external".split(' ')[1] = portion needed for getSighash
  const selector = iface.getSighash(functionPrototype.split(" ")[1]);
  return selector;
}

export function getPreviousEpoch(weeksToGoBack = 0): Date {
  const now = new Date();
  const todayAtMidnightUTC = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());

  let daysSinceThursday = now.getDay() - 4;
  if (daysSinceThursday < 0) daysSinceThursday += 7;

  daysSinceThursday = daysSinceThursday + weeksToGoBack * 7;

  return sub(todayAtMidnightUTC, {
    days: daysSinceThursday,
  });
}

export function toUnixTimestamp(jsTimestamp: number): number {
  return Math.round(jsTimestamp / oneSecondInMs);
}
