require("dotenv").config();
const { ethers } = require("hardhat");

async function main() {
  // Deploy Presale Contract
  const presaleContract = await ethers.getContractFactory("Presale");
  const presaleInstance = await presaleContract.deploy();
  await presaleInstance.deployed();
  console.log("Presale Contract Deployed: ", presaleInstance.address);

  // Deploy Gambling Contract
  const gamblingContract = await ethers.getContractFactory("Gambling");
  const gamblingInstance = await gamblingContract.deploy();
  await gamblingInstance.deployed();
  console.log("Gambling Contract Deployed: ", gamblingInstance.address);

  if (process.env.DEPLOYING_METHOD === "MAINNET") {
    // Set Mainnet USDT Address with Presale Contract
    await presaleInstance.updateUSDTTokenAddress(
      "0xdAC17F958D2ee523a2206206994597C13D831ec7"
    );

    // Set Mainnet USDT Address with Gambling Contract
    await gamblingInstance.updateUSDTTokenAddress(
      "0xdAC17F958D2ee523a2206206994597C13D831ec7"
    );
  } else if (process.env.DEPLOYING_METHOD === "ROPSTEN") {
    // Deploy USDT Contract
    const usdtContract = await ethers.getContractFactory("TetherToken");
    const usdtInstance = await usdtContract.deploy(
      "1000000000000000",
      "Tether USD",
      "USDT",
      6
    );
    await usdtInstance.deployed();
    console.log("USDT Contract Deployed: ", usdtInstance.address);

    // Set Mainnet USDT Address with Presale Contract
    await presaleInstance.updateUSDTTokenAddress(usdtInstance.address);

    // Set Mainnet USDT Address with Gambling Contract
    await gamblingInstance.updateUSDTTokenAddress(usdtInstance.address);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
