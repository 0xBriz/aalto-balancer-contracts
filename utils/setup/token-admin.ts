import { BaseContract } from "./base-contract";
import abi from "../../artifacts/contracts/liquidity-mining/BalancerTokenAdmin.sol/BalancerTokenAdmin.json";

export class BalTokenAdmin extends BaseContract {
  constructor(readonly adapter: string, address: string, signer) {
    super(address, abi.abi, signer);
  }
}
