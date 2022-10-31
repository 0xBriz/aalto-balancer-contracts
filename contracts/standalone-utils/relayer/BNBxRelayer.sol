// SPDX-License-Identifier: GPL-3.0-or-later
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;

import "../../interfaces/vault/IVault.sol";
import "../../solidity-utils/openzeppelin/Address.sol";
import "../../solidity-utils/openzeppelin/SafeERC20.sol";
import "../../interfaces/solidity-utils/openzeppelin/IERC20.sol";
import "../../solidity-utils/openzeppelin/ReentrancyGuard.sol";
import "../../solidity-utils/openzeppelin/SafeMath.sol";

import "../IBaseRelayerLibrary.sol";
import "../RelayerAssetHelpers.sol";

import "../../pool-linear/interfaces/IUnbuttonToken.sol";
import "./interfaces/IBNBxStakeManager.sol";

/**
 * @title BNBxWrapping
 * @notice Allows users to wrap and unwrap BNBx
 * @dev All functions must be payable so they can be called from a multicall involving ETH(BNB)
 */
abstract contract BNBxRelayer is RelayerAssetHelpers, ReentrancyGuard {
    using Address for address payable;
    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    IERC20 private _BNBx;
    IUnbuttonToken private _wBNBx;
    IBNBxStakeManager private _stakingManger;

    constructor(
        IVault vault,
        IUnbuttonToken wBNBx,
        IBNBxStakeManager stakingManager
    ) RelayerAssetHelpers(vault) {
        _wBNBx = wBNBx;
        _BNBx = IERC20(_wBNBx.underlying());
        _stakingManger = stakingManager;
    }

    function getBNBx() external view returns (address) {
        return address(_BNBx);
    }

    function getWrappedBNBx() external view returns (address) {
        return address(_wBNBx);
    }

    function swap(
        IVault.SingleSwap memory singleSwap,
        IVault.FundManagement memory funds,
        uint256 limit,
        uint256 deadline
    ) external payable nonReentrant returns (uint256 swapAmount) {
        require(funds.sender == msg.sender, "Invalid sender");
        // Cache recipient as we sometimes overwrite this
        address recipient = funds.recipient;

        if (singleSwap.assetIn == IAsset(address(_wBNBx))) {
            // If wstETH is an input then we want to send it from the relayer
            // as we wrap it there.
            funds.sender = address(this);
            require(!funds.fromInternalBalance, "Cannot send from internal balance");

            // For GIVEN_IN swaps we can pull the exact amount necessary
            // otherwise we need to pull the full limit to allow for slippage
            uint256 wstETHAmount = singleSwap.kind == IVault.SwapKind.GIVEN_IN
                ? singleSwap.amount
                : limit;
            _pullBNBxAndWrap(msg.sender, wstETHAmount);
            _approveToken(IERC20(address(_wBNBx)), address(getVault()), wstETHAmount);

            swapAmount = getVault().swap{value: msg.value}(singleSwap, funds, limit, deadline);

            if (singleSwap.kind == IVault.SwapKind.GIVEN_OUT) {
                // GIVEN_OUT trades can leave an unknown amount of wstETH
                // We then must refund the full relayer balance
                _unwrapAndPushBNBx(msg.sender, IERC20(address(_wBNBx)).balanceOf(address(this)));
            }
        } else if (singleSwap.assetOut == IAsset(address(_wBNBx))) {
            // If wstETH is an output then we want to receive it on the relayer
            // so we can unwrap it before forwarding stETH to the user
            funds.recipient = payable(address(this));
            require(!funds.toInternalBalance, "Cannot send to internal balance");

            swapAmount = getVault().swap{value: msg.value}(singleSwap, funds, limit, deadline);

            // Unwrap the wstETH and forward onto the recipient
            _unwrapAndPushBNBx(recipient, IERC20(address(_wBNBx)).balanceOf(address(this)));
        } else {
            revert("Does not require wstETH");
        }

        _sweepETH();
    }

    /**
     * @dev This function assumes that if BNBx is an input then it is the only input (and similarly for outputs)
     *      Attempting to use multiple inputs of which one is BNBx will result in a revert.
     *      Attempting to use multiple outputs of which one is BNBx will result in loss of funds.
     */
    function batchSwap(
        IVault.SwapKind kind,
        IVault.BatchSwapStep[] calldata swaps,
        IAsset[] calldata assets,
        IVault.FundManagement memory funds,
        int256[] calldata limits,
        uint256 deadline
    ) external payable nonReentrant returns (int256[] memory swapAmounts) {
        require(funds.sender == msg.sender, "Invalid sender");
        // Cache recipient as we sometimes overwrite this
        address recipient = funds.recipient;

        // Find the index of wBNBx in the assets array
        uint256 wBNBxIndex;
        for (uint256 i; i < assets.length; i++) {
            if (assets[i] == IAsset(address(_wBNBx))) {
                wBNBxIndex = i;
                break;
            }
            require(i < assets.length - 1, "Does not require wstETH");
        }

        int256 wBNBxLimit = limits[wBNBxIndex];
        if (wBNBxLimit > 0) {
            // If wBNBx is being used as input then we want to send it from the relayer
            // as we wrap it there.
            funds.sender = address(this);
            require(!funds.fromInternalBalance, "Cannot send from internal balance");

            _pullBNBxAndWrap(msg.sender, uint256(wBNBxLimit));
            _approveToken(IERC20(address(_wBNBx)), address(getVault()), uint256(wBNBxLimit));

            swapAmounts = getVault().batchSwap{value: msg.value}(
                kind,
                swaps,
                assets,
                funds,
                limits,
                deadline
            );

            // GIVEN_OUT trades and certains choices of limits can leave an unknown amount of wBNBx
            // We then must refund the full relayer balance
            _unwrapAndPushBNBx(msg.sender, IERC20(address(_wBNBx)).balanceOf(address(this)));
        } else {
            // If wBNBx is being used as output then we want to receive it on the relayer
            // so we can unwrap it before forwarding BNBx to the user
            funds.recipient = payable(address(this));
            require(!funds.toInternalBalance, "Cannot send to internal balance");

            swapAmounts = getVault().batchSwap{value: msg.value}(
                kind,
                swaps,
                assets,
                funds,
                limits,
                deadline
            );

            // Unwrap the wBNBx and forward onto the recipient
            _unwrapAndPushBNBx(recipient, IERC20(address(_wBNBx)).balanceOf(address(this)));
        }

        _sweepETH();
    }

    /**
     * @dev This function will wrap enough BNBx to satisfy the maximum amount which may be used.
     *      Certain join types (e.g. TOKEN_IN_FOR_EXACT_BPT_OUT) may result in a residual
     *      amount of wBNBx being left on the sender's address.
     */
    function joinPool(
        bytes32 poolId,
        address sender,
        address recipient,
        IVault.JoinPoolRequest calldata request
    ) external payable nonReentrant {
        require(sender == msg.sender, "Invalid sender");

        // Pull in BNBx, wrap and return to user
        uint256 wBNBxAmount;
        for (uint256 i; i < request.assets.length; i++) {
            if (request.assets[i] == IAsset(address(_wBNBx))) {
                wBNBxAmount = request.maxAmountsIn[i];
                break;
            }
            require(i < request.assets.length - 1, "Does not require wBNBx");
        }
        _pullBNBxAndWrap(sender, wBNBxAmount);
        // Send wBNBx to the sender, as they will be the sender of the join
        IERC20(address(_wBNBx)).safeTransfer(sender, wBNBxAmount);

        getVault().joinPool{value: msg.value}(poolId, sender, recipient, request);
        _sweepETH();
    }

    function exitPool(
        bytes32 poolId,
        address sender,
        address payable recipient,
        IVault.ExitPoolRequest calldata request
    ) external nonReentrant {
        require(sender == msg.sender, "Invalid sender");

        uint256 wBNBxBalanceBefore = IERC20(address(_wBNBx)).balanceOf(recipient);

        getVault().exitPool(poolId, sender, recipient, request);

        uint256 wBNBxBalanceAfter = IERC20(address(_wBNBx)).balanceOf(recipient);

        // Pull in wBNBx, unwrap and return to user
        uint256 wBNBxAmount = wBNBxBalanceAfter.sub(wBNBxBalanceBefore);
        _pullToken(recipient, IERC20(address(_wBNBx)), wBNBxAmount);
        _unwrapAndPushBNBx(recipient, wBNBxAmount);
    }

    function _pullBNBxAndWrap(address sender, uint256 wBNBxAmount) private returns (uint256) {
        if (wBNBxAmount == 0) return 0;

        // Get current amount of BNBx necessary for wBNBx used by a swap
        // We add 1 extra wei to account for rounding errors when ensuring we have enough tokens to wrap
        uint256 BNBxAmount = _wBNBx.wrapperToUnderlying(wBNBxAmount) + 1;

        // wrap BNBx into wBNBx
        _pullToken(sender, _BNBx, BNBxAmount);
        _approveToken(_BNBx, address(_wBNBx), BNBxAmount);

        return _wBNBx.depositFor(sender, BNBxAmount);
    }

    function _unwrapAndPushBNBx(address recipient, uint256 wBNBxAmount) private {
        if (wBNBxAmount == 0) return;
        uint256 BNBxAmount = _wBNBx.withdraw(wBNBxAmount);
        _BNBx.safeTransfer(recipient, BNBxAmount);
    }
}
