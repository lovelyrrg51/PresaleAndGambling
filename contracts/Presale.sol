// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./SafeMath.sol";
import "./Ownable.sol";
import "./SafeERC20.sol";
import "./Address.sol";
import "./IERC20Metadata.sol";

/**
 * @dev ICO & Presale Contract with USDT & ETH
 */
contract Presale is Ownable {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    // Base Presale Token
    address public baseToken;
    // USDT Token
    address public usdtToken;
    // USDT Sale Price e.x: 1 Token = 10 USDT
    uint256 public usdtSalePrice;
    // ETH Sale Price e.x: 1 Token = 0.01 ETH
    uint256 public ethSalePrice;
    // Is Sale Open
    bool public isSaleOpen;
    // Min Sale Amount
    uint256 public minSaleAmount;
    // Max Sale Amount
    uint256 public maxSaleAmount;
    // Sale Method
    uint16 public saleMethod; // 0: Initialize, 1: USDT, 2: ETH

    event PurchaseUSDT(address indexed user, uint256 baseAmount, uint256 usdtAmount);
    event PurchaseETH(address indexed user, uint256 baseAmount, uint256 ethAmount);

    modifier isContract() {
        require(
            Address.isContract(_msgSender()) == false,
            "The caller should not be contract"
        );
        _;
    }

    modifier isSale(uint256 saleAmount) {
        require(isSaleOpen, "Presale is not open now");
        require(saleAmount >= minSaleAmount, "Sale amount should be more than minSaleAmount");
        require(saleAmount <= maxSaleAmount, "Sale amount should be less than maxSaleAmount");
        _;
    }

    constructor() {
        // Initialize Base Token
        baseToken = address(0);

        // Initialize USDT & ETH Price
        usdtSalePrice = 1e18;
        ethSalePrice = 1e18;
        isSaleOpen = false;

        minSaleAmount = maxSaleAmount = 1e18;
        saleMethod = 0;
    }

    /**======================== Admin Functions Start ========================*/
    /**
     * @dev Update Base Token Address, Only call from owner
     */
    function updateBaseTokenAddress(address baseTokenAddress) external onlyOwner {
        baseToken = baseTokenAddress;
    }

    /**
     * @dev Update USDT Token Address, Only call from owner
     */
    function updateUSDTTokenAddress(address usdtTokenAddress) external onlyOwner {
        usdtToken = usdtTokenAddress;
    }

    /**
     * @dev Update USDT Sale Price, Only call from owner, e.x: 0.01 USDT = 10 ** 16
     */
    function updateUSDTSalePrice(uint256 usdtPrice) external onlyOwner {
        usdtSalePrice = usdtPrice;
    }

    /**
     * @dev Update ETH Sale Price, Only call from owner, e.x: 0.001 ETH = 10 ** 15
     */
    function updateETHSalePrice(uint256 ethPrice) external onlyOwner {
        ethSalePrice = ethPrice;
    }

    /**
     * @dev Update Sale Open Flag, Only call from owner
     */
    function updateIsSaleFlag(bool saleStatus) external onlyOwner {
        isSaleOpen = saleStatus;
    }

    /**
     * @dev Update Min Sale Amount, Only call from owner
     */
    function updateMinSaleAmount(uint256 minSAmount) external onlyOwner {
        minSaleAmount = minSAmount;
    }

    /**
     * @dev Update Max Sale Amount, Only call from owner
     */
    function updateMaxSaleAmount(uint256 maxSAmount) external onlyOwner {
        maxSaleAmount = maxSAmount;
    }

    /**
     * @dev Update Sale Method, Only call from owner
     */
    function updateSaleMethod(uint16 sMethod) external onlyOwner {
        saleMethod = sMethod;
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

    /**======================== Presale Functions Start ========================*/
    /**
     * @dev Get USDT Sale Amount
     */
    function getUSDTSaleAmount(uint256 baseAmount) public view returns (uint256 usdtAmount) {
        usdtAmount = (usdtSalePrice * (10 ** IERC20Metadata(usdtToken).decimals()) / (10 ** 18)) * baseAmount / (10 ** IERC20Metadata(baseToken).decimals());
    }

    /**
     * @dev Get ETH Sale Amount
     */
    function getETHSaleAmount(uint256 baseAmount) public view returns (uint256 ethAmount) {
        ethAmount = ethSalePrice * baseAmount / (10 ** IERC20Metadata(baseToken).decimals());
    }

    /**
     * @dev Purchase Base Token Using USDT, Should approve the USDT before purchase
     */
    function purchaseTokenWithUSDT(uint256 baseAmount) external isContract isSale(baseAmount) {
        // Check Sale Method
        require(saleMethod == 1, "The purchase method should be using USDT");

        // Get Base Amount on Presale Contract
        uint256 totalBaseAmount = IERC20Metadata(baseToken).balanceOf(address(this));
        require(totalBaseAmount >= baseAmount, "The purchased amount should be less than total presale");

        // Get USDT Amount
        uint256 usdtAmount = getUSDTSaleAmount(baseAmount);
        
        // TransferFrom USDT to Presale Contract
        IERC20(usdtToken).safeTransferFrom(_msgSender(), address(this), usdtAmount);

        // Transfer Base Token to User
        IERC20(baseToken).safeTransfer(_msgSender(), baseAmount);

        emit PurchaseUSDT(_msgSender(), baseAmount, usdtAmount);
    }

    /**
     * @dev Purchase Base Token Using ETH
     */
    function purchaseTokenWithETH(uint256 baseAmount) external payable isContract isSale(baseAmount) {
        // Check Sale Method
        require(saleMethod == 2, "The purchase method should be using ETH");

        // Get Base Amount on Presale Contract
        uint256 totalBaseAmount = IERC20Metadata(baseToken).balanceOf(address(this));
        require(totalBaseAmount >= baseAmount, "The purchased amount should be less than total presale");

        // Get ETH Amount
        uint256 ethAmount = getETHSaleAmount(baseAmount);
        require(ethAmount <= msg.value, "ETH Amount should be less than msg value");

        // Transfer Base Token to User
        IERC20(baseToken).safeTransfer(_msgSender(), baseAmount);

        emit PurchaseETH(_msgSender(), baseAmount, ethAmount);
    }
    /**======================== Presale Functions End ========================*/
}