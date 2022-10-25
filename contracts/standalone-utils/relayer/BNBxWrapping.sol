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

import "../IBaseRelayerLibrary.sol";

import "../../interfaces/solidity-utils/openzeppelin/IERC20.sol";
import "../../pool-linear/interfaces/IUnbuttonToken.sol";

/**
 * @title BNBxWrapping
 * @notice Allows users to wrap and unwrap BNBx
 * @dev All functions must be payable so they can be called from a multicall involving ETH
 */
abstract contract BNBxWrapping is IBaseRelayerLibrary {
    using Address for address payable;
    using SafeERC20 for IERC20;

    IUnbuttonToken private immutable _wBNBx;

    constructor(IUnbuttonToken wBNBx) {
        _wBNBx = wBNBx;
    }

    function wrapBNBx(
        address sender,
        address recipient,
        uint256 uAmount,
        uint256 outputReference
    ) external payable {
        if (_isChainedReference(uAmount)) {
            uAmount = _getChainedReferenceValue(uAmount);
        }

        // Get reference to underlying BNBx to be wrapped
        IERC20 bnbx = IERC20(_wBNBx.underlying());

        // The wrap caller is the implicit sender of tokens, so if the goal is for the tokens
        // to be sourced from outside the relayer, we must first pull them here.
        if (sender != address(this)) {
            require(sender == msg.sender, "Incorrect sender");
            _pullToken(sender, bnbx, uAmount);
        }

        bnbx.safeApprove(address(_wBNBx), uAmount);
        uint256 mintAmount = _wBNBx.depositFor(recipient, uAmount);

        if (_isChainedReference(outputReference)) {
            _setChainedReferenceValue(outputReference, mintAmount);
        }
    }

    function unwrapWBNBx(
        address sender,
        address recipient,
        uint256 amount,
        uint256 outputReference
    ) external payable {
        if (_isChainedReference(amount)) {
            amount = _getChainedReferenceValue(amount);
        }

        // The wrap caller is the implicit sender of tokens, so if the goal is for the tokens
        // to be sourced from outside the relayer, we must first them pull them here.
        if (sender != address(this)) {
            require(sender == msg.sender, "Incorrect sender");
            _pullToken(sender, _wBNBx, amount);
        }

        uint256 withdrawnUAmount = _wBNBx.burnTo(recipient, amount);

        if (_isChainedReference(outputReference)) {
            _setChainedReferenceValue(outputReference, withdrawnUAmount);
        }
    }
}
