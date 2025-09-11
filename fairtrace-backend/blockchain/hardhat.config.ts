import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
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
      chainId: 31337, // ✅ no "type" in v2
    },
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "",
      accounts: process.env.SEPOLIA_PRIVATE_KEY
        ? [process.env.SEPOLIA_PRIVATE_KEY]
        : [],
    },

    ganache: {
    url: "http://127.0.0.1:7545",
    accounts: [
      "0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d",
      "0x6cbed15c793ce57650b9877cf6fa156fbef513c4e6134f022a85b1ffdd59b2a1",
      "0x6370fd033278c143179d81c5526140625662b8daa446c22ee2d73db3707e620c",
      // … add more if needed
    ],
  },
  },

  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY || "", // ✅ supported in v2
  },

};

export default config;
