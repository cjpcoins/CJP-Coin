import { ethers } from "ethers";
import fs from "fs";

async function main() {
  console.log("=========================================");
  console.log("   ADVANCED PREMIUM WALLET SCRAPER       ");
  console.log("=========================================\n");
  
  const provider = new ethers.JsonRpcProvider("https://bsc-dataseed.binance.org/");
  
  const TARGET_COUNT = 1000;
  const MIN_BNB_BALANCE = ethers.parseEther("0.01"); // ~ $6.00
  const MIN_TX_COUNT = 15; // At least 15 lifetime transactions
  
  const premiumWallets = new Set();
  const checkedWallets = new Set();
  
  // Get the most recent block number
  let currentBlockNumber = await provider.getBlockNumber();
  console.log(`Starting from latest block: ${currentBlockNumber}`);
  console.log(`Target: Find ${TARGET_COUNT} wallets with > 0.01 BNB and > 15 transactions.\n`);
  
  while (premiumWallets.size < TARGET_COUNT) {
    try {
      const block = await provider.getBlock(currentBlockNumber, true); // true = get full transactions
      
      if (block && block.prefetchedTransactions) {
        for (const tx of block.prefetchedTransactions) {
          const address = tx.from;
          
          if (!address || address === "0x0000000000000000000000000000000000000000") continue;
          if (checkedWallets.has(address)) continue;
          
          checkedWallets.add(address);
          
          // 1. Check Transaction Count (Nonce)
          const nonce = await provider.getTransactionCount(address);
          if (nonce < MIN_TX_COUNT) continue;
          
          // 2. Check BNB Balance
          const balance = await provider.getBalance(address);
          if (balance < MIN_BNB_BALANCE) continue;
          
          // It passed all checks!
          premiumWallets.add(address);
          console.log(`[${premiumWallets.size}/${TARGET_COUNT}] Found Premium Wallet! ${address} (Bal: ${ethers.formatEther(balance).substring(0,6)} BNB, Txs: ${nonce})`);
          
          if (premiumWallets.size >= TARGET_COUNT) break;
        }
      }
      
      // Move to the previous block
      currentBlockNumber--;
      
    } catch (error) {
      console.error(`Error processing block ${currentBlockNumber}:`, error.message);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  const walletsArray = Array.from(premiumWallets);
  
  fs.writeFileSync("premium_targets.json", JSON.stringify(walletsArray, null, 2));
  console.log(`\n✅ Successfully saved 1,000 premium BSC wallets to premium_targets.json!`);
}

main().catch(console.error);
