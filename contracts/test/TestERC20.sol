// SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;

import "../solidity-utils/openzeppelin/ERC20.sol";

contract TestERC20 is ERC20 {
    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _initMint
    ) ERC20(_name, _symbol) {
        _mint(msg.sender, _initMint);
    }
}
