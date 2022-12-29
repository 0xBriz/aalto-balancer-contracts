import { Contract } from "ethers";

export class ContractWrapper<T> {
  private readonly contract: Contract;

  get instance() {
    return this.contract as Contract & T;
  }

  constructor(public address: string, abi: any[], signer) {
    this.contract = new Contract(address, abi, signer);
  }
}
