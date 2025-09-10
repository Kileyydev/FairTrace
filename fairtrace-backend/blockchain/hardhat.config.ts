import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";
import "@nomiclabs/hardhat-etherscan";
// import { EtherscanConfig } from "@nomiclabs/hardhat-etherscan/dist/src/types";
type EtherscanConfig = {
  apiKey: string | { [network: string]: string };
  customChains?: Array<{
    network: string;
    chainId: number;
    urls: { apiURL: string; browserURL: string };
  }>;
};

dotenv.config();

interface ExtendedHardhatUserConfig extends HardhatUserConfig {
  etherscan?: EtherscanConfig;
}

const config: ExtendedHardhatUserConfig = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      type: "edr-simulated", // ✅ required in Hardhat v3
      chainId: 31337,
    },
    sepolia: {
      type: "http", // ✅ required in Hardhat v3
      url: process.env.SEPOLIA_RPC_URL || "",
      accounts: process.env.SEPOLIA_PRIVATE_KEY
        ? [process.env.SEPOLIA_PRIVATE_KEY]
        : [],
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY || "",
  },
};

export default config;
