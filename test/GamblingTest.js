/* eslint-disable no-undef */
const { default: BigNumber } = require("bignumber.js");
const { assert } = require("chai");
const { artifacts, contract } = require("hardhat");
const { web3 } = require("hardhat");
const truffleAssert = require("truffle-assertions");

const Gambling = artifacts.require("Gambling");
const TetherToken = artifacts.require("TetherToken");

const { callMethod, getGasAmount } = require("./utils.js");

contract("Gambling Test", (accounts) => {
  const deployer = accounts[0];

  beforeEach(async () => {
    // Gambling Contract
    this.GamblingInstance = await Gambling.new({ from: deployer });
    // Gambling
    this.Gambling = await new web3.eth.Contract(
      this.GamblingInstance.abi,
      this.GamblingInstance.address
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

    // Update USDT Address to Gambling Contract
    await this.GamblingInstance.updateUSDTTokenAddress(
      this.TetherTokenInstance.address,
      { from: deployer }
    );
  });

  describe("Test - Initial Parameters", async () => {
    it("Check Initial Parameters", async () => {
      // Check USDT Address
      assert.equal(
        await callMethod(this.Gambling.methods.usdtToken, []),
        this.TetherTokenInstance.address
      );
    });

    it("Check Admin Functions", async () => {
      // Check Gambling Open Flag
      await this.GamblingInstance.updateGamblingFlag(true, { from: deployer });
      assert.equal(
        await callMethod(this.Gambling.methods.isGamblingOpen, []),
        true
      );

      // Check Game Amount
      await this.GamblingInstance.updateGameAmount("1000000000000000000000", {
        from: deployer,
      });
      assert.equal(
        await callMethod(this.Gambling.methods.gameAmount, []),
        "1000000000000000000000"
      );

      // Check Gambling Method
      await this.GamblingInstance.updateGamblingMethod(1, { from: deployer });
      assert.equal(
        await callMethod(this.Gambling.methods.gamblingMethod, []),
        1
      );

      // Check Max Number
      await this.GamblingInstance.updateRandomMaxNumber(1000, {
        from: deployer,
      });
      assert.equal(
        await callMethod(this.Gambling.methods.randomMaxNumber, []),
        1000
      );
    });
  });

  describe("Test - Gambling With USDT", async () => {
    beforeEach(async () => {
      // Update Gambling Method to USDT
      await this.GamblingInstance.updateGamblingMethod(1, { from: deployer });
      // Update Gambling Amount With USDT
      await this.GamblingInstance.updateGameAmount("1000000000", {
        from: deployer,
      });
    });

    it("Check Wrong Cases", async () => {
      // Check Gambling without Open Flag
      await truffleAssert.reverts(
        this.GamblingInstance.gamblingWithUSDT(30, { from: accounts[1] }),
        "Gambling is not open now"
      );

      // Update Gambling Open Flag
      await this.GamblingInstance.updateGamblingFlag(true, { from: deployer });
      // Check USDT Balance on Gambling Contract
      await truffleAssert.reverts(
        this.GamblingInstance.gamblingWithUSDT(30, { from: accounts[1] }),
        "Contract Balance should be more than game amount"
      );
    });

    it("Check Gambling With USDT", async () => {
      // Update Gambling Flag
      await this.GamblingInstance.updateGamblingFlag(true, { from: deployer });
      // Update Random Max Number
      await this.GamblingInstance.updateRandomMaxNumber(10000, {
        from: deployer,
      });

      // Transfer USDT to Test User
      await this.TetherTokenInstance.transfer(accounts[1], "100000000000", {
        from: deployer,
      });
      assert.equal(
        await callMethod(this.TetherToken.methods.balanceOf, [accounts[1]]),
        "100000000000"
      );
      // Transfer USDT to Gambling Contract
      await this.TetherTokenInstance.transfer(
        this.GamblingInstance.address,
        "100000000000",
        {
          from: deployer,
        }
      );
      assert.equal(
        await callMethod(this.TetherToken.methods.balanceOf, [
          this.GamblingInstance.address,
        ]),
        "100000000000"
      );

      // Approve USDT to Gambling Contract
      await this.TetherTokenInstance.approve(
        this.GamblingInstance.address,
        "1000000000",
        { from: accounts[1] }
      );

      // Get Old USDT Balance of User & Gambling Contract
      const oldUserUSDTBalaance = new BigNumber(
        await callMethod(this.TetherToken.methods.balanceOf, [accounts[1]])
      );
      const oldContractUSDTBalance = new BigNumber(
        await callMethod(this.TetherToken.methods.balanceOf, [
          this.GamblingInstance.address,
        ])
      );

      // Gambling With USDT
      const tx = await this.GamblingInstance.gamblingWithUSDT(619, {
        from: accounts[1],
      });
      if (tx.logs[0].args.winStatus === false) {
        // User Lose Game
        // Check User USDT Balance
        const newUserUSDTBalaance = new BigNumber(
          await callMethod(this.TetherToken.methods.balanceOf, [accounts[1]])
        );
        assert.equal(
          oldUserUSDTBalaance.minus(newUserUSDTBalaance).toFixed(),
          "1000000000"
        );

        // Check Contract USDT Balance
        const newContractUSDTBalance = new BigNumber(
          await callMethod(this.TetherToken.methods.balanceOf, [
            this.GamblingInstance.address,
          ])
        );
        assert.equal(
          newContractUSDTBalance.minus(oldContractUSDTBalance).toFixed(),
          "1000000000"
        );
      } else {
        // User Win Game
        // Check User USDT Balance
        const newUserUSDTBalaance = new BigNumber(
          await callMethod(this.TetherToken.methods.balanceOf, [accounts[1]])
        );
        assert.equal(
          newUserUSDTBalaance.minus(oldUserUSDTBalaance).toFixed(),
          "1000000000"
        );

        // Check Contract USDT Balance
        const newContractUSDTBalance = new BigNumber(
          await callMethod(this.TetherToken.methods.balanceOf, [
            this.GamblingInstance.address,
          ])
        );
        assert.equal(
          oldContractUSDTBalance.minus(newContractUSDTBalance).toFixed(),
          "1000000000"
        );
      }

      // Check USDT Withdraw
      const oldOwnerUSDTBalance = new BigNumber(
        await callMethod(this.TetherToken.methods.balanceOf, [deployer])
      );
      const contractUSDTBalance = new BigNumber(
        await callMethod(this.TetherToken.methods.balanceOf, [
          this.GamblingInstance.address,
        ])
      );
      await this.GamblingInstance.withdrawERC20(
        this.TetherTokenInstance.address,
        { from: deployer }
      );
      const newOwnerUSDTBalance = new BigNumber(
        await callMethod(this.TetherToken.methods.balanceOf, [deployer])
      );
      // Check Owner's USDT Balance
      assert.equal(
        newOwnerUSDTBalance.minus(oldOwnerUSDTBalance).toFixed(),
        contractUSDTBalance.toFixed()
      );
    });
  });

  describe("Test - Gambling With ETH", async () => {
    beforeEach(async () => {
      // Update Gambling Method to ETH
      await this.GamblingInstance.updateGamblingMethod(2, { from: deployer });
      // Update Gambling Amount With ETH
      await this.GamblingInstance.updateGameAmount("300000000000000000", {
        from: deployer,
      });
    });

    it("Check Wrong Cases", async () => {
      // Check Gambling without Open Flag
      await truffleAssert.reverts(
        this.GamblingInstance.gamblingWithETH(30, { from: accounts[1] }),
        "Gambling is not open now"
      );

      // Update Gambling Open Flag
      await this.GamblingInstance.updateGamblingFlag(true, { from: deployer });
      // Check USDT Balance on Gambling Contract
      await truffleAssert.reverts(
        this.GamblingInstance.gamblingWithETH(30, { from: accounts[1] }),
        "Contract Balance should be more than game amount"
      );
    });

    it("Check Gambling With ETH", async () => {
      // Update Gambling Flag
      await this.GamblingInstance.updateGamblingFlag(true, { from: deployer });
      // Update Random Max Number
      await this.GamblingInstance.updateRandomMaxNumber(1, {
        from: deployer,
      });

      // Transfer ETH to Gambling Contract
      await web3.eth.sendTransaction({
        from: deployer,
        to: this.GamblingInstance.address,
        value: "1000000000000000000",
      });
      assert.equal(
        await web3.eth.getBalance(this.GamblingInstance.address),
        "1000000000000000000"
      );

      // Get Old ETH Balance of User & Gambling Contract
      const oldUserETHBalaance = new BigNumber(
        await web3.eth.getBalance(accounts[1])
      );
      const oldContractETHBalance = new BigNumber(
        await web3.eth.getBalance(this.GamblingInstance.address)
      );

      // Gambling With ETH
      const tx = await this.GamblingInstance.gamblingWithETH(0, {
        from: accounts[1],
        value: "300000000000000000",
      });
      const gasAmount = getGasAmount(tx);

      if (tx.logs[0].args.winStatus === false) {
        // User Lose Game
        // Check User ETH Balance
        const newUserETHBalaance = new BigNumber(
          await web3.eth.getBalance(accounts[1])
        );
        assert.equal(
          oldUserETHBalaance
            .minus(gasAmount)
            .minus(newUserETHBalaance)
            .toFixed(),
          "300000000000000000"
        );

        // Check Contract ETH Balance
        const newContractETHBalance = new BigNumber(
          await web3.eth.getBalance(this.GamblingInstance.address)
        );
        assert.equal(
          newContractETHBalance.minus(oldContractETHBalance).toFixed(),
          "300000000000000000"
        );
      } else {
        // User Win Game
        // Check User ETH Balance
        const newUserETHBalaance = new BigNumber(
          await web3.eth.getBalance(accounts[1])
        );
        assert.equal(
          newUserETHBalaance
            .plus(gasAmount)
            .minus(oldUserETHBalaance)
            .toFixed(),
          "300000000000000000"
        );

        // Check Contract ETH Balance
        const newContractETHBalance = new BigNumber(
          await web3.eth.getBalance(this.GamblingInstance.address)
        );
        assert.equal(
          oldContractETHBalance.minus(newContractETHBalance).toFixed(),
          "300000000000000000"
        );
      }

      // Check ETH Withdraw
      const oldOwnerETHBalance = new BigNumber(
        await web3.eth.getBalance(deployer)
      );
      const contractETHBalance = new BigNumber(
        await web3.eth.getBalance(this.GamblingInstance.address)
      );
      const withdrawTx = await this.GamblingInstance.withdrawETH({
        from: deployer,
      });
      const withdrawGasAmount = getGasAmount(withdrawTx);

      const newOwnerETHBalance = new BigNumber(
        await web3.eth.getBalance(deployer)
      );
      // Check Owner's ETH Balance
      assert.equal(
        newOwnerETHBalance
          .minus(oldOwnerETHBalance)
          .plus(withdrawGasAmount)
          .toFixed(),
        contractETHBalance.toFixed()
      );
    });
  });
});
