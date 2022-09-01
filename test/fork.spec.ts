// import * as helpers from "@nomicfoundation/hardhat-network-helpers";
// import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
// import { Contract } from "ethers";
// import { ethers, network } from "hardhat";
// import GC from "../artifacts/contracts/liquidity-mining/GaugeController.vy/GaugeController.json";
// import Mint from "../artifacts/contracts/liquidity-mining/BalancerMinter.sol/BalancerMinter.json";
// import Token from "../artifacts/contracts/liquidity-mining/governance/AequinoxToken.sol/AequinoxToken.json";
// import VA from "../artifacts/contracts/Vault.sol/Vault.json";
// import TimeAuth from "../artifacts/contracts/authorizer/TimelockAuthorizer.sol/TimelockAuthorizer.json";
// import Adapter from "../artifacts/contracts/liquidity-mining/admin/AuthorizerAdaptor.sol/AuthorizerAdaptor.json";
// import VE from "../artifacts/contracts/liquidity-mining/VotingEscrow.vy/VotingEscrow.json";
// import BA from "../artifacts/contracts/liquidity-mining/BalancerTokenAdmin.sol/BalancerTokenAdmin.json";
// import BT from "../artifacts/contracts/liquidity-mining/BalTokenHolder.sol/BALTokenHolder.json";
// import FD from "../artifacts/contracts/liquidity-mining/fee-distribution/FeeDistributor.sol/FeeDistributor.json";
// import SG from "../artifacts/contracts/liquidity-mining/gauges/SingleRecipientGauge.sol/SingleRecipientGauge.json";
// import { expect } from "chai";
// import { JsonRpcSigner } from "@ethersproject/providers";
// import { defaultAbiCoder, formatEther } from "ethers/lib/utils";

// describe("Mainnet setup", () => {
//   let AEQ: Contract;

//   let Vault: Contract;
//   let vaultAuthorizer: Contract;
//   let authAdapter: Contract;
//   let balTokenAdmin: Contract;
//   let votingEscrow: Contract;
//   let gaugeController: Contract;
//   let balMinter: Contract;
//   let singleRecipientGauge: Contract;
//   let balTokenHolder: Contract;
//   let feeDistributor: Contract;

//   let veBoost: Contract;

//   let owner: JsonRpcSigner;
//   let stakeForUser: SignerWithAddress;
//   let testPairToken: Contract;
//   let aeqBNB: Contract;
//   let weightedFactory: Contract;
//   let testRewardToken: Contract;
//   let liquidityGaugeFactory: Contract;
//   let singleRecipientFactory: Contract;

//   const TEST_ADDRESS = "0x3fF07607c5C8C619C69b1fd4C08aebF069AA10c7";
//   const GAUGES = {
//     STABLES: "0xaCC31d29022C8Eb2683597bF4c07De228Ed9EA07",
//     ASHARE_BUSD: "0x1dA7F4b2B9B644f307A313e304E1B061Eb605965",
//     VE_SINGLE_GAUGE: "0x177cA62c024Aaa0c3c65F7c8BA283b824556DAB0",
//   };

//   const gaugeAddresses = [
//     // "0x177cA62c024Aaa0c3c65F7c8BA283b824556DAB0", // VE
//     "0xaCC31d29022C8Eb2683597bF4c07De228Ed9EA07", // stables 24,402
//     "0xDA9D57cAabBe48301d71b7eEaf546B4A206118d3", // ames 10,032
//     "0x1dA7F4b2B9B644f307A313e304E1B061Eb605965", // ashare 7,588
//     "0x34EA84d3565824573073b1A63057baf57f842F02", // wbnb-busd 7,328
//     "0x00687547D75A2d1378984bE922e1450CcC89211E", // blue chips 8645
//   ];

//   beforeEach(async () => {
//     // Dev owner account
//     await helpers.impersonateAccount("0x891eFc56f5CD6580b2fEA416adC960F2A6156494");
//     owner = await ethers.provider.getSigner("0x891eFc56f5CD6580b2fEA416adC960F2A6156494");

