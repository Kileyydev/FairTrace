// scripts/deploy.ts
import { ethers, network } from "hardhat";
import fs from "fs";

async function main() {
  console.log(`🚀 Deploying contracts to network: ${network.name}`);

  // Deploy FarmerRegistry
  const FarmerRegistry = await ethers.getContractFactory("FarmerRegistry");
  const farmerRegistry = await FarmerRegistry.deploy();
  await farmerRegistry.waitForDeployment();
  const farmerRegistryAddress = await farmerRegistry.getAddress();
  console.log("✅ FarmerRegistry deployed to:", farmerRegistryAddress);

  // Deploy ProductRegistry
  const ProductRegistry = await ethers.getContractFactory("ProductRegistry");
  const productRegistry = await ProductRegistry.deploy();
  await productRegistry.waitForDeployment();
  const productRegistryAddress = await productRegistry.getAddress();
  console.log("✅ ProductRegistry deployed to:", productRegistryAddress);

  // Save addresses to a file
  const deployments = {
    network: network.name,
    farmerRegistry: farmerRegistryAddress,
    productRegistry: productRegistryAddress,
  };

  fs.writeFileSync("deployments.json", JSON.stringify(deployments, null, 2));
  console.log("📝 Deployment addresses saved to deployments.json");
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
});
