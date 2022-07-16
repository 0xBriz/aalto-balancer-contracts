import * as dotenv from "dotenv";

import { HardhatUserConfig } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";
import "@nomiclabs/hardhat-web3";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    version: "0.7.1",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      allowUnlimitedContractSize: true,
      forking: {
        url: process.env.BSC_ARCHIVE_NODE || "",
        blockNumber: 19602096,
      },
      // mining: {
      //   auto: false,
      //   interval: 2000,
      // },
    },
    server: {
      url: process.env.SERVER_NODE_RPC,
      accounts: "remote",
    },
    bsc_mainnet: {
      url: process.env.BSC_MAINNET_URL || "",
      accounts: process.env.BSC_DEV_KEY !== undefined ? [process.env.BSC_DEV_KEY] : [],
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};

export default config;
