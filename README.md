Presale And Gambling Contract
=============================

This readme is about Presale and Gambling contracts, the introduction, how to use(deploy & test & verify) it.

# 1. Introduction
In this section, explain about methods in Presale and Gambling Contracts
## 1) Presale Contract
The presale contract, could be purchase the specialized token using USDT or ETH.

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
  Update USDT Price for Presale. Only owner call it. It should be multiplied by 10 ^ 18. e.x: 1 Base Token = 0.01 USDT = 10 ** 16
  ```solidity
  function updateUSDTSalePrice(uint256 usdtPrice) external onlyOwner
  ```

### 1.4 Update ETH Sale Price
  Update ETH Price for Presale. Only owner call it. It should be multiplied by 10 ^ 18. e.x: 1 Base Token = 0.002 ETH = 2 * 10 ** 15
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

### 1.9 Get USDT Amount For BaseToken Amount
  Get USDT Amount for baseToken on Presale, based on USDT Sale Price
  ```solidity
  function getUSDTSaleAmount(uint256 baseAmount) public view returns (uint256 usdtAmount)
  ```

### 1.10 Get ETH Amount For BaseToken Amount
  Get ETH Amount for baseToken on Presale, based on ETH Salle Price
  ```solidity
  function getETHSaleAmount(uint256 baseAmount) public view returns (uint256 ethAmount)
  ```

### 1.11 Purcahse Base Token With USDT
  Purchase Base Token Using USDT, Should approve the USDT before purchase
  ```solidity
  function purchaseTokenWithUSDT(uint256 baseAmount) external isContract isSale(baseAmount) 
  ```

### 1.12 Purcahse Base Token With ETH
  Purchase Base Token Using ETH, Should approve the ETH before purchase
  ```solidity
  function purchaseTokenWithETH(uint256 baseAmount) external isContract isSale(baseAmount) 
  ```

### 1.13 Withdraw ETH
  Withdraw ETH From Presale Contract, Only owner call it.
  ```solidity
  function withdrawETH() external onlyOwner
  ```

### 1.14 Withdraw USDT
  Withdraw USDT(ERC20) From Presale Contract, Only owner call it. erc20Token: Withdrawed Token Address, Here: USDT Address
  ```solidity
  function withdrawERC20(address erc20Token) external onlyOwner
  ```

## 2) Gambling Contract
The gambling contract, could be guess or not random number with users.

### 2.1 Update USDT Address
  Update USDT address on Gambling Contract. Only owner call it.
  ```solidity
  function updateUSDTTokenAddress(address usdtTokenAddress) external onlyOwner
  ```

### 2.2 Update Gambling Open Flag
  Update Gambling Status on Gambling Contract. Only owner call it.
  ```solidity
  function updateGamblingFlag(bool gamblingFlag) external onlyOwner
  ```

### 2.3 Update Game Amount
  Update Game Amount on Gambling Contract. Only owner call it. e.x: 100 (USDT or ETH) = 100 * 10 ^ 18
  ```solidity
  function updateGameAmount(uint256 gAmount) external onlyOwner
  ```

### 2.4 Update Gambling Method
  Update Gambling Payment Method on Gambling Contract. Only owner call it. e.x: 1: USDT, 2: ETH
  ```solidity
  function updateGamblingMethod(uint16 gMethod) external onlyOwner
  ```

### 2.5 Update Random Max Number
  Update Max Number for Random Guess on Gambling Contract. Only owner call it.
  ```solidity
  function updateRandomMaxNumber(uint256 maxNum) external onlyOwner {
  ```

### 2.6 Game With USDT
  Gambling Function With USDT, should approve game amount of USDT to Gambling Contract.
  And userNumber should be between 0 ~ randomMaxNumber - 1
  ```solidity
  function gamblingWithUSDT(uint256 userNumber) external isContract isGambling
  ```

### 2.7 Game With ETH
  Gambling Function With ETH, should approve game amount of ETH to Gambling Contract.
  And userNumber should be between 0 ~ randomMaxNumber - 1
  ```solidity
  function gamblingWithETH(uint256 userNumber) external payable isContract isGambling
  ```

### 2.8 Withdraw ETH
  Withdraw ETH From Gambling Contract, Only owner call it.
  ```solidity
  function withdrawETH() external onlyOwner
  ```

### 2.9 Withdraw USDT
  Withdraw USDT(ERC20) From Gambling Contract, Only owner call it. erc20Token: Withdrawed Token Address, Here: USDT Address
  ```solidity
  function withdrawERC20(address erc20Token) external onlyOwner
  ```

# 2. How to use
How to Use(Install & Test & Deploy & Verify) the contract

## 1) Environment
  ```sh
  DEPLOYING_METHOD=ROPSTEN // ROPSTEN or MAINNET
  ETHERSCAN_API_KEY=ABC123ABC123ABC123ABC123ABC123ABC1
  ROPSTEN_URL=https://eth-ropsten.alchemyapi.io/v2/<YOUR ALCHEMY KEY>
  PRIVATE_KEY=0xabc123abc123abc123abc123abc123abc123abc123abc123abc123abc123abc1
  ```

## 2) Install
  ```sh
  yarn
  ```

## 3) Test
  ```sh
  yarn test
  ```

## 4) Deploy
  ### Ropsten Deploy
    ```sh
    yarn deploy --network ropsten
    ```
  ### Mainnet Deploy
    ```sh
    yarn deploy --network mainnet
    ```

## 5) Verify
  ```sh
  npx hardhat verify --network ${network} ${Presale Contract Address}
  npx hardhat verify --network ${network} ${Gambling Contract Address}
  ```