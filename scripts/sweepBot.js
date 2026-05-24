import { ethers } from "ethers";
import fs from "fs";
import "dotenv/config";

async function main() {
  const provider = new ethers.JsonRpcProvider("https://bsc-dataseed.binance.org/");
  const masterWallet = new ethers.Wallet(process.env.VOLUME_BOT_PRIVATE_KEY, provider);
  const botKeys = JSON.parse(fs.readFileSync("bot_wallets.json", "utf8"));
  const bot = new ethers.Wallet(botKeys[0], provider);

  const bal = await provider.getBalance(bot.address);
  console.log(`Bot 1 Balance: ${ethers.formatEther(bal)} BNB`);
  
  if (bal > ethers.parseEther("0.0005")) {
    const gasLimit = 21000n;
    const feeData = await provider.getFeeData();
    const gasPrice = feeData.gasPrice || ethers.parseUnits("3", "gwei");
    const cost = gasLimit * gasPrice;
    const sendAmount = bal - cost;
    
    console.log(`Sweeping ${ethers.formatEther(sendAmount)} BNB back to Master...`);
    const tx = await bot.sendTransaction({
      to: masterWallet.address,
      value: sendAmount,
      gasLimit,
      gasPrice
    });
    await tx.wait(1);
    console.log("Sweep complete!");
  } else {
    console.log("Nothing to sweep.");
  }
}
main().catch(console.error);
