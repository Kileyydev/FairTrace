// src/utils/blockchain.ts
import { ethers } from "ethers";

// Import ABIs
import FarmerRegistryJson from "@/app/abis/FarmerRegistry.json";
import ProductRegistryJson from "@/app/abis/ProductRegistry.json";
import FairTraceTransportJson from "@/app/abis/FairTraceTransport.json";
import SaccoPurchasesJson from "@/app/abis/SaccoPurchases.json";

// --- CONFIG --- //
const GANACHE_URL = "http://127.0.0.1:8545";

const FARMER_REGISTRY_ADDRESS =
  "0x8A791620dd6260079BF849Dc5567aDC3F2FdC318";
const PRODUCT_REGISTRY_ADDRESS =
  "0x610178dA211FEF7D417bC0e6FeD39F05609AD788";
const FAIRTRACE_TRANSPORT_ADDRESS =
  "0x9A9f2CCfdE556A7E9Ff0848998Aa4a0CFD8863AE";
const SACCO_PURCHASES_ADDRESS =
  "0xc3e53F4d16Ae77Db1c982e75a937B9f60FE63690";

// --- PROVIDER --- //
const provider = new ethers.JsonRpcProvider(GANACHE_URL);

// --- CONTRACT INSTANCES --- //
export let farmerRegistry: ethers.Contract;
export let productRegistry: ethers.Contract;
export let fairTraceTransport: ethers.Contract;
export let saccoPurchases: ethers.Contract;

// Signer
let signer: ethers.JsonRpcSigner;

// Prevent re-initialization
let initialized = false;

// --------------------------------------------------------
// INITIALIZATION
// --------------------------------------------------------
export async function initContracts() {
  if (initialized) return;

  try {
    // Pick first Ganache account
    signer = await provider.getSigner(0);
    const address = await signer.getAddress();
    console.log("Blockchain signer:", address);

    farmerRegistry = new ethers.Contract(
      FARMER_REGISTRY_ADDRESS,
      FarmerRegistryJson.abi,
      signer
    );

    productRegistry = new ethers.Contract(
      PRODUCT_REGISTRY_ADDRESS,
      ProductRegistryJson.abi,
      signer
    );

    fairTraceTransport = new ethers.Contract(
      FAIRTRACE_TRANSPORT_ADDRESS,
      FairTraceTransportJson.abi,
      signer
    );

    saccoPurchases = new ethers.Contract(
      SACCO_PURCHASES_ADDRESS,
      SaccoPurchasesJson.abi,
      signer
    );

    initialized = true;
    console.log("Blockchain contracts initialized successfully");
  } catch (err: any) {
    console.error("Failed to initialize contracts:", err.message);
    throw err;
  }
}

// --------------------------------------------------------
// SAFE EXPORTER FOR REACT
// --------------------------------------------------------
export function getBlockchainUtils() {
  if (!initialized) {
    console.warn("Blockchain not initialized yet. Call initContracts() first.");
    return {
      signer: null,
      farmerRegistry: null,
      productRegistry: null,
      fairTraceTransport: null,
      saccoPurchases: null,
      provider,
      initContracts,
    };
  }

  return {
    signer,
    farmerRegistry,
    productRegistry,
    fairTraceTransport,
    saccoPurchases,
    provider,
    initContracts,
  };
}

// --------------------------------------------------------
// CUSTOM SACCO PURCHASE RECORDING FUNCTION
// --------------------------------------------------------
export async function recordSaccoPurchaseOnChain(
  farmerAddress: string,
  listingId: string,
  quantity: number,
  totalPrice: number
) {
  if (!saccoPurchases || !signer) {
    throw new Error(
      "Contracts NOT initialized. Call initContracts() before calling recordSaccoPurchaseOnChain()."
    );
  }

  try {
    console.log("Recording sacco purchase on-chain...");

    const tx = await saccoPurchases.recordPurchase(
      farmerAddress,
      listingId,
      quantity,
      totalPrice
    );

    const receipt = await tx.wait();
    console.log("Purchase saved on-chain:", receipt.transactionHash);

    return receipt.transactionHash;
  } catch (err: any) {
    console.error("Blockchain recordPurchase failed:", err.message);
    throw err;
  }
}