//     AEQ = await ethers.getContractAt(
//       Token.abi,
//       "0x0dDef12012eD645f12AEb1B845Cb5ad61C7423F5",
//       owner
//     );
//     balMinter = await ethers.getContractAt(
//       Mint.abi,
//       "0x513f235C0bCCdeeecb81e2688453CAfaDf65c5e3",
//       owner
//     );
//     balTokenAdmin = await ethers.getContractAt(
//       BA.abi,
//       "0xDe3258Fce4Afe0aB38CA3A61B21ACAD802250880",
//       owner
//     );
//     gaugeController = await ethers.getContractAt(
//       GC.abi,
//       "0x585ECE7932226CCf5A259c367781F07EBBB1950F",
//       owner
//     );
//     Vault = await ethers.getContractAt(VA.abi, "0xEE1c8DbfBf958484c6a4571F5FB7b99B74A54AA7", owner);
//     vaultAuthorizer = await ethers.getContractAt(
//       TimeAuth.abi,
//       "0x7Bdc7b728cf0a45F0464B84CB90BD9beF01C5E0b",
//       owner
//     );
//     authAdapter = await ethers.getContractAt(
//       Adapter.abi,
//       "0x12fd0D8d8dA6A5c423CdcF7f6481353A5E13CfBc",
//       owner
//     );
//     votingEscrow = await ethers.getContractAt(
//       VE.abi,
//       "0x06Aba6E8F69A0Be680f96D923EFB682E63Db6a9f",
//       owner
//     );
//     balTokenHolder = await ethers.getContractAt(
//       BT.abi,
//       "0x97a1b849857bF8656fb150C45d125B0a8BAa88D0",
//       owner
//     );
//     feeDistributor = await ethers.getContractAt(
//       FD.abi,
//       "0x5215012e7509C63f4B78020b02842e930BCf0a82",
//       owner
//     );
//     singleRecipientGauge = await ethers.getContractAt(
//       SG.abi,
//       "0x177cA62c024Aaa0c3c65F7c8BA283b824556DAB0",
//       owner
//     );
//   });

//   //   it("should mint tokens to users", async () => {
//   //     // minter should mint users token based on user integrate_fraction from the gauge
//   //     const adminAdapter = await ethers.getContractAt(
//   //       Adapter.abi,
//   //       await balTokenAdmin.getAuthorizer()
//   //     );
//   //     const adminId = await adminAdapter.getActionId(
//   //       balTokenAdmin.interface.getSighash("mint(address, uint256)")
//   //     );

//   //     await vaultAuthorizer.grantPermissions([adminId], balMinter.address, [balTokenAdmin.address]);

//   //     // // Gauges and data are live and in place
//   //     // // need to.. check rewards (mintFor()) for user?
//   //     await helpers.stopImpersonatingAccount("0x891eFc56f5CD6580b2fEA416adC960F2A6156494");
//   //     await helpers.impersonateAccount(TEST_ADDRESS);
//   //     const dude = await ethers.provider.getSigner(TEST_ADDRESS);

//   //     // Should be big.. or too big
//   //     // const fml = await balMinter.connect(dude).callStatic.mint(GAUGES.STABLES);
//   //     // console.log(formatEther(fml));

//   //     // for (const addy of gaugeAddresses) {
//   //     //   const fml = await balMinter.connect(dude).callStatic.mint(addy);
//   //     //   console.log(formatEther(fml));
//   //     // }

//   //     // Use id to give vault approval for minter
//   //     // steps:
//   //     // approve minter to call mint on admin contract
//   //     // user deposit in gauge
//   //     // fast forward stuff
//   //     // user should be able to be minted for
//   //     expect(true).to.be.true;
//   //   });

//   it("should not end us", async () => {
//     const id = await authAdapter.getActionId(
//       singleRecipientGauge.interface.getSighash("checkpoint()")
//     );
//     await vaultAuthorizer.grantPermissions([id], "0x891eFc56f5CD6580b2fEA416adC960F2A6156494", [
//       singleRecipientGauge.address,
//     ]);
//     const calldata = singleRecipientGauge.interface.encodeFunctionData("checkpoint");
//     console.log(calldata);

//     const expectedResult = defaultAbiCoder.encode(["bool"], [true]);
//     const result = await authAdapter.callStatic.performAction(
//       singleRecipientGauge.address,
//       calldata
//     );
//     expect(expectedResult).to.eq(result);
//   });
// });
