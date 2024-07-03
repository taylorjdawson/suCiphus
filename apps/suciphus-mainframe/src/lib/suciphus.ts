import { Hex, Transport } from "@flashbots/suave-viem"
import {
  SuaveTxRequestTypes,
  SuaveWallet,
  parseTransactionSuave,
  type TransactionRequestSuave,
} from "@flashbots/suave-viem/chains/utils"
import { Address, encodeAbiParameters, encodeFunctionData } from "@flashbots/suave-viem"

import { suaveLocal } from "./chains/suave-local"
import { suciphus as suciphusDeployment } from "@repo/suciphus-suapp/dist/suciphus"
import suciphus from "@repo/suciphus-suapp/out/Suciphus.sol/Suciphus.json"

const KETTLE_ADDRESS_LOCAL = "0xB5fEAfbDD752ad52Afb7e1bD2E40432A485bBB7F"
const KETTLE_ADDRESS_RIGIL = "0x03493869959C866713C33669cA118E774A30A0E5"

export const submitPrompt = async (
  prompt: string,

  {
    account,
    value,
    suaveWallet,
  }: {
    account: Address
    value: bigint
    suaveWallet: SuaveWallet<Transport>
  }
) => {
  // Encode the function data for the contract call
  // const data = encodeFunctionData({
  //   abi: suciphus.abi, // Use the imported ABI
  //   functionName: "submitPrompt",
  //   args: [prompt],
  // })

  const data = encodeFunctionData({
    abi: suciphus.abi, // Use the imported ABI
    functionName: "example",
  })

  // Create the TransactionRequestSuave object
  // const suaveTx: TransactionRequestSuave = {
  //   to: suciphus.address,
  //   data: data,
  //   value,
  //   type: SuaveTxRequestTypes.ConfidentialRequest,
  //   gas: 9000000n,
  //   gasPrice: 1000000000n,
  //   confidentialInputs: "0x",
  //   kettleAddress: KETTLE_ADDRESS_LOCAL,
  // }

  console.warn("suciphusDeployment.address", suciphusDeployment.address)
  const suaveTx: TransactionRequestSuave = {
    confidentialInputs: "0x",
    kettleAddress: KETTLE_ADDRESS_LOCAL, // Use 0x03493869959C866713C33669cA118E774A30A0E5 on Rigil.
    to: suciphusDeployment.address,
    gas: 100000n,
    type: "0x43",
    chainId: 16813125, // chain id of local SUAVE devnet and Rigil
    data,
  }

  const tx = await suaveWallet.signTransaction(suaveTx)
  console.log(tx)
  console.log("parsed signed tx", parseTransactionSuave(tx))
  return await suaveWallet.sendRawTransaction({ serializedTransaction: tx })
  
  // return await suaveWallet.sendTransaction(suaveTx)
}
