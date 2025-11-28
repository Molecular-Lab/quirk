import hardhatToolboxViemPlugin from "@nomicfoundation/hardhat-toolbox-viem";
import { defineConfig, configVariable } from "hardhat/config";

import '@nomicfoundation/hardhat-ethers'
import '@nomicfoundation/hardhat-verify'

export default defineConfig({
  plugins: [hardhatToolboxViemPlugin],
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
      type: "edr-simulated",
      chainType: "l1",
      chainId: 31337,
    },
    localhost: {
      type: "http",
      chainType: "l1",
      url: "http://127.0.0.1:8545",
    },
    sepolia: {
      type: "http",
      chainType: "l1",
      url: configVariable("SEPOLIA_RPC_URL"),
      accounts: [configVariable("DEPLOYER_PRIVATE_KEY")],
      chainId: 11155111,
    },
    baseSepolia: {
      type: "http",
      chainType: "l1",
      url: "https://sepolia.base.org",
      accounts: [configVariable("DEPLOYER_PRIVATE_KEY")],
      chainId: 84532,
    },
  },
  etherscan: {
    apiKey: {
      sepolia: configVariable("ETHERSCAN_API_KEY"),
      baseSepolia: configVariable("ETHERSCAN_API_KEY"), // Use same key for both
    },
    customChains: [
      {
        network: "baseSepolia",
        chainId: 84532,
        urls: {
          apiURL: "https://api-sepolia.basescan.org/api",
          browserURL: "https://sepolia.basescan.org",
        },
      },
    ],
  },
  verify: {
    etherscan: {
      apiKey: configVariable("ETHERSCAN_API_KEY"),
      enabled: true,
    },
  },
});
