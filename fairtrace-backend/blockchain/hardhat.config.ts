import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  networks: {
    localhost: {
      type: "http",
      url: "http://127.0.0.1:8545"
    },
    sepolia: {
      type: "http",
      url: "https://sepolia.infura.io/v3/YOUR_INFURA_KEY", // replace with your Infura or Alchemy URL
      accounts: ["0xYOUR_PRIVATE_KEY"] // replace with MetaMask private key (without 0x if needed)
    }
  }
};

export default config;
