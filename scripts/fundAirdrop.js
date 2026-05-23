import { ethers } from "ethers";
import "dotenv/config";

async function main() {
  const provider = new ethers.JsonRpcProvider(process.env.BSC_RPC_URL || "https://bsc-dataseed.binance.org/");
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  const CJP_TOKEN_ADDRESS = "0xA9B4a901400e959CF51a89Ed928e5aDb151bD395";
  const AIRDROP_ADDRESS = "0x1ADAb32DbD361185A1209827BdB6E4E4Ac3441A0";
  
  const AMOUNT_TO_FUND = ethers.parseUnits("50000000", 18); // 50 Million CJP

  const abi = ["function transfer(address to, uint256 amount) returns (bool)"];
  const cjpToken = new ethers.Contract(CJP_TOKEN_ADDRESS, abi, wallet);

  console.log(`Funding Airdrop Contract with 50,000,000 CJP...`);
  const tx = await cjpToken.transfer(AIRDROP_ADDRESS, AMOUNT_TO_FUND);
  console.log("Transaction sent! Hash:", tx.hash);
  
  await tx.wait();
  console.log("Successfully funded the Airdrop Contract!");
}

main().catch(console.error);
