// src/utils/blockchain.ts
import { ethers } from "ethers";

// Import ABIs
import FarmerRegistryJson from "@/app/abis/FarmerRegistry.json";
import ProductRegistryJson from "@/app/abis/ProductRegistry.json";
import FairTraceTransportJson from "@/app/abis/FairTraceTransport.json";

// --- CONFIG --- //
const GANACHE_URL = "http://127.0.0.1:8545";

const FARMER_REGISTRY_ADDRESS = "0x8A791620dd6260079BF849Dc5567aDC3F2FdC318";
const PRODUCT_REGISTRY_ADDRESS = "0x610178dA211FEF7D417bC0e6FeD39F05609AD788";
const FAIRTRACE_TRANSPORT_ADDRESS = "0x9A9f2CCfdE556A7E9Ff0848998Aa4a0CFD8863AE"; // ← UPDATE THIS!

// --- PROVIDER --- //
// Using JsonRpcProvider = ZERO MetaMask = ZERO ENS lookups = NO MORE ERRORS
const provider = new ethers.JsonRpcProvider(GANACHE_URL);

// --- CONTRACTS --- //
export let farmerRegistry: ethers.Contract;
export let productRegistry: ethers.Contract;
export let fairTraceTransport: ethers.Contract;

// --- SIGNER --- //
// Using first Hardhat/Ganache account (index 0) — safe for dev
let signer: ethers.JsonRpcSigner;

// --- Initialization Guard --- //
let initialized = false;

export async function initContracts() {
  if (initialized) return;

  try {
    // Get the first account from Ganache/Hardhat
    signer = await provider.getSigner(0);

    // Optional: Log address for debugging
    const address = await signer.getAddress();
    console.log("Blockchain signer (transporter):", address);

    // Initialize contracts
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

    initialized = true;
    console.log("Blockchain contracts initialized successfully");
  } catch (err: any) {
    console.error("Failed to initialize contracts:", err.message);
    throw err;
  }
}

// Safe getter for React components
export function getBlockchainUtils() {
  if (!initialized) {
    console.warn("Blockchain not initialized yet. Call initContracts() first.");
    return {
      signer: null,
      farmerRegistry: null,
      productRegistry: null,
      fairTraceTransport: null,
      provider,
      initContracts,
    };
  }

  return {
    signer,
    farmerRegistry,
    productRegistry,
    fairTraceTransport,
    provider,
    initContracts,
  };
}