// SPDX-License-Identifier: MIT

pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;

import "../interfaces/liquidity-mining/IBalancerToken.sol";
import "../solidity-utils/openzeppelin/ERC20.sol";

contract AQX is ERC20, IBalancerToken {
    constructor() ERC20("AQX (TEST)", "AQX (TEST)") {
        // _mint(msg.sender, 1000);
    }

    function mint(address to, uint256 amount) external override {}

    function getRoleMemberCount(bytes32 role) external view override returns (uint256) {
        return 1;
    }

    function getRoleMember(bytes32 role, uint256 index) external view override returns (address) {
        return address(0);
    }

    function hasRole(bytes32 role, address account) external view override returns (bool) {
        return true;
    }

    function getRoleAdmin(bytes32 role) external view override returns (bytes32) {
        return 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff;
    }

    function grantRole(bytes32 role, address account) external override {}

    function revokeRole(bytes32 role, address account) external override {}

    // solhint-disable-next-line func-name-mixedcase
    function DEFAULT_ADMIN_ROLE() external view override returns (bytes32) {
        return 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff;
    }

    // solhint-disable-next-line func-name-mixedcase
    function MINTER_ROLE() external view override returns (bytes32) {
        return 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff;
    }

    // solhint-disable-next-line func-name-mixedcase
    function SNAPSHOT_ROLE() external view override returns (bytes32) {
        return 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff;
    }

    function snapshot() external override {}
}
