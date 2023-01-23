import { Contract } from "ethers";
import { Interface } from "ethers/lib/utils";

export const actionId = (
  instance: Contract,
  method: string,
  contractInterface?: Interface
): Promise<string> => {
  const selector = (contractInterface ?? instance.interface).getSighash(method);
  return instance.getActionId(selector);
};

export function getCalldata(instance: Contract, method: string, args: any[]) {
  return instance.interface.encodeFunctionData(method, args);
}
