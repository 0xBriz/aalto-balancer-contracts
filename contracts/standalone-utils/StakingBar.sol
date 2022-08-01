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

import "../solidity-utils/openzeppelin/Address.sol";
import "../interfaces/vault/IVault.sol";
import "../interfaces/solidity-utils/openzeppelin/IERC20.sol";
import "./IStakingBar.sol";
import "./SushiBarStaking.sol";

abstract contract StakingBar is SushiBarStaking {
    using Address for address payable;

    IStakingBar private immutable _fBeetsBar;

    constructor(IStakingBar fBeetsBar) {
        _fBeetsBar = fBeetsBar;
    }

    function fBeetsBarEnter(
        address sender,
        address recipient,
        uint256 amount,
        uint256 outputReference
    ) external payable {
        sushiBarEnter(
            _fBeetsBar,
            _fBeetsBar.vestingToken(),
            sender,
            recipient,
            amount,
            outputReference
        );
    }

    function fBeetsBarLeave(
        address sender,
        address recipient,
        uint256 amount,
        uint256 outputReference
    ) external payable {
        sushiBarLeave(
            _fBeetsBar,
            _fBeetsBar.vestingToken(),
            sender,
            recipient,
            amount,
            outputReference
        );
    }
}
