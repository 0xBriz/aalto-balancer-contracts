import * as dotenv from "dotenv";

import { HardhatUserConfig } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";
import "@nomiclabs/hardhat-web3";
import "@nomiclabs/hardhat-vyper";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.7.1",
        settings: {
          optimizer: {
            enabled: true,
            runs: 9999,
          },
        },
      },
      {
        version: "0.8.4",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      {
        version: "0.6.8",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
    overrides: {
      "contracts/Vault.sol": {
        version: "0.7.1",
        settings: {
          optimizer: {
            enabled: true,
            runs: 500,
          },
        },
      },
      "contracts/pool-weighted/smart/LiquidityBootstrappingPoolFactory.sol": {
        version: "0.7.1",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    },
  },
  vyper: {
    compilers: [{ version: "0.3.1" }, { version: "0.3.3" }],
  },
  networks: {
    hardhat: {
      allowUnlimitedContractSize: true,
      // forking: {
      //   url: process.env.BSC_ARCHIVE_NODE || "",
      //   blockNumber: 24643800,
      // },
      loggingEnabled: true,
      // gas: 2100000,
      // gasPrice: 8000000000,
      // mining: {
      //   auto: false,
      //   interval: 100,
      // },
    },
    bsc: {
      url: process.env.BSC_MAINNET_URL || "",
      accounts: process.env.DEV_KEY !== undefined ? [process.env.DEV_KEY] : [],
    },
    goerli: {
      url: process.env.GOERLI_RPC || "",
      accounts: process.env.DEV_KEY !== undefined ? [process.env.DEV_KEY] : [],
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  mocha: {
    timeout: 60000,
  },
};

export default config;
