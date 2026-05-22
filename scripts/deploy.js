import "dotenv/config";
import { ethers } from "ethers";
import fs from "fs";

async function main() {
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) throw new Error("PRIVATE_KEY missing from .env");

  const provider = new ethers.JsonRpcProvider(process.env.BSC_RPC_URL || "https://bsc-dataseed.binance.org/");
  const wallet = new ethers.Wallet(privateKey, provider);
  console.log("Deploying contract with account:", wallet.address);

  // Read compiled artifact
  const artifactPath = "./artifacts/contracts/CJPToken.sol/CockroachJantaParty.json";
  if (!fs.existsSync(artifactPath)) throw new Error("Compile contract first using 'npx hardhat compile'");
  
  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
  
  // Deploy
  const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);
  const contract = await factory.deploy();
  await contract.waitForDeployment();

  console.log("Cockroach Janta Party (CJP) deployed to:", await contract.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
