import { ethers } from "ethers";
import fs from "fs";
import "dotenv/config";

const TARGET_WALLET_COUNT = 100;
const MIN_SLEEP_MINUTES = 1;
const MAX_SLEEP_MINUTES = 5;

const CJP_TOKEN = "0xA9B4a901400e959CF51a89Ed928e5aDb151bD395";
const ERC20_ABI = [
  "function transfer(address to, uint256 amount) external returns (bool)",
  "function balanceOf(address account) external view returns (uint256)",
  "function totalSupply() external view returns (uint256)"
];

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function main() {
  console.log("=========================================");
  console.log("   STEALTH CJP DISTRIBUTION SCRIPT       ");
  console.log("=========================================\n");

  const provider = new ethers.JsonRpcProvider(process.env.BSC_RPC_URL || "https://bsc-dataseed.binance.org/");

  // 1. Load Whale Keys
  if (!fs.existsSync("whale_keys.json")) {
    console.error("Error: whale_keys.json not found! Please create it and paste your private keys.");
    process.exit(1);
  }
  const whaleKeys = JSON.parse(fs.readFileSync("whale_keys.json", "utf8"));
  if (whaleKeys.length === 0 || whaleKeys[0] === "PASTE_PRIVATE_KEY_1_HERE") {
    console.error("Error: Please put your actual private keys in whale_keys.json");
    process.exit(1);
  }

  // 2. Generate or Load 100 Stealth Target Wallets
  let targetAddresses = [];
  const CSV_FILE = "cjp_stealth_wallets.csv";
  
  if (fs.existsSync(CSV_FILE)) {
    console.log(`Loading existing wallets from ${CSV_FILE}...`);
    const lines = fs.readFileSync(CSV_FILE, "utf8").split("\n");
    for (let i = 1; i < lines.length; i++) { // Skip header
      if (lines[i].trim() !== "") {
        const parts = lines[i].split(",");
        targetAddresses.push(parts[0]);
      }
    }
  } else {
    console.log(`Generating ${TARGET_WALLET_COUNT} new stealth wallets...`);
    let csvContent = "Address,PrivateKey\n";
    for (let i = 0; i < TARGET_WALLET_COUNT; i++) {
      const w = ethers.Wallet.createRandom();
      csvContent += `${w.address},${w.privateKey}\n`;
      targetAddresses.push(w.address);
    }
    fs.writeFileSync(CSV_FILE, csvContent);
    console.log(`Saved 100 private keys to ${CSV_FILE}! STORE THIS FILE SAFELY.\n`);
  }

  // 3. Begin Organic Distribution
  // Total supply is 1 Billion (1,000,000,000). We want to send between 0.4% (4M) and 0.8% (8M) per transaction.
  const minSend = ethers.parseUnits("4000000", 18); // 4 Million CJP
  const maxSend = ethers.parseUnits("8000000", 18); // 8 Million CJP
  
  let targetIndex = 0;

  for (let i = 0; i < whaleKeys.length; i++) {
    const whale = new ethers.Wallet(whaleKeys[i], provider);
    const token = new ethers.Contract(CJP_TOKEN, ERC20_ABI, whale);
    
    let bnbBal = await provider.getBalance(whale.address);
    let cjpBal = await token.balanceOf(whale.address);
    
    console.log(`\n🐋 Loaded Whale ${i+1}: ${whale.address}`);
    console.log(`   BNB Balance: ${ethers.formatEther(bnbBal)} BNB`);
    console.log(`   CJP Balance: ${ethers.formatUnits(cjpBal, 18)} CJP`);

    if (bnbBal < ethers.parseEther("0.001")) {
      console.log(`   -> WARNING: This whale is extremely low on BNB. Transfers may fail!`);
    }

    while (cjpBal > 0n && targetIndex < targetAddresses.length) {
      // Calculate random send amount
      let sendAmount = minSend + (BigInt(getRandomInt(0, 100)) * (maxSend - minSend) / 100n);
      
      // If the whale has less than the random amount, just send the rest
      if (cjpBal < sendAmount) {
        sendAmount = cjpBal;
      }

      const target = targetAddresses[targetIndex];
      console.log(`   -> 📤 Sending ${ethers.formatUnits(sendAmount, 18).substring(0,8)} CJP to Stealth Wallet #${targetIndex + 1} (${target})...`);
      
      try {
        const tx = await token.transfer(target, sendAmount);
        console.log(`      Tx Hash: ${tx.hash}`);
        await tx.wait(1);
        console.log(`      Confirmed!`);
        
        cjpBal -= sendAmount;
        targetIndex++; // Move to next unfunded target wallet
        
        if (cjpBal > 0n && targetIndex < targetAddresses.length) {
          const sleepMinutes = getRandomInt(MIN_SLEEP_MINUTES, MAX_SLEEP_MINUTES);
          console.log(`      💤 Sleeping for ${sleepMinutes} minutes to look organic...\n`);
          await sleep(sleepMinutes * 60 * 1000);
        }

      } catch (err) {
        console.error(`      ERROR SENDING: ${err.message}`);
        console.log(`      This whale likely ran out of BNB for gas. Moving to next whale...`);
        break; // Exit this whale's while loop, go to the next whale
      }
    }
    
    if (targetIndex >= targetAddresses.length) {
      console.log("\n✅ All stealth target wallets have been funded!");
      break;
    }
  }

  console.log("\n🎉 Stealth Distribution complete!");
}

main().catch(console.error);
