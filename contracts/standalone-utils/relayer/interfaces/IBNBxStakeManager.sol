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

interface IBNBxStakeManager {
    struct BotDelegateRequest {
        uint256 startTime;
        uint256 endTime;
        uint256 amount;
    }

    struct BotUndelegateRequest {
        uint256 startTime;
        uint256 endTime;
        uint256 amount;
        uint256 amountInBnbX;
    }

    struct WithdrawalRequest {
        uint256 uuid;
        uint256 amountInBnbX;
        uint256 startTime;
    }

    function initialize(
        address _bnbX,
        address _admin,
        address _manager,
        address _tokenHub,
        address _bcDepositWallet,
        address _bot,
        uint256 _feeBps
    ) external;

    function deposit() external payable;

    function startDelegation() external payable returns (uint256 _uuid, uint256 _amount);

    function retryTransferOut(uint256 _uuid) external payable;

    function completeDelegation(uint256 _uuid) external;

    function addRestakingRewards(uint256 _id, uint256 _amount) external;

    function requestWithdraw(uint256 _amountInBnbX) external;

    function claimWithdraw(uint256 _idx) external;

    function startUndelegation() external returns (uint256 _uuid, uint256 _amount);

    function undelegationStarted(uint256 _uuid) external;

    function completeUndelegation(uint256 _uuid) external payable;

    function proposeNewManager(address _address) external;

    function acceptNewManager() external;

    function setBotRole(address _address) external;

    function revokeBotRole(address _address) external;

    function setBCDepositWallet(address _address) external;

    function setMinDelegateThreshold(uint256 _minDelegateThreshold) external;

    function setMinUndelegateThreshold(uint256 _minUndelegateThreshold) external;

    function setFeeBps(uint256 _feeBps) external;

    function getTotalPooledBnb() external view returns (uint256);

    function getContracts()
        external
        view
        returns (
            address _manager,
            address _bnbX,
            address _tokenHub,
            address _bcDepositWallet
        );

    function getTokenHubRelayFee() external view returns (uint256);

    function getBotDelegateRequest(uint256 _uuid) external view returns (BotDelegateRequest memory);

    function getBotUndelegateRequest(uint256 _uuid)
        external
        view
        returns (BotUndelegateRequest memory);

    function getUserWithdrawalRequests(address _address)
        external
        view
        returns (WithdrawalRequest[] memory);

    function getUserRequestStatus(address _user, uint256 _idx)
        external
        view
        returns (bool _isClaimable, uint256 _amount);

    function getBnbXWithdrawLimit() external view returns (uint256 _bnbXWithdrawLimit);

    function getExtraBnbInContract() external view returns (uint256 _extraBnb);

    function convertBnbToBnbX(uint256 _amount) external view returns (uint256);

    function convertBnbXToBnb(uint256 _amountInBnbX) external view returns (uint256);

    event Delegate(uint256 _uuid, uint256 _amount);
    event TransferOut(uint256 _amount);
    event RequestWithdraw(address indexed _account, uint256 _amountInBnbX);
    event ClaimWithdrawal(address indexed _account, uint256 _idx, uint256 _amount);
    event Undelegate(uint256 _uuid, uint256 _amount);
    event Redelegate(uint256 _rewardsId, uint256 _amount);
    event SetManager(address indexed _address);
    event ProposeManager(address indexed _address);
    event SetBotRole(address indexed _address);
    event RevokeBotRole(address indexed _address);
    event SetBCDepositWallet(address indexed _address);
    event SetMinDelegateThreshold(uint256 _minDelegateThreshold);
    event SetMinUndelegateThreshold(uint256 _minUndelegateThreshold);
    event SetFeeBps(uint256 _feeBps);
}
