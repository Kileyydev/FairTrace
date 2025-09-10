import { ethers } from "hardhat";

async function main() {
  const FarmerRegistry = await ethers.getContractFactory("FarmerRegistry");
  const registry = await FarmerRegistry.deploy();

  await registry.waitForDeployment();

  console.log("✅ FarmerRegistry deployed to:", await registry.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
