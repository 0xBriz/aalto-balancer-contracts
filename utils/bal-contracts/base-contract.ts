import { Contract } from "ethers";

export class BaseContract {
  readonly contract: Contract;

  constructor(readonly address: string, abi: any[], signer) {
    this.contract = new Contract(address, abi, signer);
  }
}
