// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./SafeMath.sol";
import "./Ownable.sol";
import "./SafeERC20.sol";
import "./Address.sol";
import "./IERC20Metadata.sol";

/**
 * @dev Gamgbling Contract with USDT & ETH
 */
contract Gambling is Ownable {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    // USDT Token
    address public usdtToken;
    // Is Gambling Open
    bool public isGamblingOpen;
    // Game Amount
    uint256 public gameAmount;
    // Gambling Method
    uint16 public gamblingMethod; // 0: Initialize, 1: USDT, 2: ETH
    // Game ID
    uint256 public gameId;
    // Random Max Number
    uint256 public randomMaxNumber;

    event GamblingUSDT(address indexed user, uint256 gameId, uint256 gameAmount, uint256 userNum, uint256 randomNum, bool winStatus);
    event GamblingETH(address indexed user, uint256 gameId, uint256 gameAmount, uint256 userNum, uint256 randomNum, bool winStatus);

    modifier isContract() {
        require(
            Address.isContract(_msgSender()) == false,
            "The caller should not be contract"
        );
        _;
    }

    modifier isGambling() {
        require(isGamblingOpen, "Gambling is not open now");
        _;
    }

    constructor() {
        // Initialize the variables
        isGamblingOpen = false;
        gameAmount = 0;
        gamblingMethod = 0;
        randomMaxNumber = 100;
    }

    receive() external payable {}
    /**======================== Admin Functions Start ========================*/
    /**
     * @dev Update USDT Token Address, Only call from owner
     */
    function updateUSDTTokenAddress(address usdtTokenAddress) external onlyOwner {
        usdtToken = usdtTokenAddress;
    }

    /**
     * @dev Update Gambling Open Flag, Only call from owner
     */
    function updateGamblingFlag(bool gamblingFlag) external onlyOwner {
        isGamblingOpen = gamblingFlag;
    }

    /**
     * @dev Update Game Amount, Only call from owner
     */
    function updateGameAmount(uint256 gAmount) external onlyOwner {
        gameAmount = gAmount;
    }

    /**
     * @dev Update Gambling Method, Only call from owner, 1: USDT, 2: ETH
     */
    function updateGamblingMethod(uint16 gMethod) external onlyOwner {
        gamblingMethod = gMethod;
    }

    /**
     * @dev Update Max Number Limit, Only call from owner
     */
    function updateRandomMaxNumber(uint256 maxNum) external onlyOwner {
        randomMaxNumber = maxNum;
    }

    /**
     * @dev Withdraw ETH, Only call from owner
     */
    function withdrawETH() external onlyOwner {
        address ownerAddress = _msgSender();
        uint256 amount = address(this).balance;

        (bool success, ) = ownerAddress.call{value: amount}("");
        require(success, "Transfer failed.");
    }

    /**
     * @dev Withdraw ERC20, Only call from owner
     */
    function withdrawERC20(address erc20Token) external onlyOwner {
        address ownerAddress = _msgSender();
        uint256 tokenAmount = IERC20Metadata(erc20Token).balanceOf(address(this));

        if (tokenAmount > 0) {
            IERC20(erc20Token).safeTransfer(ownerAddress, tokenAmount);
        }
    }
    /**======================== Admin Functions End ========================*/

    /**======================== Gambling Functions Start ========================*/
    /**
     * @dev Returns a pseudo-random integer between 0 ~ max - 1
     */
    function randomIntInRange(uint256 seed, uint256 max) internal view returns (uint256) {
        return uint256(keccak256(abi.encodePacked(
            tx.origin,
            blockhash(block.number - 1),
            block.timestamp,
            seed
        ))) % max;
    }

    /**
     * @dev Gambling Function With USDT, should approve game amount of USDT to Gambling Contract
     * And userNumber should be between 0 ~ randomMaxNumber - 1
     */
    function gamblingWithUSDT(uint256 userNumber) external isContract isGambling {
        // Check Gambling Method
        require(gamblingMethod == 1, "The gambling method should be using USDT");

        // Check Contract USDT Balance
        uint256 usdtBalance = IERC20Metadata(usdtToken).balanceOf(address(this));
        require(usdtBalance >= gameAmount, "Contract Balance should be more than game amount");

        // TransferFrom USDT to Gambling Contract
        IERC20(usdtToken).safeTransferFrom(_msgSender(), address(this), gameAmount);

        // Get Randon Number
        uint256 randomNumber = randomIntInRange(gameId, randomMaxNumber);

        if (randomNumber == userNumber) { // User Win
            // Transfer double game amount to User
            IERC20(usdtToken).safeTransfer(_msgSender(), gameAmount * 2);

            emit GamblingUSDT(_msgSender(), gameId, gameAmount, userNumber, randomNumber, true);
        } else {
            emit GamblingUSDT(_msgSender(), gameId, gameAmount, userNumber, randomNumber, false);
        }

        gameId += 1;
    }

    /**
     * @dev Gambling Function With ETH, should transfer amount of ETH to gambling contract
     * And userNumber should be between 0 ~ randomMaxNumber - 1
     */
    function gamblingWithETH(uint256 userNumber) external payable isContract isGambling {
        address userAddress = _msgSender();

        // Check Gambling Method
        require(gamblingMethod == 2, "The gambling method should be using ETH");
        // Check Contract ETH Balance        
        require(address(this).balance >= gameAmount, "Contract Balance should be more than game amount");
        // Check Transferred ETH Amount
        require(msg.value >= gameAmount, "Transferred ETH amount should be more than game amount");

        // Get Randon Number
        uint256 randomNumber = randomIntInRange(gameId, randomMaxNumber);

        if (randomNumber == userNumber) { // User Win
            // Transfer double game amount to User
            (bool success, ) = userAddress.call{value: gameAmount * 2}("");
            require(success, "Transfer failed.");

            emit GamblingUSDT(_msgSender(), gameId, gameAmount, userNumber, randomNumber, true);
        } else {
            emit GamblingUSDT(_msgSender(), gameId, gameAmount, userNumber, randomNumber, false);
        }

        gameId += 1;
    }
    /**======================== Gambling Functions Start ========================*/    
}