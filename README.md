Presale And Gambling Contract
=============================

This readme is about Presale and Gambling contracts, the introduction, how to use(deploy & test) it.

# 1. Introduction
In this section, explain about methods in Presale and Gambling Contracts
## 1) Presale Contract
The presale contract, could be purchase the specialized tokens using USDT or ETH.

### 1.1 Update Base Token Address
  Update base token address for presale. Only owner call it.
  ```solidity
  function updateBaseTokenAddress(address baseTokenAddress) external onlyOwner
  ```

### 1.2 Update USDT Address
  Update USDT address on Presale Contract. Only owner call it.
  ```solidity
  function updateUSDTTokenAddress(address usdtTokenAddress) external onlyOwner
  ```

### 1.3 Update USDT Sale Price
  Update USDT Price for Presale. Only owner call it. It should be multiplied by 10 ^ 18. e.x: 0.01 USDT = 10 ** 16
  ```solidity
  function updateUSDTSalePrice(uint256 usdtPrice) external onlyOwner
  ```

### 1.4 Update ETH Sale Price
  Update ETH Price for Presale. Only owner call it. It should be multiplied by 10 ^ 18. e.x: 0.002 ETH = 2 * 10 ** 15
  ```solidity
  function updateETHSalePrice(uint256 ethPrice) external onlyOwner
  ```

### 1.5 Update Sale Flag
  Update Sale Status for Presale. Only owner call it. e.x: 0: Not Open, 1: Open
  ```solidity
  function updateIsSaleFlag(bool saleStatus) external onlyOwner
  ```

### 1.6 Update Minimum Presale Amount
  Update Minimum Amount for Presale. Only owner call it. e.x: 100 Base Token = 10 ** 20
  ```solidity
  function updateMinSaleAmount(uint256 minSAmount) external onlyOwner
  ```

### 1.7 Update Maximum Presale Amount
  Update Maximum Amount for Presale. Only owner call it. e.x: 10000 Base Token = 10 * 22
  ```solidity
  function updateMaxSaleAmount(uint256 maxSAmount) external onlyOwner
  ```

### 1.8 Update Presale Method
  Update Payment Method for Presale. Only owner call it. e.x: 1: USDT, 2: ETH
  ```solidity
  function updateSaleMethod(uint16 sMethod) external onlyOwner
  ```

## 2) Gambling Contract