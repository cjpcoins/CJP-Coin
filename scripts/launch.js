import "dotenv/config";
import { ethers } from "ethers";
import fs from "fs";

async function main() {
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) throw new Error("PRIVATE_KEY missing from .env");

  const provider = new ethers.JsonRpcProvider(process.env.BSC_RPC_URL || "https://bsc-dataseed.binance.org/");
  const wallet = new ethers.Wallet(privateKey, provider);
  console.log("🚀 Starting Automated Launch Sequence...");
  console.log("👤 Wallet:", wallet.address);

  // 1. Connect to Contract
  const contractAddress = "0xA9B4a901400e959CF51a89Ed928e5aDb151bD395"; // The successfully deployed one
  const artifactPath = "./artifacts/contracts/CJPToken.sol/CockroachJantaParty.json";
  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
  const CJP = new ethers.Contract(contractAddress, artifact.abi, wallet);

  const decimals = 18n;
  const parseToken = (amount) => ethers.parseUnits(amount.toString(), decimals);

  // 2. Token Transfers (Distribution)
  console.log("\n📦 Starting Token Distribution...");
  
  const distributions = [
    { name: "Burn Reserve", address: "0x000000000000000000000000000000000000dEaD", amount: 100_000_000_000n },
    { name: "Marketing", address: "0x50A7e1668b55AB500845Ed21AF678dC0070c450d", amount: 150_000_000_000n },
    { name: "Team", address: "0x91887e6cE016fcBCFC9E353E95Df1394BEb490E7", amount: 100_000_000_000n },
    { name: "Community & Public", address: "0x68cD8F5Af701235a2EC7A374a3C048663C1548eD", amount: 400_000_000_000n }
  ];

  for (const dist of distributions) {
    console.log(`Sending ${dist.amount} CJP to ${dist.name} (${dist.address})...`);
    const tx = await CJP.transfer(dist.address, parseToken(dist.amount));
    await tx.wait();
    console.log(`✅ Transfer confirmed! Hash: ${tx.hash}`);
  }

  // 3. PancakeSwap Liquidity Pool
  console.log("\n🥞 Preparing PancakeSwap Liquidity Pool...");
  const routerAddress = "0x10ED43C718714eb63d5aA57B78B54704E256024E"; // Official PancakeSwap V2 Router
  
  const routerAbi = [
    "function addLiquidityETH(address token, uint amountTokenDesired, uint amountTokenMin, uint amountETHMin, address to, uint deadline) external payable returns (uint amountToken, uint amountETH, uint liquidity)"
  ];
  const Router = new ethers.Contract(routerAddress, routerAbi, wallet);

  // Approve Router to spend our tokens
  const liquidityAmount = 250_000_000_000n;
  console.log(`Approving PancakeSwap Router to spend ${liquidityAmount} CJP...`);
  const approveTx = await CJP.approve(routerAddress, parseToken(liquidityAmount));
  await approveTx.wait();
  console.log(`✅ Approval confirmed! Hash: ${approveTx.hash}`);

  // Calculate BNB to invest (Total Balance - 0.02 BNB for gas safety)
  const balance = await provider.getBalance(wallet.address);
  console.log(`Wallet BNB Balance: ${ethers.formatEther(balance)} BNB`);
  
  const gasBuffer = ethers.parseEther("0.015"); // Keep 0.015 BNB for gas
  if (balance <= gasBuffer) {
      throw new Error("Insufficient BNB to add liquidity and pay gas!");
  }
  
  const bnbToInvest = balance - gasBuffer;
  console.log(`Investing ${ethers.formatEther(bnbToInvest)} BNB into the Liquidity Pool...`);

  // Add Liquidity
  console.log("Adding Liquidity to PancakeSwap...");
  const deadline = Math.floor(Date.now() / 1000) + 60 * 10; // 10 minutes from now
  
  const addLiqTx = await Router.addLiquidityETH(
    contractAddress,
    parseToken(liquidityAmount),
    0, // amountTokenMin (0 because we don't care about slippage on initial create)
    0, // amountETHMin
    wallet.address, // LP tokens go to your wallet
    deadline,
    { value: bnbToInvest }
  );

  await addLiqTx.wait();
  console.log(`✅ Liquidity Pool Created Successfully! Hash: ${addLiqTx.hash}`);
  
  console.log("\n🎉 LAUNCH COMPLETE! YOUR COIN IS TRADING LIVE ON THE OPEN MARKET! 🎉");
}

main().catch((error) => {
  console.error("❌ LAUNCH FAILED:");
  console.error(error);
  process.exitCode = 1;
});
