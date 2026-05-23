import fs from "fs";
import { ethers } from "ethers";
import "dotenv/config";

async function main() {
  const provider = new ethers.JsonRpcProvider(process.env.BSC_RPC_URL || "https://bsc-dataseed.binance.org/");
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  console.log("Deploying Airdrop Contract with the account:", wallet.address);

  const artifactStr = fs.readFileSync("./artifacts/contracts/CJPAirdrop.sol/CJPAirdrop.json", "utf8");
  const artifact = JSON.parse(artifactStr);

  const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);

  const CJP_TOKEN_ADDRESS = "0xA9B4a901400e959CF51a89Ed928e5aDb151bD395";
  const contract = await factory.deploy(CJP_TOKEN_ADDRESS);

  await contract.waitForDeployment();
  const address = await contract.getAddress();
  
  console.log("CJPAirdrop deployed to:", address);
  console.log("\n=============================================");
  console.log("NEXT STEPS:");
  console.log("1. Send exactly 50,000,000 CJP tokens to the Airdrop contract address:");
  console.log("   ->", address);
  console.log("2. Wait 1 minute for BSC to index it.");
  console.log("3. Verify the contract source code by running:");
  console.log(`   npx hardhat verify --network bsc ${address} ${CJP_TOKEN_ADDRESS}`);
  console.log("=============================================\n");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
