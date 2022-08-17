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
            runs: 200, // Need to crank this up to 9999 for production
          },
        },
      },
      {
        version: "0.6.8",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200, // Need to crank this up to 9999 for production
          },
        },
      },
    ],
  },
  vyper: {
    compilers: [{ version: "0.3.1" }, { version: "0.3.3" }],
  },
  networks: {
    // hardhat: {
    //   allowUnlimitedContractSize: true,
    //   forking: {
    //     url: process.env.ETH_ARCHIVE_RPC || "",
    //     blockNumber: 15282844, // 8/5 ~10:25AM
    //   },
    //   //loggingEnabled: true,
    //   // mining: {
    //   //   auto: false,
    //   //   interval: 2000,
    //   // },
    // },
    bsc: {
      url: process.env.BSC_MAINNET_URL || "",
      accounts:
        process.env.LOTTERY_OPERATOR_KEY !== undefined ? [process.env.LOTTERY_OPERATOR_KEY] : [],
      gasPrice: 50000000000,
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
};

export default config;
