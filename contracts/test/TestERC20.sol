// SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;

import "../solidity-utils/openzeppelin/ERC20.sol";

contract TestERC20 is ERC20("TESTERC20", "TESTERC20") {
    constructor(uint256 _initMint) {
        _mint(msg.sender, _initMint);
    }
}
