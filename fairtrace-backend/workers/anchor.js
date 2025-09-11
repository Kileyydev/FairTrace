import { ethers } from "ethers";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
dotenv.config();

const RPC = process.env.RPC_URL || "http://127.0.0.1:7545";
const PK = process.env.SERVER_PRIVATE_KEY;
const CONTRACT_PATH = path.join(process.cwd(), "frontend", "contracts", "ProductRegistry.json");
const contractJson = JSON.parse(fs.readFileSync(CONTRACT_PATH, "utf8"));

const provider = new ethers.JsonRpcProvider(RPC);
const wallet = new ethers.Wallet(PK, provider);
const contract = new ethers.Contract(process.env.PRODUCT_REGISTRY_ADDRESS || contractJson.address, contractJson.abi, wallet);

async function anchor(pid, recordHash) {
  // recordHash must be bytes32 (0x...)
  const tx = await contract.anchorProduct(wallet.address, pid, recordHash);
  const receipt = await tx.wait();
  console.log("Anchored tx:", receipt.transactionHash);
  return receipt.transactionHash;
}

// Allow running via CLI: node workers/anchor.js <pid> <recordHash>
if (process.argv.length >= 4) {
  const pid = process.argv[2];
  const recordHash = process.argv[3];
  anchor(pid, recordHash).then(tx => console.log(tx)).catch(err => console.error(err));
}

export { anchor };
