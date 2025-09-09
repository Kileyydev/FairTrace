import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const Registry = await ethers.getContractFactory("FairTraceRegistry");
  const registry = await Registry.deploy();
  await registry.waitForDeployment();

  const addr = await registry.getAddress();
  console.log("✅ FairTraceRegistry deployed to:", addr);

  // Load ABI from artifact
  const artifactPath = path.join(__dirname, "../artifacts/contracts/FairTraceRegistry.sol/FairTraceRegistry.json");
  const artifactRaw = fs.readFileSync(artifactPath, "utf8");
  const artifact = JSON.parse(artifactRaw);

  const out = { address: addr, abi: artifact.abi };
  fs.writeFileSync(path.join(__dirname, "../deployedRegistry.json"), JSON.stringify(out, null, 2));

  console.log("📄 ABI + address written to deployedRegistry.json");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
