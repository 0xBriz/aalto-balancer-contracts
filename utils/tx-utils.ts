import { ContractTransaction } from "ethers";

export async function doTransaction(txResponse: ContractTransaction) {
  try {
    return awaitTransactionComplete(await txResponse);
  } catch (error) {
    throw error;
  }
}

export async function awaitTransactionComplete(txResponse: ContractTransaction, confirmations = 2) {
  try {
    console.log(`- Starting transaction: ${txResponse.hash}`);
    console.log(`- Awaiting transaction receipt... - ` + new Date().toLocaleString());
    const txReceipt = await txResponse.wait(confirmations);
    console.log("- TransactionReceipt received - " + new Date().toLocaleString());
    if (txReceipt.status === 1) {
      // success
      console.log(`Transaction successful`);
    }
    return txReceipt;
  } catch (error) {
    throw error; // Throw and try to let this be handled back in the call stack as needed
  }
}
