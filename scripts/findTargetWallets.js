import { ethers } from "ethers";
import fs from "fs";

async function main() {
  console.log("Starting Wallet Scraper...");
  
  const provider = new ethers.JsonRpcProvider("https://bsc-dataseed.binance.org/");
  
  const TARGET_COUNT = 1000;
  const uniqueWallets = new Set();
  
  // Get the most recent block number
  let currentBlockNumber = await provider.getBlockNumber();
  console.log(`Starting from latest block: ${currentBlockNumber}`);
  
  while (uniqueWallets.size < TARGET_COUNT) {
    try {
      console.log(`Scanning block ${currentBlockNumber}...`);
      const block = await provider.getBlock(currentBlockNumber, true); // true = get full transactions
      
      if (block && block.prefetchedTransactions) {
        for (const tx of block.prefetchedTransactions) {
          // The 'from' address is guaranteed to be a regular user wallet (EOA), not a smart contract.
          if (tx.from && tx.from !== "0x0000000000000000000000000000000000000000") {
            uniqueWallets.add(tx.from);
            
            if (uniqueWallets.size >= TARGET_COUNT) break;
          }
        }
      }
      
      console.log(`Found ${uniqueWallets.size}/${TARGET_COUNT} unique wallets so far...`);
      
      // Move to the previous block
      currentBlockNumber--;
      
    } catch (error) {
      console.error(`Error fetching block ${currentBlockNumber}:`, error.message);
      // Wait a bit if we hit rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  const walletsArray = Array.from(uniqueWallets);
  
  fs.writeFileSync("targets.json", JSON.stringify(walletsArray, null, 2));
  console.log(`\n✅ Successfully saved 1,000 highly active BSC wallets to targets.json!`);
}

main().catch(console.error);
