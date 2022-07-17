// SPDX-License-Identifier: MIT

pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;

import "../solidity-utils/openzeppelin/ERC20.sol";

contract AQX is ERC20 {
    constructor() ERC20("AQX (TEST)", "AQX (TEST)") {
        _mint(msg.sender, 1000);
    }
}
