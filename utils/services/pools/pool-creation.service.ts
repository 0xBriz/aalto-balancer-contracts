// import { Inject, Injectable } from '@nestjs/common';
// import { BigNumber } from 'ethers';
// import { formatEther } from 'ethers/lib/utils';
// import { ADDRESSES } from 'src/data/addresses';
// import { CONTRACT_MAP } from 'src/data/contracts';
// import { doTransaction } from 'src/util/tx-utils';
// import {
//   getWeightedPoolCreationArgs,
//   savePoolCreationInfo,
// } from 'src/util/utils';
// import { ContractService } from './contracts';
// import { FactoryService } from './factories';
// import {
//   AccountWeb3,
//   CreateWeightedPoolArgs,
//   TokenWithManagerInfo,
// } from './types';
// import { Vault } from './vault';
// import { WEB3 } from './wallet';

// @Injectable()
// export class PoolCreationService {
//   constructor(
//     @Inject(WEB3) private account: AccountWeb3,
//     private contracts: ContractService,
//     private vault: Vault,
//     private factories: FactoryService,
//   ) {}

//   async createManagedWeightedPool(
//     name: string,
//     symbol: string,
//     swapFeePercentage: BigNumber,
//     owner: string,
//     tokenInfo: TokenWithManagerInfo[],
//   ) {
//     console.log('createManagedWeightedPool: starting pool creation');
//     // Use util to get the need pool creation args for the factory
//     const args: CreateWeightedPoolArgs = getWeightedPoolCreationArgs(
//       name,
//       symbol,
//       swapFeePercentage,
//       owner,
//       tokenInfo,
//     );

//     // Create the pool through the factory
//     const poolInfo = await this.factories.createManagedPool(args);

//     console.log('createManagedWeightedPool: pool creation complete');

//     // Fire off the init join so pool has initial liquidity
//     await this.vault.initPoolJoin(
//       poolInfo.poolId,
//       args.tokens,
//       args.initialBalances,
//       args.owner,
//     );

//     console.log('createManagedWeightedPool: adding pool to DexTokenManager');
//     // Set pool id for asset managers once pool is created
//     const assetManager = this.contracts.getDexTokenAssetManager();
//     await doTransaction(await assetManager.addPool(poolInfo.poolId));

//     console.log(
//       'createManagedWeightedPool: asset managers pool ids set complete',
//     );

//     const chainId = this.account.chainId;
//     const data = {
//       chainId,
//       name,
//       txHash: poolInfo.txHash,
//       poolId: poolInfo.poolId,
//       poolAddress: poolInfo.poolAddress,
//       date: poolInfo.date,
//       initialBalances: args.initialBalances.map((ib) => formatEther(ib)),
//       args: {
//         name,
//         symbol,
//         owner: args.owner,
//         swapFeePercentage: formatEther(args.swapFeePercentage),
//         weights: args.weights.map((w) => formatEther(w)),
//         assetManagers: args.assetManagers,
//       },
//       gauge: {
//         address: '',
//         weight: '',
//         added: false,
//       },
//       assetManagers: args.assetManagers.map((am, idx) => {
//         return {
//           address: am,
//           args: {
//             vault: CONTRACT_MAP.VAULT[chainId],
//             multisig: ADDRESSES.MULTISIG[chainId],
//             token: args.tokens[idx],
//           },
//         };
//       }),
//     };

//     console.log('createManagedWeightedPool: process complete');
//     console.log('createManagedWeightedPool: pool data is:');
//     // Logging in case of a file save/create issue
//     console.log(data);

//     // await savePoolCreationInfo(symbol.toLowerCase(), chainId, data);

//     return data;
//   }
// }
