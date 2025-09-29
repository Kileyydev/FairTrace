import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  // 👇 Point to the artifact JSON
  const artifactPath = path.join(
    __dirname,
    "../artifacts/contracts/ProductRegistry.sol/ProductRegistry.json"
  );
  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

  const contractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"; // 👈 replace with your deployed address
  const [signer] = await ethers.getSigners(); // just to attach provider

  const ProductRegistry = new ethers.Contract(
    contractAddress,
    artifact.abi,
    signer
  );

  const owner = await ProductRegistry.owner();
  console.log("👑 Contract Owner:", owner);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
