import { Hex, Transport } from "@flashbots/suave-viem"
import {
  SuaveTxRequestTypes,
  SuaveWallet,
  type TransactionRequestSuave,
} from "@flashbots/suave-viem/chains/utils"
import { Address, encodeAbiParameters, encodeFunctionData } from "viem"

import { suaveLocal } from "./chains/suave-local"
import { suciphus } from "./suciphus-abi"

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
  const data = encodeFunctionData({
    abi: suciphus.abi, // Use the imported ABI
    functionName: "submitPrompt",
    args: [prompt],
  })

  // Create the TransactionRequestSuave object
  const suaveTx: TransactionRequestSuave = {
    to: suciphus.address,
    data: data,
    value,
    type: SuaveTxRequestTypes.ConfidentialRequest,
    gas: 1n,
    gasPrice: 1n,
    confidentialInputs: "0x",
    kettleAddress: KETTLE_ADDRESS_LOCAL,
  }

  suaveWallet?.signTransaction(suaveTx).then((tx: Hex) => {
    console.log(tx)
  })
}
