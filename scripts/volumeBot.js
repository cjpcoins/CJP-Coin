import { ethers } from "ethers";
import fs from "fs";
import "dotenv/config";

// --- SMART COST-SAVING CONFIGURATION ---
const NUM_BOTS = 10; // Testing with 10 bots to stretch the remaining BNB
const FUND_AMOUNT_BNB = "0.0003"; // Amount of BNB to send to bot (~$0.18)
const MIN_SLEEP_MINUTES = 5; // Human-like trading frequency
const MAX_SLEEP_MINUTES = 15;

const PANCAKESWAP_ROUTER = "0x10ED43C718714eb63d5aA57B78B54704E256024E";
const WBNB_ADDRESS = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";
const CJP_TOKEN = "0xA9B4a901400e959CF51a89Ed928e5aDb151bD395";

const ROUTER_ABI = [
  "function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)",
  "function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)"
];

const ERC20_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function balanceOf(address account) external view returns (uint256)",
  "function allowance(address owner, address spender) external view returns (uint256)"
];

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function main() {
  console.log("=========================================");
  console.log("   CJP SMART VOLUME BOT INITIALIZING     ");
  console.log("=========================================\n");

  const provider = new ethers.JsonRpcProvider(process.env.BSC_RPC_URL || "https://bsc-dataseed.binance.org/");
  
  if (!process.env.VOLUME_BOT_PRIVATE_KEY) {
    console.error("Error: VOLUME_BOT_PRIVATE_KEY missing from .env!");
    process.exit(1);
  }
  const masterWallet = new ethers.Wallet(process.env.VOLUME_BOT_PRIVATE_KEY, provider);
  console.log(`Master Wallet: ${masterWallet.address}`);
  const masterBal = await provider.getBalance(masterWallet.address);
  console.log(`Master Balance: ${ethers.formatEther(masterBal)} BNB\n`);

  // 1. Load or Create Bot Wallets
  let botKeys = [];
  if (fs.existsSync("bot_wallets.json")) {
    botKeys = JSON.parse(fs.readFileSync("bot_wallets.json", "utf8"));
    botKeys = botKeys.slice(0, NUM_BOTS); // Limit to current config
    console.log(`Loaded ${botKeys.length} existing bot wallets.`);
  } else {
    console.log(`Generating ${NUM_BOTS} new burner wallets...`);
    for (let i = 0; i < NUM_BOTS; i++) {
      const w = ethers.Wallet.createRandom();
      botKeys.push(w.privateKey);
    }
    fs.writeFileSync("bot_wallets.json", JSON.stringify(botKeys, null, 2));
    console.log("Saved new bot private keys to bot_wallets.json! DO NOT SHARE THIS FILE.");
  }

  const bots = botKeys.map(key => new ethers.Wallet(key, provider));

  // 2. Fund Bots if necessary
  const fundAmount = ethers.parseEther(FUND_AMOUNT_BNB);
  for (let i = 0; i < bots.length; i++) {
    const bal = await provider.getBalance(bots[i].address);
    if (bal < ethers.parseEther("0.0002")) { // If less than 0.0002 BNB, it needs funding
      console.log(`Funding Bot ${i + 1} (${bots[i].address}) with ${FUND_AMOUNT_BNB} BNB...`);
      try {
        const tx = await masterWallet.sendTransaction({
          to: bots[i].address,
          value: fundAmount
        });
        await tx.wait(1);
        console.log(`   -> Funded successfully!`);
      } catch (e) {
        console.error(`   -> Failed to fund: ${e.message}`);
      }
    } else {
      console.log(`Bot ${i + 1} (${bots[i].address}) is already funded: ${ethers.formatEther(bal).substring(0,6)} BNB.`);
    }
  }

  console.log("\n=========================================");
  console.log("   STARTING ENDLESS TRADING LOOP         ");
  console.log("=========================================\n");

  // 3. Endless Trading Loop
  while (true) {
    try {
      // Pick a random bot
      const bot = bots[Math.floor(Math.random() * bots.length)];
      const router = new ethers.Contract(PANCAKESWAP_ROUTER, ROUTER_ABI, bot);
      const token = new ethers.Contract(CJP_TOKEN, ERC20_ABI, bot);

      const bnbBal = await provider.getBalance(bot.address);
      const cjpBal = await token.balanceOf(bot.address);

      console.log(`[Bot ${bot.address.substring(0,6)}] Preparing to trade...`);
      
      // Decide Buy or Sell based on balances
      let action = "BUY";
      if (cjpBal > 0n && bnbBal > ethers.parseEther("0.00015")) {
        // 50/50 chance if it has both
        action = Math.random() > 0.5 ? "BUY" : "SELL";
      } else if (cjpBal > 0n) {
        action = "SELL"; // Low on BNB, must sell tokens
      } else if (bnbBal < ethers.parseEther("0.00015")) {
        console.log("   -> Bot is completely out of funds. Skipping.");
        action = "SKIP";
      }

      if (action === "BUY") {
        // Buy with 10% to 30% of its BNB balance to keep it random
        const percentToSpend = getRandomInt(10, 30) / 100;
        // Keep a micro gas buffer
        const availableBnb = bnbBal - ethers.parseEther("0.00015"); 
        
        if (availableBnb > 0n) {
          const amountIn = (availableBnb * BigInt(Math.floor(percentToSpend * 100))) / 100n;
          console.log(`   -> 🟢 ACTION: BUYING CJP with ${ethers.formatEther(amountIn).substring(0,6)} BNB`);
          
          const deadline = Math.floor(Date.now() / 1000) + 60 * 5; // 5 mins
          const tx = await router.swapExactETHForTokens(
            0, // Accept any amount of CJP (dangerous in reality, fine for micro-bot)
            [WBNB_ADDRESS, CJP_TOKEN],
            bot.address,
            deadline,
            { value: amountIn }
          );
          console.log(`   -> Transaction Sent: ${tx.hash}`);
          await tx.wait(1);
          console.log(`   -> Confirmed!`);
        } else {
           console.log("   -> Not enough BNB to safely buy.");
        }

      } else if (action === "SELL") {
        // Sell 50% to 100% of its CJP tokens
        const percentToSell = getRandomInt(50, 100) / 100;
        const amountIn = (cjpBal * BigInt(Math.floor(percentToSell * 100))) / 100n;
        
        console.log(`   -> 🔴 ACTION: SELLING ${ethers.formatUnits(amountIn, 18).substring(0,8)} CJP for BNB`);

        // Check allowance
        const allowance = await token.allowance(bot.address, PANCAKESWAP_ROUTER);
        if (allowance < amountIn) {
          console.log(`   -> Approving PancakeSwap Router...`);
          const appTx = await token.approve(PANCAKESWAP_ROUTER, ethers.MaxUint256);
          await appTx.wait(1);
        }

        const deadline = Math.floor(Date.now() / 1000) + 60 * 5;
        const tx = await router.swapExactTokensForETH(
          amountIn,
          0, // Accept any BNB
          [CJP_TOKEN, WBNB_ADDRESS],
          bot.address,
          deadline
        );
        console.log(`   -> Transaction Sent: ${tx.hash}`);
        await tx.wait(1);
        console.log(`   -> Confirmed!`);
      }

    } catch (e) {
      console.error(`   -> TRADE ERROR: ${e.message}`);
    }

    // Smart Strategy: Sleep for a long time to save gas and look organic
    const sleepMinutes = getRandomInt(MIN_SLEEP_MINUTES, MAX_SLEEP_MINUTES);
    console.log(`\n💤 Bot is sleeping for ${sleepMinutes} minutes to look human...\n`);
    await sleep(sleepMinutes * 60 * 1000);
  }
}

main().catch(console.error);
