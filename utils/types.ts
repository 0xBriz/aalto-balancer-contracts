import { BigNumber, Contract, ContractTransaction, ethers } from "ethers";

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

export enum GaugeType {
  LiquidityMiningCommittee,
  veBAL,
  Ethereum,
}

export enum PoolType {
  Weighted = "Weighted",
  Stable = "Stable",
  ComposableStable = "ComposableStable",
  LiquidityBootstrappingPool = "LiquidityBootstrappingPool",
}

export const JOIN_KIND_INIT = 0; // Can only be called once for most pools

export interface ExitPoolRequest {
  tokens: string[];
  minAmountsOut: BigNumber[];
  toInternalBalance: boolean;
}

export interface AccountWeb3 {
  wallet: ethers.Wallet;
  provider: ethers.providers.JsonRpcProvider;
  chainId: number;
  address: string;
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
  mint: (to: string, amount: BigNumber) => Promise<ContractTransaction>;
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

export interface BasePoolArgs {
  name: string;
  symbol: string;
  tokens: string[];
  swapFeePercentage: string;
  owner: string;
  assetManagers?: string[];
  // tokenInfo: TokenWithManagerInfo[];
}

export interface CreateWeightedPoolArgs extends BasePoolArgs {
  weights: string[];
  initialBalances?: string[];
}

export interface CreateBootstrapPoolArgs extends CreateWeightedPoolArgs {
  swapEnabledOnStart: boolean;
}

export interface CreateWeightedTwoTokensPoolArgs extends CreateWeightedPoolArgs {
  oracleEnabled: boolean;
}

export interface StablePoolCreationArgs extends BasePoolArgs {
  amplificationParameter: number;
}

export interface MetaStablePoolCreationArgs extends StablePoolCreationArgs {
  rateProviders: string[];
  priceRateCacheDuration: BigNumber[];
  oracleEnabled: boolean;
}

export interface RewardPoolArgs {
  stakedToken: string;
  rewardToken: string;
  rewardPerBlock: BigNumber;
  startBlock: number;
  bonusEndBlock: number;
  poolLimitPerUser: BigNumber;
  numberBlocksForUserLimit: number;
  admin: string;
}

export interface PoolTokenInfo {
  address: string;
  weight: string;
  initialBalance: string;
}

export interface AssetManagerCreationArgs {
  vault: string;
  tokenToManage: string;
  multisig: string;
}

export interface PoolCreationBaseData {
  poolId: string;
  poolAddress: string;
  txHash: string;
  date: string;
}

export interface PoolCreationConfig {
  created: boolean;
  isVePool?: boolean;
  txHash: string;
  chainId: number;
  name: string;
  symbol: string;
  type: PoolType;
  poolId: string;
  poolAddress: string;
  date: string;
  initialBalances: string[];
  assetManager: string;
  tokenInfo: PoolTokenInfo[];
  weights?: string[];
  amp?: string;
  deploymentArgs: {
    name: string;
    symbol: string;
    tokens: string[];
    owner: string;
    swapFeePercentage: string;
    assetManagers: string[];
    weights?: string[];
    amp?: string;
    // other things
  };
  gauge: {
    address: string;
    startingWeight: string;
    added: Boolean;
  };
}

export interface DeploymentData {
  name: string;
  contract: Contract;
  args: {};
}
