// SPDX-License-Identifier: MIT

pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;

import "./ITestVault.sol";

contract TestJoin {
    ITestVault public vault;

    constructor(address _vault) {
        require(_vault != address(0), "0x0 _vault");

        vault = ITestVault(_vault);
    }

    // struct JoinPoolRequest {
    //     IAsset[] assets;
    //     uint256[] maxAmountsIn;
    //     bytes userData;
    //     bool fromInternalBalance;
    // }

    function joinVaultPool(
        bytes32 _poolId,
        IAsset[] memory _assets,
        uint256[] memory _maxAmountsIn,
        bytes memory _userData,
        address _sender,
        address _recipient
    ) external {
        JoinPoolRequest memory request = JoinPoolRequest({
            assets: _assets,
            maxAmountsIn: _maxAmountsIn,
            userData: _userData,
            fromInternalBalance: false
        });

        vault.joinPool(_poolId, _sender, _recipient, request);
    }
}
