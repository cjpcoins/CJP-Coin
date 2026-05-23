import { ethers } from "ethers";
import fs from "fs";
import "dotenv/config";

async function main() {
  console.log("=========================================");
  console.log(" CJP MASS AIRDROP SCRIPT (PREMIUM MODE)  ");
  console.log("=========================================\n");

  // Load targets
  if (!fs.existsSync("premium_targets.json")) {
    console.error("Error: premium_targets.json not found! Run the scraper script first.");
    process.exit(1);
  }
  const targets = JSON.parse(fs.readFileSync("premium_targets.json", "utf8"));
  console.log(`Loaded ${targets.length} premium target wallets.`);

  // Load progress to allow resuming
  let progress = [];
  if (fs.existsSync("premium_airdrop_progress.json")) {
    progress = JSON.parse(fs.readFileSync("premium_airdrop_progress.json", "utf8"));
    console.log(`Found previous progress: ${progress.length} premium wallets already airdropped. Resuming...`);
  }

  // Setup Wallet & Contract
  const provider = new ethers.JsonRpcProvider(process.env.BSC_RPC_URL || "https://bsc-dataseed.binance.org/");
  
  if (!process.env.AIRDROP_PRIVATE_KEY) {
    console.error("Error: Please add AIRDROP_PRIVATE_KEY to your .env file!");
    process.exit(1);
  }
  const wallet = new ethers.Wallet(process.env.AIRDROP_PRIVATE_KEY, provider);
  console.log(`Using Airdrop Wallet: ${wallet.address}`);

  const CJP_TOKEN_ADDRESS = "0xA9B4a901400e959CF51a89Ed928e5aDb151bD395";
  const abi = ["function transfer(address to, uint256 amount) returns (bool)"];
  const cjpToken = new ethers.Contract(CJP_TOKEN_ADDRESS, abi, wallet);

  const AMOUNT_TO_SEND = ethers.parseUnits("1000", 18); // 1,000 CJP

  let currentNonce = await provider.getTransactionCount(wallet.address);

  // Loop through targets
  for (let i = 0; i < targets.length; i++) {
    const targetAddress = targets[i];

    // Skip if already processed
    if (progress.includes(targetAddress)) {
      continue;
    }

    console.log(`[${i + 1}/${targets.length}] Sending 1000 CJP to ${targetAddress}...`);

    try {
      // Send transaction
      const tx = await cjpToken.transfer(targetAddress, AMOUNT_TO_SEND, { nonce: currentNonce });
      console.log(`   -> Transaction Sent: ${tx.hash}`);
      
      // Wait for confirmation to ensure reliability
      await tx.wait(1); 
      console.log(`   -> Confirmed!`);

      // Record success
      progress.push(targetAddress);
      fs.writeFileSync("premium_airdrop_progress.json", JSON.stringify(progress, null, 2));

      currentNonce++;

    } catch (error) {
      console.error(`   -> ERROR sending to ${targetAddress}:`, error.message);
      console.log("Waiting 5 seconds before retrying...");
      await new Promise(resolve => setTimeout(resolve, 5000));
      // Re-fetch nonce in case of failure
      currentNonce = await provider.getTransactionCount(wallet.address);
      // Decrement i to retry this wallet
      i--; 
    }
  }

  console.log("\n=========================================");
  console.log("   PREMIUM AIRDROP COMPLETELY FINISHED! 🚀  ");
  console.log("=========================================");
}

main().catch(console.error);
