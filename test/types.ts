import { BigNumber, ContractTransaction, ethers } from 'ethers';

export enum ExitKindWeighted {
  EXACT_BPT_IN_FOR_ONE_TOKEN_OUT,
  EXACT_BPT_IN_FOR_TOKENS_OUT,
  BPT_IN_FOR_EXACT_TOKENS_OUT,
  MANAGEMENT_FEE_TOKENS_OUT, // for InvestmentPool
}

export enum ExitKindStable {
  EXACT_BPT_IN_FOR_ONE_TOKEN_OUT,
  EXACT_BPT_IN_FOR_TOKENS_OUT,
  BPT_IN_FOR_EXACT_TOKENS_OUT,
}

export interface ExitPoolRequest {
  tokens: string[];
  minAmountsOut: BigNumber[];
  toInternalBalance: boolean;
}

export interface AccountWeb3 {
  wallet: ethers.Wallet;
  provider: ethers.providers.JsonRpcProvider;
  chainId: number;
}

export interface JoinPoolRequest {
  assets: string[];
  maxAmountsIn: BigNumber[];
  userData: string; // ABI encoded data
  fromInternalBalance: boolean;
}

export interface IERC20 {
  approve: (spender: string, amount: BigNumber) => Promise<ContractTransaction>;
  balanceOf: (account: string) => Promise<BigNumber>;
  allowance: (owner: string, spender: string) => Promise<BigNumber>;
  mint: (to: string, amount: BigNumber) => Promise<void>;
}

export interface IPool {
  getPoolId: () => Promise<string>;
}

export interface InitWeightedPoolArgs {
  poolId: string;
  tokens: string[];
  initialBalances: BigNumber[];
  lpTokenReceiver: string;
}

export interface CreateWeightedPoolArgs {
  name: string;
  symbol: string;
  tokens: string[];
  weights: BigNumber[];
  swapFeePercentage: BigNumber;
  owner: string;
}

export interface CreateWeightedTwoTokensPoolArgs
  extends CreateWeightedPoolArgs {
  oracleEnabled: boolean;
}

export interface StablePoolCreationArgs extends CreateWeightedPoolArgs {
  amplificationParameter: BigNumber;
}

export interface ChefPoolAllocation {
  poolId: number;
  allocPoints: number;
}

export interface ChefAddPoolArgs {
  allocPoints: number;
  lpToken: string;
  rewarder?: string;
}
