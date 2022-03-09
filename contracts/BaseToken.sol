// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./ERC20.sol";
import "./Ownable.sol";

/**
 * @dev Base Token for Presale
 */
contract BaseToken is ERC20, Ownable {
    constructor() ERC20("Base Token", "BST") {
        _mint(_msgSender(), 1000000000000000000000000000);
    }
}