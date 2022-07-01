// SPDX-License-Identifier: MIT

pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;

/**
 * @dev This is an empty interface used to represent either ERC20-conforming token contracts or ETH (using the zero
 * address sentinel value). We're just relying on the fact that `interface` can be used to declare new address-like
 * types.
 *
 * This concept is unrelated to a Pool's Asset Managers.
 */
interface IAsset {
    // solhint-disable-previous-line no-empty-blocks
}

struct JoinPoolRequest {
    IAsset[] assets;
    uint256[] maxAmountsIn;
    bytes userData;
    bool fromInternalBalance;
}

// Join method is up the Vault inheritance chain a bit so just copying function interface here
interface ITestVault {
    function joinPool(
        bytes32 poolId,
        address sender,
        address recipient,
        JoinPoolRequest memory request
    ) external payable;
}

contract TestJoin {
    function joinAmesBusdPool(
        ITestVault _vault,
        bytes32 _poolId,
        address _sender, // If the caller is not `sender`, it must be an authorized relayer for them
        address _recipient // Will receive the pool share tokens
    ) external {
        // AMES-BUSD
        // Tokens must be in address sorted order
        // IAsset[] memory tokens = [
        //     0xb9E05B4C168B56F73940980aE6EF366354357009,
        //     0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56
        // ];
        // // Amount of each token, in order
        // uint256 amountAmes = 100 * 10**18;
        // uint256 amountBUSD = 100 * 10**18;
        // // Max amount of each token, again, in order
        // uint256[] memory maxAmountsIn = [amountAmes, amountBUSD];
        // uint256 joinKind = 1;
        // uint256[] memory amountsIn = [amountAmes, amountBUSD];
        // // Join data for caller joing pool needs to be encoded
        // bytes memory userData = abi.encode(joinKind, amountsIn);
        // JoinPoolRequest memory request = JoinPoolRequest({
        //     assets: tokens,
        //     maxAmountsIn: maxAmountsIn,
        //     userData: userData,
        //     fromInternalBalance: false
        // });
        // _vault.joinPool(_poolId, _sender, _recipient, request);
    }
}
