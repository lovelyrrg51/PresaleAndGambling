/* eslint-disable no-undef */
const { default: BigNumber } = require("bignumber.js");
const { assert } = require("chai");
const { artifacts, contract } = require("hardhat");
const { web3 } = require("hardhat");
const truffleAssert = require("truffle-assertions");

const Presale = artifacts.require("Presale");
const TetherToken = artifacts.require("TetherToken");
const BaseToken = artifacts.require("BaseToken");

const { callMethod } = require("./utils.js");

contract("Presale Test", (accounts) => {
  const deployer = accounts[0];

  beforeEach(async () => {
    // Presale Contract
    this.PresaleInstance = await Presale.new({ from: deployer });
    // Presale
    this.Presale = await new web3.eth.Contract(
      this.PresaleInstance.abi,
      this.PresaleInstance.address
    );

    // USDT Contract
    this.TetherTokenInstance = await TetherToken.new(
      "1000000000000000",
      "Tether USD",
      "USDT",
      6,
      { from: deployer }
    );
    this.TetherToken = await new web3.eth.Contract(
      this.TetherTokenInstance.abi,
      this.TetherTokenInstance.address
    );

    // Base Token Contract
    this.BaseTokenInstance = await BaseToken.new({ from: deployer });
    this.BaseToken = await new web3.eth.Contract(
      this.BaseTokenInstance.abi,
      this.BaseTokenInstance.address
    );

    // Update Base Token Address
    await this.PresaleInstance.updateBaseTokenAddress(
      this.BaseTokenInstance.address,
      {
        from: deployer,
      }
    );
    // Update USDT Address to Presale Contract
    await this.PresaleInstance.updateUSDTTokenAddress(
      this.TetherTokenInstance.address,
      { from: deployer }
    );
  });

  describe("Test - Initial Parameters", async () => {
    it("Check Initial Parameters", async () => {
      // Check USDT Address
      assert.equal(
        await callMethod(this.Presale.methods.usdtToken, []),
        this.TetherTokenInstance.address
      );

      // Check BaseToken Address
      assert.equal(
        await callMethod(this.Presale.methods.baseToken, []),
        this.BaseTokenInstance.address
      );
    });

    it("Check Admin Functions", async () => {
      // Update USDT Sale Price e.x: 1 BaseToken = 0.2 USDT
      await this.PresaleInstance.updateUSDTSalePrice("200000000000000000", {
        from: deployer,
      });
      // Check USDT Sale Price
      assert.equal(
        await callMethod(this.Presale.methods.usdtSalePrice, []),
        "200000000000000000"
      );

      // Update ETH Sale Price e.x: 1 BaseToken = 0.002 ETH
      await this.PresaleInstance.updateETHSalePrice("2000000000000000", {
        from: deployer,
      });
      // Check ETH Sale Price
      assert.equal(
        await callMethod(this.Presale.methods.ethSalePrice, []),
        "2000000000000000"
      );

      // Update Sale Min Amount e.x: Min BaseToken Sale Amount: 1000 Base Token
      await this.PresaleInstance.updateMinSaleAmount("1000000000000000000000", {
        from: deployer,
      });
      // Check Min BaseToken Sale Amount
      assert.equal(
        await callMethod(this.Presale.methods.minSaleAmount, []),
        "1000000000000000000000"
      );

      // Update Sale Max Amount e.x: Max BaseToken Sale Amount: 10000 Base Token
      await this.PresaleInstance.updateMaxSaleAmount(
        "10000000000000000000000",
        {
          from: deployer,
        }
      );
      // Check Max BaseToken Sale Amount
      assert.equal(
        await callMethod(this.Presale.methods.maxSaleAmount, []),
        "10000000000000000000000"
      );

      // Update Sale Flag
      await this.PresaleInstance.updateIsSaleFlag(true, { from: deployer });
      // Check Sale Flag
      assert.equal(await callMethod(this.Presale.methods.isSaleOpen, []), true);

      // Update Sale Method, e.x: 1: USDT, 2: ETH
      await this.PresaleInstance.updateSaleMethod(1, { from: deployer });
      // Check Sale Method
      assert.equal(await callMethod(this.Presale.methods.saleMethod, []), 1);
    });
  });

  describe("Test - Presale With USDT", async () => {
    beforeEach(async () => {
      // Update Sale Method to USDT
      await this.PresaleInstance.updateSaleMethod(1, { from: deployer });
      // Update USDT Sale Price e.x: 1 BaseToken = 0.2 USDT
      await this.PresaleInstance.updateUSDTSalePrice("200000000000000000", {
        from: deployer,
      });
    });

    it("Check Wrong Cases", async () => {
      // Check Presale without Open Flag
      await truffleAssert.reverts(
        this.PresaleInstance.purchaseTokenWithUSDT(1000, { from: accounts[1] }),
        "Presale is not open now"
      );

      // Update Presale Open Flag
      await this.PresaleInstance.updateIsSaleFlag(true, { from: deployer });
      // Update Min & Max Sale Amount
      await this.PresaleInstance.updateMinSaleAmount("1000000000000000000000", {
        from: deployer,
      });
      await this.PresaleInstance.updateMaxSaleAmount(
        "100000000000000000000000",
        {
          from: deployer,
        }
      );

      // Check Presale without range amount
      await truffleAssert.reverts(
        this.PresaleInstance.purchaseTokenWithUSDT("100000000000000000000", {
          from: accounts[1],
        }),
        "Sale amount should be more than minSaleAmount"
      );
      await truffleAssert.reverts(
        this.PresaleInstance.purchaseTokenWithUSDT("200000000000000000000000", {
          from: accounts[1],
        }),
        "Sale amount should be less than maxSaleAmount"
      );

      // Check Presale Over Maximum
      await truffleAssert.reverts(
        this.PresaleInstance.purchaseTokenWithUSDT("2000000000000000000000", {
          from: accounts[1],
        }),
        "The purchased amount should be less than total presale"
      );
    });

    it("Check Presale With USDT", async () => {
      // Update Presale Open Flag
      await this.PresaleInstance.updateIsSaleFlag(true, { from: deployer });
      await this.PresaleInstance.updateMinSaleAmount("1000000000000000000000", {
        from: deployer,
      });
      await this.PresaleInstance.updateMaxSaleAmount(
        "100000000000000000000000",
        {
          from: deployer,
        }
      );

      // Transfer Base Token to Presale Contract
      await this.BaseTokenInstance.transfer(
        this.PresaleInstance.address,
        "10000000000000000000000000",
        { from: deployer }
      );
      assert.equal(
        await callMethod(this.BaseToken.methods.balanceOf, [
          this.PresaleInstance.address,
        ]),
        "10000000000000000000000000"
      );

      // Transfer USDT Token to Test User
      await this.TetherTokenInstance.transfer(accounts[1], "100000000000", {
        from: deployer,
      });
      assert.equal(
        await callMethod(this.TetherToken.methods.balanceOf, [accounts[1]]),
        "100000000000"
      );

      // Check USDT Sale Amount
      assert.equal(
        await callMethod(this.Presale.methods.getUSDTSaleAmount, [
          "2000000000000000000000",
        ]),
        "400000000"
      );

      // Approve USDT to Presale Contract
      await this.TetherTokenInstance.approve(
        this.PresaleInstance.address,
        "400000000",
        { from: accounts[1] }
      );
      // Purchase Base Token
      await this.PresaleInstance.purchaseTokenWithUSDT(
        "2000000000000000000000",
        { from: accounts[1] }
      );

      // Check User Base Token Balance
      assert.equal(
        await callMethod(this.BaseToken.methods.balanceOf, [accounts[1]]),
        "2000000000000000000000"
      );
      // Check Presale Contract's USDT Balance
      assert.equal(
        await callMethod(this.TetherToken.methods.balanceOf, [
          this.PresaleInstance.address,
        ]),
        "400000000"
      );
      // Check Presale Contract's Base Token Balance
      assert.equal(
        await callMethod(this.BaseToken.methods.balanceOf, [
          this.PresaleInstance.address,
        ]),
        new BigNumber("10000000000000000000000000")
          .minus(new BigNumber("2000000000000000000000"))
          .toFixed()
      );

      // Check USDT Withdraw
      const oldOwnerUSDTBalance = new BigNumber(
        await callMethod(this.TetherToken.methods.balanceOf, [deployer])
      );
      await this.PresaleInstance.withdrawERC20(
        this.TetherTokenInstance.address,
        { from: deployer }
      );
      const newOwnerUSDTBalance = new BigNumber(
        await callMethod(this.TetherToken.methods.balanceOf, [deployer])
      );
      // Check Owner's USDT Balance
      assert.equal(
        newOwnerUSDTBalance.minus(oldOwnerUSDTBalance).toFixed(),
        "400000000"
      );
    });
  });

  describe("Test - Presale With ETH", async () => {
    beforeEach(async () => {
      // Update Sale Method to ETH
      await this.PresaleInstance.updateSaleMethod(2, { from: deployer });
      // Update ETH Sale Price e.x: 1 BaseToken = 0.001 ETH
      await this.PresaleInstance.updateETHSalePrice("1000000000000000", {
        from: deployer,
      });
    });

    it("Check Wrong Cases", async () => {
      // Check Presale without Open Flag
      await truffleAssert.reverts(
        this.PresaleInstance.purchaseTokenWithETH(1000, { from: accounts[1] }),
        "Presale is not open now"
      );

      // Update Presale Open Flag
      await this.PresaleInstance.updateIsSaleFlag(true, { from: deployer });
      // Update Min & Max Sale Amount
      await this.PresaleInstance.updateMinSaleAmount("1000000000000000000000", {
        from: deployer,
      });
      await this.PresaleInstance.updateMaxSaleAmount(
        "100000000000000000000000",
        {
          from: deployer,
        }
      );

      // Check Presale without range amount
      await truffleAssert.reverts(
        this.PresaleInstance.purchaseTokenWithETH("100000000000000000000", {
          from: accounts[1],
        }),
        "Sale amount should be more than minSaleAmount"
      );
      await truffleAssert.reverts(
        this.PresaleInstance.purchaseTokenWithETH("200000000000000000000000", {
          from: accounts[1],
        }),
        "Sale amount should be less than maxSaleAmount"
      );

      // Check Presale Over Maximum
      await truffleAssert.reverts(
        this.PresaleInstance.purchaseTokenWithETH("2000000000000000000000", {
          from: accounts[1],
        }),
        "The purchased amount should be less than total presale"
      );
    });

    it("Check Presale With ETH", async () => {
      // Update Presale Open Flag
      await this.PresaleInstance.updateIsSaleFlag(true, { from: deployer });
      // Update Min Sale Amount: 1000 Base Token
      await this.PresaleInstance.updateMinSaleAmount("1000000000000000000000", {
        from: deployer,
      });
      // Update Max Sale Amount: 100000 Base Token
      await this.PresaleInstance.updateMaxSaleAmount(
        "100000000000000000000000",
        {
          from: deployer,
        }
      );

      // Transfer Base Token to Presale Contract
      await this.BaseTokenInstance.transfer(
        this.PresaleInstance.address,
        "10000000000000000000000000",
        { from: deployer }
      );
      assert.equal(
        await callMethod(this.BaseToken.methods.balanceOf, [
          this.PresaleInstance.address,
        ]),
        "10000000000000000000000000"
      );

      // Check ETH Sale Amount, e.x: 2000 Base Token = 2 ETH
      assert.equal(
        await callMethod(this.Presale.methods.getETHSaleAmount, [
          "2000000000000000000000",
        ]),
        "2000000000000000000"
      );

      // Purchase Base Token
      await this.PresaleInstance.purchaseTokenWithETH(
        "2000000000000000000000",
        { from: accounts[1], value: "2000000000000000000" }
      );

      // Check User Base Token Balance
      assert.equal(
        await callMethod(this.BaseToken.methods.balanceOf, [accounts[1]]),
        "2000000000000000000000"
      );
      // Check Presale Contract's ETH Balance
      assert.equal(
        await web3.eth.getBalance(this.PresaleInstance.address),
        "2000000000000000000"
      );
      // Check Presale Contract's Base Token Balance
      assert.equal(
        await callMethod(this.BaseToken.methods.balanceOf, [
          this.PresaleInstance.address,
        ]),
        new BigNumber("10000000000000000000000000")
          .minus(new BigNumber("2000000000000000000000"))
          .toFixed()
      );

      // Check ETH Withdraw
      const oldOwnerETHBalance = new BigNumber(
        await web3.eth.getBalance(deployer)
      );
      const tx = await this.PresaleInstance.withdrawETH({
        from: deployer,
      });
      const gasPrice = new BigNumber(
        new BigNumber(tx.receipt.effectiveGasPrice).toFixed()
      );
      const gasAmount = gasPrice
        .multipliedBy(new BigNumber(tx.receipt.gasUsed))
        .toFixed();

      const newOwnerETHTBalance = new BigNumber(
        await web3.eth.getBalance(deployer)
      );
      // Check Owner's USDT Balance
      assert.equal(
        newOwnerETHTBalance.plus(gasAmount).minus(oldOwnerETHBalance).toFixed(),
        "2000000000000000000"
      );
    });
  });
});
