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

## 2) Gambling Contract