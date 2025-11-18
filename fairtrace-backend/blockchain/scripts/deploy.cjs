// scripts/deploy.cjs
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log(`🚀 Deploying contracts to network: ${hre.network.name}`);

  // --- FarmerRegistry ---
  const FarmerRegistryFactory = await hre.ethers.getContractFactory("FarmerRegistry");
  const farmerRegistry = await FarmerRegistryFactory.deploy();
  await farmerRegistry.deployed();
  console.log("✅ FarmerRegistry deployed to:", farmerRegistry.address);

  // --- ProductRegistry ---
  const ProductRegistryFactory = await hre.ethers.getContractFactory("ProductRegistry");
  const productRegistry = await ProductRegistryFactory.deploy();
  await productRegistry.deployed();
  console.log("✅ ProductRegistry deployed to:", productRegistry.address);

  // --- FairTraceTransport ---
  const FairTraceTransportFactory = await hre.ethers.getContractFactory("FairTraceTransport");
  const fairTraceTransport = await FairTraceTransportFactory.deploy();
  await fairTraceTransport.deployed();
  console.log("✅ FairTraceTransport deployed to:", fairTraceTransport.address);

  // --- Save deployment addresses ---
  const deployments = {
    network: hre.network.name,
    farmerRegistry: farmerRegistry.address,
    productRegistry: productRegistry.address,
    fairTraceTransport: fairTraceTransport.address,
  };

  const deploymentsPath = path.join(__dirname, "deployments.json");
  fs.writeFileSync(deploymentsPath, JSON.stringify(deployments, null, 2));
  console.log("📝 Deployment addresses saved to deployments.json");
}

// Run
main().catch((error) => {
  console.error(error);
  process.exit(1);
});
