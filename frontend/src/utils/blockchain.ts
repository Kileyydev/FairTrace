// src/utils/blockchain.ts
import { ethers } from "ethers";

// Import ABIs
import FarmerRegistryJson from "@/app/abis/FarmerRegistry.json";
import ProductRegistryJson from "@/app/abis/ProductRegistry.json";

// Connect to Ganache (with provider)
const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

// Optional: create a signer (account 0) for sending transactions
let signer: ethers.JsonRpcSigner;

// Initialize contracts asynchronously
export let farmerRegistry: ethers.Contract;
export let productRegistry: ethers.Contract;

// Your deployed contract addresses
const farmerRegistryAddress = "0x8A791620dd6260079BF849Dc5567aDC3F2FdC318";
const productRegistryAddress = "0x610178dA211FEF7D417bC0e6FeD39F05609AD788";

// Async initialization function
export async function initContracts() {
  signer = await provider.getSigner(0);

  farmerRegistry = new ethers.Contract(
    farmerRegistryAddress,
    FarmerRegistryJson.abi,
    signer
  );

  productRegistry = new ethers.Contract(
    productRegistryAddress,
    ProductRegistryJson.abi,
    signer
  );
}

export function getBlockchainUtils() {
  return {
    farmerRegistry,
    productRegistry,
    provider,
    signer,
    initContracts,
  };
}
